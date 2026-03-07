# ヘルプデスクエージェント デモシステム — 詳細設計書

## 1. システムアーキテクチャ

### 全体構成図

```
┌──────────────┐    ┌──────────────────────┐    ┌──────────────┐
│ ユーザー画面   │    │   FastAPI バックエンド  │    │ オペレーター画面│
│  (Next.js)   │    │                      │    │  (Next.js)   │
│              │    │                      │    │              │
│ フォーム送信 ──────> POST /api/inquiries   │    │              │
│              │    │   |                  │    │              │
│「受付しました」│<── job_id 返却          │    │ 新着通知      │
│              │    │   |                  │    │              │
│              │    │ Agent実行(SSE) ─────────> 進捗リアルタイム│
│              │    │   |                  │    │ - 計画作成    │
│              │    │   |                  │    │ - ツール選択  │
│              │    │   |                  │    │ - 検索実行    │
│              │    │   |                  │    │ - 回答生成    │
│              │    │   |                  │    │ - リフレクション│
│              │    │   |                  │    │ - リトライ    │
│              │    │   v                  │    │              │
│              │    │ 信頼度判定            │    │              │
│              │    │   |                  │    │              │
│              │    │   ├─ 高 → 自動承認    │    │              │
│              │    │   ├─ 中 → 確認依頼 ────────> [承認/編集]  │
│              │    │   └─ 低 → エスカレート │    │              │
│              │    │   |                  │    │              │
│              │    │ 承認時: QA 自動蓄積   │    │              │
│ 回答が届く  <──── 回答送信              │    │              │
└──────────────┘    └──────────────────────┘    └──────────────┘
                         |          |
                  ┌──────┘          └──────┐
                  v                        v
           ┌─────────────┐         ┌─────────────┐
           │Elasticsearch │         │    Qdrant    │
           │(キーワード検索)│         │(ベクトル検索) │
           └─────────────┘         └──────┬──────┘
                  |                       ^
           ┌──────v──────┐                |
           │   SQLite     │         フィードバック
           │(問い合わせ管理)│         ループ
           │(蓄積QAペア)  │─────────┘
           └─────────────┘
  承認された回答は QA ペアとして SQLite に保存され、
  Qdrant にベクトル登録される（次回以降の類似検索に活用）
```

### 技術スタック

| レイヤー | 技術 | 理由 |
|---|---|---|
| フロントエンド | Next.js 15 (App Router) | SSR + SSE 対応。React エコシステム |
| UIライブラリ | shadcn/ui + Tailwind CSS | 高品質なUI を素早く構築 |
| バックエンド | FastAPI | 非同期対応、SSE との相性、型安全 |
| エージェント | LangGraph + OpenAI API | サイクルグラフによるリフレクション・リトライ |
| 全文検索 | Elasticsearch + kuromoji | 日本語マニュアル検索 |
| ベクトル検索 | Qdrant | 過去QA の類似検索 |
| DB | SQLite (aiosqlite) | デモ用途に十分。セットアップ不要 |
| リバースプロキシ | Caddy | Let's Encrypt 自動HTTPS |
| コンテナ | Docker Compose | ワンコマンドで全サービス起動 |

---

## 2. LangGraph エージェント設計

### 2.1 グラフ構造

```
                    ┌─────────┐
                    │ planner │  質問をサブタスクに分解
                    └────┬────┘
                         v
                ┌────────────────┐
            ┌──>│ tool_selector  │  サブタスクに最適なツールを選択
            │   └───────┬────────┘
            │           v
            │   ┌───────────────┐
            │   │   searcher    │  ES or Qdrant で検索実行
            │   └───────┬───────┘
            │           v
            │   ┌───────────────┐
            │   │   answerer    │  検索結果をもとに回答生成
            │   └───────┬───────┘
            │           v
            │   ┌───────────────┐
  リトライ   │   │  reflector    │  回答品質を自己評価
  (最大3回)  │   └───────┬───────┘
            │           |
            │     ┌─────┴─────┐
            │     │           │
            │  不十分        十分
            │     │           │
            └─────┘           v
                      ┌─────────────┐
                      │ integrator  │  サブタスク結果を統合 → 最終回答
                      └─────────────┘
```

### 2.2 各ノードの責務

| ノード | 入力 | 出力 | 説明 |
|---|---|---|---|
| `planner` | 質問文 | サブタスク一覧 | 質問を独立したサブタスクに分解 |
| `tool_selector` | サブタスク | ツール名 + 検索クエリ | 質問の性質に応じて検索戦略を選択 |
| `searcher` | ツール名 + クエリ | 検索結果 | ES キーワード検索 or Qdrant ベクトル検索を実行 |
| `answerer` | 検索結果 + サブタスク | 回答テキスト | 検索結果からサブタスクの回答を生成 |
| `reflector` | 回答 + 検索結果 | 評価結果 (十分/不十分) | 回答の正確性・網羅性を自己評価。不十分なら別クエリでリトライ |
| `integrator` | 全サブタスクの回答 | 最終回答ドラフト | サブタスク結果を統合し、一貫した最終回答を生成 |

### 2.3 適応的検索戦略

`tool_selector` が質問の性質に応じてツールを動的に選択する。

| 質問の性質 | 選択されるツール | 理由 |
|---|---|---|
| 具体的な用語を含む（「パスワード 文字数」） | `search_xyz_manual` (ES) | キーワード一致が有効 |
| 曖昧・自然言語的（「ログインできない」） | `search_xyz_qa` (Qdrant) | 意味的類似度が有効 |
| 1回目で不十分 | 別ツールに切り替えてリトライ | 相互補完 |

### 2.4 リフレクションの判定基準

```python
def reflect(answer: str, search_results: list, subtask: str) -> ReflectionResult:
    """
    以下の観点で回答を評価:
    1. 検索結果に根拠があるか（ハルシネーション防止）
    2. サブタスクの質問に過不足なく答えているか
    3. 情報が具体的か（「〜の可能性があります」のような曖昧表現がないか）
    """
```

---

## 3. API 設計

### エンドポイント一覧

| メソッド | パス | 説明 |
|---|---|---|
| `POST` | `/api/inquiries` | 問い合わせを受付し、エージェント処理を開始 |
| `GET` | `/api/inquiries` | 問い合わせ一覧を取得（オペレーター用） |
| `GET` | `/api/inquiries/{id}` | 問い合わせ詳細を取得 |
| `GET` | `/api/inquiries/{id}/stream` | SSE でエージェント処理の進捗をストリーム |
| `PATCH` | `/api/inquiries/{id}` | 回答の編集・ステータス変更（承認/却下） |
| `GET` | `/api/health` | ヘルスチェック |

### リクエスト/レスポンス定義

```python
# POST /api/inquiries
# Request
{
    "question": "パスワードの文字制限について教えてください",
    "user_name": "田中太郎"           # optional
}

# Response (202 Accepted)
{
    "id": "inq_abc123",
    "status": "processing",
    "created_at": "2026-03-07T18:39:00Z"
}
```

```python
# GET /api/inquiries/{id}/stream (SSE)
# イベントストリーム — エージェントの各ノード実行をリアルタイム配信

# 計画フェーズ
data: {"step": "plan", "subtasks": ["パスワード文字制限の調査", "通知制限の調査"]}

# サブタスク1: 1回で成功
data: {"step": "subtask", "index": 0, "status": "tool_selection", "tool": "search_xyz_manual", "reason": "具体的なキーワードを含むため ES 検索を選択"}
data: {"step": "subtask", "index": 0, "status": "searching", "query": "パスワード 文字制限"}
data: {"step": "subtask", "index": 0, "status": "answering"}
data: {"step": "subtask", "index": 0, "status": "reflecting", "is_completed": true, "confidence": 1.0}

# サブタスク2: リトライ発生
data: {"step": "subtask", "index": 1, "status": "tool_selection", "tool": "search_xyz_qa", "reason": "曖昧な質問のため Qdrant を選択"}
data: {"step": "subtask", "index": 1, "status": "searching", "query": "通知の設定制限"}
data: {"step": "subtask", "index": 1, "status": "answering"}
data: {"step": "subtask", "index": 1, "status": "reflecting", "is_completed": false, "reason": "検索結果に十分な情報がない"}
data: {"step": "subtask", "index": 1, "status": "retrying", "attempt": 2, "tool": "search_xyz_manual", "reason": "ES 検索に切り替え"}
data: {"step": "subtask", "index": 1, "status": "searching", "query": "通知 設定 上限"}
data: {"step": "subtask", "index": 1, "status": "answering"}
data: {"step": "subtask", "index": 1, "status": "reflecting", "is_completed": true, "confidence": 0.6}

# 統合・完了
data: {"step": "integrating"}
data: {"step": "done", "draft_answer": "お世話になっております...", "confidence": 0.8}
```

```python
# PATCH /api/inquiries/{id}
# Request (承認)
{
    "status": "approved",
    "final_answer": "お世話になっております..."  # 編集後の回答
}

# Request (却下)
{
    "status": "rejected"
}
```

```python
# GET /api/inquiries
# Response
{
    "inquiries": [
        {
            "id": "inq_abc123",
            "question": "パスワードの文字制限...",
            "status": "draft",        # pending / processing / draft / auto_approved / approved / rejected / escalated
            "confidence": 0.8,
            "created_at": "2026-03-07T18:39:00Z"
        }
    ]
}
```

---

## 4. データベース設計

### テーブル定義 (SQLite)

```sql
CREATE TABLE inquiries (
    id TEXT PRIMARY KEY,              -- "inq_" + UUID
    question TEXT NOT NULL,           -- 問い合わせ内容
    user_name TEXT DEFAULT '匿名',    -- ユーザー名
    status TEXT DEFAULT 'pending',    -- pending / processing / draft / auto_approved / approved / rejected / escalated
    draft_answer TEXT,                -- エージェント生成の回答ドラフト
    final_answer TEXT,                -- オペレーター承認後の最終回答
    confidence REAL,                  -- 信頼度 (0.0 - 1.0)
    plan JSON,                        -- 計画（サブタスク一覧）
    agent_result JSON,               -- AgentResult をまるごと保存
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP            -- 回答送信日時
);

-- フィードバックループ: 承認された回答を QA ペアとして蓄積
CREATE TABLE qa_pairs (
    id TEXT PRIMARY KEY,              -- "qa_" + UUID
    question TEXT NOT NULL,           -- 元の問い合わせ
    answer TEXT NOT NULL,             -- 承認された最終回答
    source TEXT DEFAULT 'agent_approved',  -- 'agent_approved' / 'manual'
    inquiry_id TEXT,                  -- 元の問い合わせID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
);
```

### ステータス遷移

```
                          ┌─ 信頼度 >= 0.9 → auto_approved → (回答送信 + QA蓄積)
pending → processing → draft
                          ├─ 信頼度 0.5〜0.89 → オペレーター確認
                          │    ├─ approved → (回答送信 + QA蓄積)
                          │    └─ rejected
                          │
                          └─ 信頼度 < 0.5 → escalated → (上位担当者へ通知)
```

### フィードバックループ

承認時（`approved` / `auto_approved`）に自動実行:
1. `qa_pairs` テーブルに質問+最終回答を保存
2. Qdrant にベクトル登録
3. 次回以降の類似質問検索で参照される

```python
# PATCH /api/inquiries/{id} で承認時
if status in ("approved", "auto_approved"):
    await qa_repo.create(
        question=inquiry.question,
        answer=final_answer,
        source="agent_approved",
        inquiry_id=inquiry.id,
    )
    await qdrant_client.upsert(
        collection_name="qa_pairs",
        points=[PointStruct(id=qa_id, vector=embed(question + answer), payload={...})],
    )
```

---

## 5. ディレクトリ構成

```
helpdesk-agent-demo/
├── docker-compose.yml              # ローカル開発用
├── docker-compose.prod.yml         # 本番デプロイ用
├── Caddyfile                       # リバースプロキシ設定
├── .env.example                    # 環境変数テンプレート
├── README.md                       # ポートフォリオ説明
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   │
│   ├── api/
│   │   ├── main.py                 # FastAPI アプリケーション
│   │   ├── schemas.py              # リクエスト/レスポンス定義
│   │   ├── dependencies.py         # DI（Settings, Agent の初期化）
│   │   └── routes/
│   │       ├── inquiries.py        # 問い合わせ CRUD + SSE
│   │       └── health.py           # ヘルスチェック
│   │
│   ├── src/
│   │   ├── agent.py                # HelpDeskAgent (LangGraph)
│   │   ├── configs.py              # Settings
│   │   ├── models.py               # Pydantic モデル
│   │   ├── prompts.py              # プロンプト定義
│   │   ├── custom_logger.py        # ロガー
│   │   └── tools/
│   │       ├── search_xyz_manual.py  # ES キーワード検索
│   │       └── search_xyz_qa.py      # Qdrant ベクトル検索
│   │
│   ├── db/
│   │   ├── database.py             # SQLite 接続管理
│   │   └── repository.py           # CRUD 操作 (inquiries + qa_pairs)
│   │
│   ├── scripts/
│   │   └── create_index.py         # 初期データ投入スクリプト
│   │
│   └── data/                       # マニュアルPDF・QA CSV
│       ├── manual/
│       └── qa/
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   │
│   └── app/
│       ├── layout.tsx              # 共通レイアウト
│       │
│       ├── user/
│       │   └── page.tsx            # ユーザー問い合わせフォーム
│       │
│       ├── operator/
│       │   ├── page.tsx            # オペレーターダッシュボード
│       │   └── [id]/
│       │       └── page.tsx        # 問い合わせ詳細
│       │
│       └── components/
│           ├── InquiryForm.tsx     # 問い合わせフォーム
│           ├── InquiryResult.tsx   # 受付完了 + 回答表示
│           ├── AgentProgress.tsx   # エージェント進捗表示 (SSE 受信)
│           ├── DraftEditor.tsx     # 回答ドラフト編集
│           ├── InquiryList.tsx     # 問い合わせ一覧
│           └── ConfidenceBadge.tsx # 信頼度バッジ
│
└── .docker/
    └── Dockerfile                  # Elasticsearch (kuromoji 入り)
```

---

## 6. 主要コンポーネントの実装方針

### 6.1 SSE によるリアルタイム進捗配信

```python
# backend/api/routes/inquiries.py

from sse_starlette.sse import EventSourceResponse

@router.get("/inquiries/{inquiry_id}/stream")
async def stream_inquiry(inquiry_id: str):
    return EventSourceResponse(agent_event_generator(inquiry_id))

async def agent_event_generator(inquiry_id: str):
    inquiry = await inquiry_repo.get(inquiry_id)
    agent = HelpDeskAgent(settings=settings, tools=[...])
    app = agent.create_graph()

    for event in app.stream({"question": inquiry.question, "current_step": 0}):
        for node_name, output in event.items():
            yield {
                "event": node_name,
                "data": json.dumps(format_event(node_name, output), ensure_ascii=False)
            }

    # エージェント完了後、信頼度に基づいてルーティング
    confidence = calc_confidence(result.subtasks)
    await inquiry_repo.update_draft(inquiry_id, result.last_answer, confidence)

    if confidence >= 0.9:
        await auto_approve(inquiry_id, result.last_answer)
        yield {"event": "auto_approved", "data": json.dumps({"confidence": confidence})}
    elif confidence < 0.5:
        await escalate(inquiry_id)
        yield {"event": "escalated", "data": json.dumps({"confidence": confidence})}
    else:
        yield {"event": "done", "data": json.dumps({"confidence": confidence})}
```

### 6.2 信頼度の算出

```python
def calc_confidence(subtasks: list[Subtask]) -> float:
    """リフレクション結果から信頼度を算出する"""
    scores = []
    for subtask in subtasks:
        if subtask.is_completed and subtask.challenge_count == 1:
            scores.append(1.0)   # 1回で解決 -> 高信頼
        elif subtask.is_completed:
            scores.append(0.6)   # リトライで解決 -> 中信頼
        else:
            scores.append(0.0)   # 未解決
    return sum(scores) / len(scores) if scores else 0.0
```

### 6.3 フロントエンドの SSE 受信

```typescript
// frontend/app/components/AgentProgress.tsx

function useAgentStream(inquiryId: string) {
    const [steps, setSteps] = useState<AgentStep[]>([]);

    useEffect(() => {
        const source = new EventSource(
            `${API_URL}/api/inquiries/${inquiryId}/stream`
        );
        source.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setSteps((prev) => [...prev, data]);
        };
        source.addEventListener("done", () => source.close());
        source.addEventListener("auto_approved", () => source.close());
        source.addEventListener("escalated", () => source.close());
        return () => source.close();
    }, [inquiryId]);

    return steps;
}
```

### 6.4 OpenAI API コスト対策

```python
DAILY_LIMIT = 50

@router.post("/inquiries", status_code=202)
async def create_inquiry(request: AskRequest):
    today_count = await inquiry_repo.count_today()
    if today_count >= DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="本日の利用上限に達しました。明日以降にお試しください。"
        )
    ...
```

---

## 7. デプロイ構成

### ホスティング先

**Hetzner Cloud CAX21** (ARM / 4vCPU / 8GB RAM / 80GB SSD)
- 月額: 約 7 EUR (約 1,100 円)
- リージョン: ヨーロッパ (デモ用途なのでレイテンシは許容)

### Caddyfile

```
helpdesk-demo.example.com {
    handle /api/* {
        reverse_proxy backend:8000
    }
    handle {
        reverse_proxy frontend:3000
    }
}
```

### デプロイ手順

```bash
# 1. VPS にSSH接続
ssh root@<server-ip>

# 2. Docker インストール
curl -fsSL https://get.docker.com | sh

# 3. リポジトリをクローン
git clone https://github.com/<username>/helpdesk-agent-demo.git
cd helpdesk-agent-demo

# 4. 環境変数を設定
cp .env.example .env
vi .env  # OPENAI_API_KEY 等を設定

# 5. 起動
docker compose -f docker-compose.prod.yml up -d

# 6. インデックス作成（初回のみ）
docker compose exec backend python -m scripts.create_index
```

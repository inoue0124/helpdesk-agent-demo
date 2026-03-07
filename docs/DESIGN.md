# AI Agent Demo Portfolio — 詳細設計書

## 1. 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│                                                         │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Helpdesk│ │Data Anlys│ │Marketing │ │  Proposal  │  │
│  │  Agent  │ │  Agent   │ │  Agent   │ │   Agent    │  │
│  │  画面   │ │  画面    │ │  画面    │ │   画面     │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       └───────────┴────────────┴──────────────┘         │
│                         │ SSE                           │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                  FastAPI Backend                        │
│                         │                               │
│  ┌──────────────────────┴──────────────────────────┐    │
│  │              /api/{agent_type}/...               │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                               │
│  ┌──────────┐ ┌─────────┴──┐ ┌──────────┐ ┌─────────┐  │
│  │ Helpdesk │ │Data Anlys  │ │Marketing │ │Proposal │  │
│  │  Agent   │ │  Agent     │ │  Agent   │ │ Agent   │  │
│  │(LangGraph│ │(LangGraph) │ │(LangGraph│ │(LangGr.)│  │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └────┬────┘  │
│       │              │            │             │       │
│  ┌────┴────┐    ┌────┴────┐   (LLM only)  ┌────┴────┐  │
│  │ES+Qdrant│    │E2B Sbox │               │Web Search│  │
│  └─────────┘    └─────────┘               └─────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              SQLite (共通 DB)                    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 2. 技術スタック

| レイヤー | 技術 | 理由 |
|---|---|---|
| フロントエンド | Next.js 15 (App Router) | SSR + SSE 対応 |
| UI | shadcn/ui + Tailwind CSS | 高品質な UI を素早く構築 |
| バックエンド | FastAPI | 非同期対応、SSE との相性 |
| エージェント | LangGraph + OpenAI API | サイクルグラフ、マルチエージェント |
| 全文検索 | Elasticsearch + kuromoji | 問い合わせエージェント用 |
| ベクトル検索 | Qdrant | 問い合わせエージェント用 |
| コード実行 | E2B Sandbox | データ分析エージェント用 |
| Web 検索 | Tavily API | 提案資料エージェント用 |
| DB | SQLite (aiosqlite) | 全エージェント共通 |
| コンテナ | Docker Compose | ワンコマンド起動 |
| リバースプロキシ | Caddy | 自動 HTTPS（本番） |

## 3. API 設計（共通パターン）

各エージェントは統一的な API パターンに従う:

```
POST   /api/{agent_type}/sessions          セッション作成 + 処理開始
GET    /api/{agent_type}/sessions/{id}      セッション詳細取得
GET    /api/{agent_type}/sessions/{id}/stream  SSE ストリーム
POST   /api/{agent_type}/sessions/{id}/messages  追加メッセージ送信（会話型）
```

### エージェント別の追加エンドポイント

| エージェント | 追加 API |
|---|---|
| helpdesk | `GET /api/helpdesk/inquiries` (オペレーター一覧), `PATCH /api/helpdesk/inquiries/{id}` (承認/却下) |
| data-analysis | `POST /api/data-analysis/upload` (CSV アップロード) |
| marketing | なし（会話型のみ） |
| proposal | なし（標準パターンで完結） |

## 4. ディレクトリ構成

```
helpdesk-agent-demo/
├── docker-compose.yml
├── docker-compose.prod.yml
├── Caddyfile
├── .env.example
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   │
│   ├── api/
│   │   ├── main.py                     # FastAPI アプリ
│   │   ├── dependencies.py             # 共通 DI
│   │   └── routes/
│   │       ├── health.py
│   │       ├── helpdesk.py             # 問い合わせ API
│   │       ├── data_analysis.py        # データ分析 API
│   │       ├── marketing.py            # マーケティング API
│   │       └── proposal.py             # 提案資料 API
│   │
│   ├── agents/
│   │   ├── helpdesk/
│   │   │   ├── agent.py                # LangGraph グラフ
│   │   │   ├── prompts.py              # プロンプト
│   │   │   ├── models.py               # State 定義
│   │   │   └── tools/
│   │   │       ├── search_manual.py    # ES 検索
│   │   │       └── search_qa.py        # Qdrant 検索
│   │   │
│   │   ├── data_analysis/
│   │   │   ├── agent.py                # LangGraph グラフ
│   │   │   ├── prompts.py
│   │   │   ├── models.py
│   │   │   └── nodes/
│   │   │       ├── generate_code.py
│   │   │       ├── execute_code.py
│   │   │       └── generate_review.py
│   │   │
│   │   ├── marketing/
│   │   │   ├── agent.py                # マルチエージェント
│   │   │   ├── prompts.py
│   │   │   ├── models.py
│   │   │   └── sub_agents/
│   │   │       ├── router.py
│   │   │       ├── question.py
│   │   │       └── recommendation.py
│   │   │
│   │   └── proposal/
│   │       ├── agent.py                # Multi-chain
│   │       ├── prompts.py
│   │       ├── models.py
│   │       └── chains/
│   │           ├── hearing.py
│   │           ├── search.py
│   │           ├── evaluate.py
│   │           └── report.py
│   │
│   ├── common/
│   │   ├── configs.py                  # Settings
│   │   ├── logger.py                   # ロガー
│   │   ├── schemas.py                  # 共通スキーマ
│   │   └── streaming.py               # SSE ヘルパー
│   │
│   ├── db/
│   │   ├── database.py
│   │   └── repository.py
│   │
│   ├── scripts/
│   │   └── create_index.py
│   │
│   └── data/
│       ├── manual/
│       └── qa/
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   │
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx                    # ポータル（エージェント選択）
│       │
│       ├── helpdesk/
│       │   ├── page.tsx               # ユーザーフォーム
│       │   └── operator/
│       │       └── page.tsx           # オペレーターダッシュボード
│       │
│       ├── data-analysis/
│       │   └── page.tsx               # CSV アップロード + 分析結果
│       │
│       ├── marketing/
│       │   └── page.tsx               # チャット形式の対話画面
│       │
│       ├── proposal/
│       │   └── page.tsx               # テーマ入力 + レポート表示
│       │
│       └── components/
│           ├── AgentCard.tsx           # ポータルのエージェント選択カード
│           ├── AgentProgress.tsx       # 共通: エージェント進捗表示
│           ├── StreamViewer.tsx        # 共通: SSE ストリーム表示
│           ├── helpdesk/
│           │   ├── InquiryForm.tsx
│           │   ├── InquiryResult.tsx
│           │   ├── InquiryList.tsx
│           │   ├── DraftEditor.tsx
│           │   └── ConfidenceBadge.tsx
│           ├── data-analysis/
│           │   ├── FileUploader.tsx
│           │   ├── AnalysisPlan.tsx
│           │   └── ReportViewer.tsx
│           ├── marketing/
│           │   ├── ChatInterface.tsx
│           │   └── RecommendationCard.tsx
│           └── proposal/
│               ├── ThemeInput.tsx
│               └── ReportViewer.tsx
│
└── .docker/
    └── Dockerfile                     # ES + kuromoji
```

## 5. 共通パターン

### 5.1 SSE イベントコントラクト

全エージェントで統一された SSE イベント形式を使用する。

#### イベント種別

| event 名 | 発火タイミング | data の内容 |
|---|---|---|
| `session_start` | セッション開始時 | `{ session_id, agent_type }` |
| `node_start` | LangGraph ノード実行開始 | `{ node, message? }` |
| `node_complete` | ノード実行完了 | `{ node, output }` |
| `error` | 回復可能なエラー発生 | `{ code, message, node?, retry_count? }` |
| `done` | 全処理完了 | `{ session_id, status, result }` |

#### イベントデータ共通フォーマット

```
event: <event_name>
data: {"timestamp": "2026-03-08T12:00:00Z", ...イベント固有フィールド}

```

#### エージェント固有の node 名

| エージェント | node 名の例 |
|---|---|
| helpdesk | `planner`, `tool_selector`, `searcher`, `answerer`, `reflector`, `integrator` |
| data-analysis | `generate_plan`, `approve_plan`, `generate_code`, `execute_code`, `review`, `generate_report` |
| marketing | `router`, `question_agent`, `recommendation_agent` |
| proposal | `hearing`, `goal_setting`, `decompose_query`, `search`, `evaluate`, `generate_report` |

#### SSE ストリーム例

```
event: session_start
data: {"timestamp": "2026-03-08T12:00:00Z", "session_id": "sess_abc123", "agent_type": "helpdesk"}

event: node_start
data: {"timestamp": "2026-03-08T12:00:01Z", "node": "planner", "message": "質問をサブタスクに分解中"}

event: node_complete
data: {"timestamp": "2026-03-08T12:00:03Z", "node": "planner", "output": {"subtasks": ["パスワード文字制限の調査", "通知制限の調査"]}}

event: node_start
data: {"timestamp": "2026-03-08T12:00:03Z", "node": "searcher", "message": "ES 検索を実行中"}

event: error
data: {"timestamp": "2026-03-08T12:00:04Z", "code": "SEARCH_TIMEOUT", "message": "Elasticsearch がタイムアウトしました。リトライします", "node": "searcher", "retry_count": 1}

event: node_complete
data: {"timestamp": "2026-03-08T12:00:06Z", "node": "searcher", "output": {"results_count": 3}}

event: done
data: {"timestamp": "2026-03-08T12:00:15Z", "session_id": "sess_abc123", "status": "completed", "result": {"confidence": 0.85}}
```

#### フロントエンド受信パターン

```typescript
// frontend/app/hooks/useAgentStream.ts
function useAgentStream(agentType: string, sessionId: string) {
    const [steps, setSteps] = useState<AgentStep[]>([]);
    const [error, setError] = useState<AgentError | null>(null);
    const [status, setStatus] = useState<"connecting" | "streaming" | "done" | "error">("connecting");

    useEffect(() => {
        const source = new EventSource(
            `${API_URL}/api/${agentType}/sessions/${sessionId}/stream`
        );
        source.onopen = () => setStatus("streaming");

        source.addEventListener("node_start", (e) => {
            setSteps((prev) => [...prev, { ...JSON.parse(e.data), phase: "running" }]);
        });
        source.addEventListener("node_complete", (e) => {
            setSteps((prev) => updateLastStep(prev, JSON.parse(e.data)));
        });
        source.addEventListener("error", (e) => {
            if (e.data) setError(JSON.parse(e.data));    // サーバー送信のエラーイベント
            else setStatus("error");                       // 接続エラー
        });
        source.addEventListener("done", (e) => {
            setStatus("done");
            source.close();
        });
        return () => source.close();
    }, [agentType, sessionId]);

    return { steps, error, status };
}
```

### 5.2 エラーハンドリング

#### エラーレスポンス共通フォーマット（REST API）

```python
# 全 API エンドポイント共通
{
    "error": {
        "code": "RATE_LIMIT_EXCEEDED",       # マシンリーダブルなエラーコード
        "message": "本日の利用上限に達しました", # ユーザー向けメッセージ
        "details": {}                          # 追加情報（任意）
    }
}
```

#### エラーコード一覧

| コード | HTTP Status | 説明 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | リクエストバリデーション失敗 |
| `SESSION_NOT_FOUND` | 404 | 指定セッションが存在しない |
| `RATE_LIMIT_EXCEEDED` | 429 | 日次利用上限（daily_limit）超過 |
| `LLM_ERROR` | 502 | OpenAI API の呼び出し失敗 |
| `SEARCH_ERROR` | 502 | Elasticsearch / Qdrant の障害 |
| `SANDBOX_ERROR` | 502 | E2B サンドボックス実行失敗 |
| `WEB_SEARCH_ERROR` | 502 | Tavily API の障害 |
| `INTERNAL_ERROR` | 500 | 予期しない内部エラー |

#### 外部サービス障害時の振る舞い

| サービス | タイムアウト | リトライ | フォールバック |
|---|---|---|---|
| OpenAI API | 60 秒 | 最大 2 回（指数バックオフ: 1s → 2s） | なし。SSE で `error` イベント送信後 `done(status=failed)` |
| Elasticsearch | 10 秒 | 最大 2 回 | Qdrant のみで検索続行（helpdesk） |
| Qdrant | 10 秒 | 最大 2 回 | ES のみで検索続行（helpdesk） |
| E2B Sandbox | 30 秒 | 最大 1 回 | なし。エラーを分析結果に含めてレポート生成 |
| Tavily API | 15 秒 | 最大 2 回 | LLM の内部知識のみで回答し、情報源なしと明記 |

#### SSE ストリーム中のエラー処理フロー

```
ノード実行中にエラー発生
    │
    ├─ リトライ可能？
    │   ├─ YES → error イベント送信（retry_count 付き）→ リトライ実行
    │   │         └─ リトライ成功 → node_complete → 次ノードへ
    │   │         └─ リトライ上限 → 致命的エラーへ
    │   │
    │   └─ NO（バリデーション等）→ 致命的エラーへ
    │
    └─ 致命的エラー
        → error イベント送信
        → done イベント送信（status: "failed"）
        → DB の session.status を "failed" に更新
        → SSE 接続クローズ
```

#### レート制限

```python
# 全エージェント共通
@router.post("/sessions", status_code=202)
async def create_session(request: Request, settings: Settings = Depends(get_settings)):
    today_count = await session_repo.count_today()
    if today_count >= settings.daily_limit:
        raise AppError(
            code="RATE_LIMIT_EXCEEDED",
            message="本日の利用上限に達しました。明日以降にお試しください。",
            status_code=429,
        )
```

### 5.3 Settings

```python
# backend/common/configs.py
class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4o"
    elasticsearch_url: str = "http://elasticsearch:9200"
    qdrant_url: str = "http://qdrant:6333"
    e2b_api_key: str = ""
    tavily_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./demo.db"
    daily_limit: int = 50
```

## 6. エージェント別アーキテクチャ概要

### 問い合わせ対応 (Chapter 4 パターン)

```
planner → [tool_selector → searcher → answerer → reflector]×N → integrator
```

### データ分析 (Chapter 5 パターン)

```
generate_plan → approve_plan → [generate_code → execute_code → review]×N → generate_report
```

### マーケティング支援 (Chapter 7 MACRS パターン)

```
router → question_agent / recommendation_agent / chitchat_agent → router (ループ)
```

### 提案資料作成 (Chapter 6 パターン)

```
hearing → goal_setting → decompose_query → search → evaluate → generate_report
```

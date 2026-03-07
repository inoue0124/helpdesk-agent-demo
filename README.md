# Helpdesk Agent Demo

LangGraph エージェントが問い合わせに自動回答し、オペレーターが確認・承認して送信する、Human-in-the-loop 型のヘルプデスクデモシステムです。

## アーキテクチャ

```
┌──────────────┐    ┌──────────────────────┐    ┌──────────────┐
│  ユーザー画面  │    │   FastAPI バックエンド  │    │ オペレーター画面│
│  (Next.js)   │───>│                      │<───│  (Next.js)   │
│              │    │  LangGraph Agent     │    │              │
│  質問を送信   │    │  SSE ストリーミング    │───>│ 進捗リアルタイム│
│  回答を受信   │<───│  信頼度判定           │    │ 承認 / 編集   │
└──────────────┘    └──────────┬───────────┘    └──────────────┘
                         │           │
                  ┌──────┘           └──────┐
                  v                        v
           ┌─────────────┐         ┌─────────────┐
           │Elasticsearch │         │    Qdrant    │
           │ + kuromoji   │         │ ベクトル検索  │
           │ 全文検索      │         └─────────────┘
           └─────────────┘
```

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router), shadcn/ui, Tailwind CSS |
| バックエンド | FastAPI, SSE (sse-starlette) |
| AI エージェント | LangGraph, OpenAI API |
| 全文検索 | Elasticsearch 8.15 + kuromoji |
| ベクトル検索 | Qdrant |
| DB | SQLite (aiosqlite) |
| インフラ | Docker Compose, Caddy (自動 HTTPS) |

## 主な機能

- **AI 自動回答生成** - LangGraph エージェントが質問を分析し、サブタスクに分解して回答ドラフトを生成
- **リアルタイム進捗表示** - SSE でエージェントの処理過程（計画 → 検索 → 回答 → リフレクション）をストリーミング
- **ハイブリッド検索** - Elasticsearch (キーワード) + Qdrant (ベクトル) による高精度な情報検索
- **信頼度判定** - リフレクション結果から信頼度を自動算出し、オペレーターの判断を支援
- **Human-in-the-loop** - オペレーターが回答を確認・編集・承認してから送信する承認フロー

## セットアップ

### 必要なもの

- Docker / Docker Compose
- OpenAI API キー

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/<username>/helpdesk-agent-demo.git
cd helpdesk-agent-demo

# 環境変数を設定
cp .env.example .env
# .env を編集して OPENAI_API_KEY を設定

# 起動
docker compose up -d

# インデックス作成（初回のみ）
docker compose exec backend python -m src.scripts.create_index
```

起動後のアクセス先:

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3001 |
| バックエンド API | http://localhost:8000 |
| Elasticsearch | http://localhost:9201 |
| Qdrant | http://localhost:6334 |

### 本番デプロイ

```bash
# Caddyfile のドメインを編集
vi Caddyfile

# 本番構成で起動
docker compose -f docker-compose.prod.yml up -d
```

## API エンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| `POST` | `/api/inquiries` | 問い合わせ受付 → エージェント処理開始 |
| `GET` | `/api/inquiries` | 問い合わせ一覧取得 |
| `GET` | `/api/inquiries/{id}` | 問い合わせ詳細取得 |
| `GET` | `/api/inquiries/{id}/stream` | SSE でエージェント進捗をストリーム |
| `PATCH` | `/api/inquiries/{id}` | 回答の編集・承認・却下 |
| `GET` | `/api/health` | ヘルスチェック |

## ディレクトリ構成

```
helpdesk-agent-demo/
├── docker-compose.yml          # ローカル開発用
├── docker-compose.prod.yml     # 本番デプロイ用
├── Caddyfile                   # リバースプロキシ設定
├── .env.example                # 環境変数テンプレート
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── api/                    # FastAPI エンドポイント
│   │   ├── main.py
│   │   ├── schemas.py
│   │   ├── dependencies.py
│   │   └── routes/
│   ├── src/                    # エージェントコア
│   │   ├── agent.py
│   │   ├── models.py
│   │   ├── prompts.py
│   │   └── tools/
│   ├── db/                     # SQLite 永続化
│   └── data/                   # マニュアル・QA データ
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── app/
│       ├── user/               # ユーザー問い合わせ画面
│       ├── operator/           # オペレーターダッシュボード
│       └── components/
│
└── .docker/
    └── Dockerfile              # Elasticsearch + kuromoji
```

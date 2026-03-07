# deploy — 詳細設計書

## 1. インフラ構成

```
Hetzner Cloud CAX21 (ARM)
├── Docker Compose
│   ├── caddy          (80/443 → backend:8000, frontend:3000)
│   ├── backend        (FastAPI)
│   ├── frontend       (Next.js)
│   ├── elasticsearch  (kuromoji)
│   └── qdrant
└── Volumes
    ├── qdrant_data
    ├── es_data
    └── sqlite (helpdesk.db)
```

## 2. デプロイ手順

```bash
# 1. VPS に SSH 接続
ssh root@<server-ip>

# 2. Docker インストール
curl -fsSL https://get.docker.com | sh

# 3. リポジトリクローン
git clone https://github.com/<username>/helpdesk-agent-demo.git
cd helpdesk-agent-demo

# 4. 環境変数設定
cp .env.example .env
vi .env  # OPENAI_API_KEY 等を設定

# 5. 起動
docker compose -f docker-compose.prod.yml up -d

# 6. 初期データ投入（初回のみ）
docker compose exec backend python -m scripts.create_index
```

## 3. Caddyfile（本番）

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

## 4. README.md 構成

```markdown
# Helpdesk Agent Demo

## デモ
[デモURL] / [デモ動画GIF]

## アーキテクチャ
[全体構成図]

## 技術スタック
[テーブル]

## セットアップ
[docker compose up の手順]

## 技術的なポイント
- LangGraph エージェント
- リフレクション + リトライ
- SSE リアルタイム可視化
- 信頼度ベースルーティング
- フィードバックループ
```

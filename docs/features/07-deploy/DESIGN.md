# deploy — 詳細設計書

## インフラ構成

```
Hetzner Cloud CAX21 (ARM / 4vCPU / 8GB / 80GB)
├── Docker Compose
│   ├── caddy          (80/443)
│   ├── backend        (FastAPI)
│   ├── frontend       (Next.js)
│   ├── elasticsearch  (kuromoji)
│   └── qdrant
└── Volumes
    ├── qdrant_data
    ├── es_data
    └── demo.db
```

## デプロイ手順

```bash
ssh root@<server-ip>
curl -fsSL https://get.docker.com | sh
git clone https://github.com/<username>/helpdesk-agent-demo.git
cd helpdesk-agent-demo
cp .env.example .env && vi .env
docker compose -f docker-compose.prod.yml up -d
docker compose exec backend python -m scripts.create_index
```

## README.md 構成

- デモ URL / デモ動画
- アーキテクチャ図
- 4 エージェントの概要と技術パターン
- 技術スタック
- セットアップ手順

# infrastructure — 詳細設計書

## Docker Compose 構成（ローカル開発）

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app"]
    env_file: .env
    depends_on: [elasticsearch, qdrant]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend:/app"]

  elasticsearch:
    build: ./.docker
    ports: ["9200:9200"]
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"

  qdrant:
    image: qdrant/qdrant:latest
    ports: ["6333:6333"]
    volumes: ["qdrant_data:/qdrant/storage"]

volumes:
  qdrant_data:
```

## Elasticsearch + kuromoji Dockerfile

```dockerfile
# .docker/Dockerfile
FROM elasticsearch:8.17.0
RUN bin/elasticsearch-plugin install analysis-kuromoji
```

## 本番構成（docker-compose.prod.yml）

- ローカル開発用との差分: Caddy サービス追加、ポート公開制限、ボリュームマウントなし
- Caddy がフロントパスを frontend:3000 に、`/api/*` を backend:8000 にプロキシする

## Caddyfile

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

## 環境変数（.env.example）

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
ELASTICSEARCH_URL=http://elasticsearch:9200
QDRANT_URL=http://qdrant:6333
DATABASE_URL=sqlite+aiosqlite:///./helpdesk.db
DAILY_LIMIT=50
```

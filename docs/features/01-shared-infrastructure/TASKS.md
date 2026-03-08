# shared-infrastructure — タスクリスト

- [x] `docker-compose.yml` / `docker-compose.prod.yml`
- [x] Dockerfile (backend / frontend)
- [x] `.docker/Dockerfile` (ES + kuromoji)
- [x] Caddyfile / `.env.example`
- [x] `backend/common/configs.py` — Settings
- [x] `backend/common/logger.py` — ロガー
- [x] `backend/common/schemas.py` — 共通スキーマ
- [x] `backend/common/streaming.py` — SSE ストリーミングヘルパー（イベントコントラクト準拠）
- [x] `backend/common/errors.py` — AppError + グローバル例外ハンドラ
- [x] `backend/common/retry.py` — 指数バックオフ付きリトライヘルパー
- [x] `backend/db/database.py` — SQLite 接続 + テーブル初期化
- [x] `backend/db/repository.py` — sessions CRUD
- [x] `backend/api/dependencies.py` — 共通 DI

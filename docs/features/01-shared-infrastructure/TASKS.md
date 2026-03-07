# shared-infrastructure — タスクリスト

- [x] `docker-compose.yml` / `docker-compose.prod.yml`
- [x] Dockerfile (backend / frontend)
- [ ] `.docker/Dockerfile` (ES + kuromoji)
- [x] Caddyfile / `.env.example`
- [ ] `backend/common/configs.py` — Settings
- [ ] `backend/common/logger.py` — ロガー
- [ ] `backend/common/schemas.py` — 共通スキーマ
- [ ] `backend/common/streaming.py` — SSE ストリーミングヘルパー（イベントコントラクト準拠）
- [ ] `backend/common/errors.py` — AppError + グローバル例外ハンドラ
- [ ] `backend/common/retry.py` — 指数バックオフ付きリトライヘルパー
- [ ] `backend/db/database.py` — SQLite 接続 + テーブル初期化
- [ ] `backend/db/repository.py` — sessions CRUD
- [ ] `backend/api/dependencies.py` — 共通 DI

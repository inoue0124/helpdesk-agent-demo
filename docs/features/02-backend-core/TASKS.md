# backend-core — タスクリスト

## タスク

- [ ] Settings / 環境変数管理 — `backend/src/configs.py`
- [ ] Pydantic モデル定義（Inquiry, QAPair, InquiryStatus） — `backend/src/models.py`
- [ ] API スキーマ定義 — `backend/api/schemas.py`
- [ ] SQLite 接続管理 + テーブル初期化 — `backend/db/database.py`
- [ ] InquiryRepository（CRUD + ステータス遷移） — `backend/db/repository.py`
- [ ] QAPairRepository（CRUD） — `backend/db/repository.py`
- [ ] DI 設定 — `backend/api/dependencies.py`
- [ ] カスタムロガー — `backend/src/custom_logger.py`

## 依存関係

- 前提: infrastructure（Docker 環境が起動できること）
- 後続: api-endpoints, langgraph-agent がこのフィーチャーに依存

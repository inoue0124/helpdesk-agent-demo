# api-endpoints — タスクリスト

## タスク

- [x] `GET /api/health` — ヘルスチェック（実装済み）
- [ ] health ルーターを分離 — `backend/api/routes/health.py`
- [ ] `POST /api/inquiries` — 問い合わせ受付 + バックグラウンドエージェント起動
- [ ] `GET /api/inquiries` — 一覧取得（ステータスフィルタ対応）
- [ ] `GET /api/inquiries/{id}` — 詳細取得
- [ ] `GET /api/inquiries/{id}/stream` — SSE ストリーム
- [ ] SSE イベントフォーマッター（format_event）
- [ ] `PATCH /api/inquiries/{id}` — 承認/却下
- [ ] フィードバックループ（QA 蓄積 + Qdrant 登録）
- [ ] 信頼度ベースの自動ルーティング（auto_approve / escalate）
- [ ] レート制限（50件/日）
- [ ] main.py にルーター登録 + startup イベント

## 依存関係

- 前提: backend-core（Repository, Schemas）、langgraph-agent（エージェント実行）
- 後続: operator-dashboard, user-inquiry-form がこの API を呼び出す

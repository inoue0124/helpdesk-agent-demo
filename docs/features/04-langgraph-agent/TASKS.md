# langgraph-agent — タスクリスト

## タスク

- [ ] AgentState / Subtask 型定義 — `backend/src/models.py` に追加
- [ ] プロンプト定義 — `backend/src/prompts.py`
- [ ] planner ノード実装
- [ ] tool_selector ノード実装
- [ ] searcher ノード実装
- [ ] answerer ノード実装
- [ ] reflector ノード実装
- [ ] リトライ条件分岐（should_retry）
- [ ] integrator ノード実装
- [ ] グラフ構築（ノード接続 + サイクル制御） — `backend/src/agent.py`
- [ ] 信頼度算出ロジック（calc_confidence）
- [ ] 単体テスト or 動作確認用スクリプト

## 依存関係

- 前提: backend-core（モデル定義）、search-tools（検索ツール）
- 後続: api-endpoints が SSE ストリームでエージェントを呼び出す

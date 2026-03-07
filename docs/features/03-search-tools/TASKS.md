# search-tools — タスクリスト

## タスク

- [ ] ES キーワード検索ツール — `backend/src/tools/search_xyz_manual.py`
- [ ] Qdrant ベクトル検索ツール — `backend/src/tools/search_xyz_qa.py`
- [ ] ES インデックス定義（kuromoji アナライザ設定）
- [ ] Qdrant コレクション定義
- [ ] マニュアルサンプルデータ作成 — `backend/data/manual/`
- [ ] 初期 QA サンプルデータ作成 — `backend/data/qa/`
- [ ] 初期データ投入スクリプト — `backend/scripts/create_index.py`

## 依存関係

- 前提: infrastructure（ES, Qdrant コンテナが起動していること）
- 後続: langgraph-agent がこのツールを利用する

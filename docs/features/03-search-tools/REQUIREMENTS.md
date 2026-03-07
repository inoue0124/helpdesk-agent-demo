# search-tools — 要件定義書

## 概要

Elasticsearch（キーワード検索）と Qdrant（ベクトル検索）による検索ツールを実装し、エージェントが利用できるようにする。初期データ投入スクリプトも含む。

## 機能要件

### search_xyz_manual（ES キーワード検索）
- マニュアルドキュメントを Elasticsearch で全文検索する
- kuromoji アナライザで日本語形態素解析を行う
- LangGraph の Tool として呼び出し可能にする

### search_xyz_qa（Qdrant ベクトル検索）
- 過去の QA ペアを Qdrant でベクトル類似検索する
- OpenAI Embeddings API でベクトル化する
- LangGraph の Tool として呼び出し可能にする

### 初期データ投入スクリプト
- マニュアルデータを Elasticsearch にインデックスする
- 初期 QA データを Qdrant に登録する
- `python -m scripts.create_index` で実行できる

## 受け入れ条件

- [ ] ES 検索ツールがクエリに対して関連ドキュメントを返す
- [ ] Qdrant 検索ツールが類似 QA を返す
- [ ] 初期データ投入スクリプトが正常に完了する
- [ ] 両ツールが LangGraph の Tool インターフェースに準拠する

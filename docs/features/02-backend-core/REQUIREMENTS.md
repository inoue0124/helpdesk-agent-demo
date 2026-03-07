# backend-core — 要件定義書

## 概要

バックエンドの基盤層を構築する。設定管理、データモデル、データベース接続、API スキーマを整備し、他フィーチャーの土台とする。

## 機能要件

### 設定管理
- 環境変数から設定値を読み込む（OpenAI API キー、DB URL、検索エンジン URL 等）
- pydantic-settings で型安全に管理する

### データモデル
- 問い合わせ（Inquiry）のドメインモデルを定義する
- QA ペアのドメインモデルを定義する
- ステータス遷移: `pending → processing → draft → approved / rejected / auto_approved / escalated`

### データベース
- SQLite (aiosqlite) で非同期アクセスする
- `inquiries` テーブルの CRUD を提供する
- `qa_pairs` テーブルの CRUD を提供する

### API スキーマ
- リクエスト/レスポンスの Pydantic モデルを定義する
- DI（依存注入）で Settings や Repository を管理する

## 受け入れ条件

- [ ] Settings が環境変数から正しく読み込める
- [ ] inquiries テーブルの CRUD 操作が動作する
- [ ] qa_pairs テーブルの CRUD 操作が動作する
- [ ] ステータス遷移が定義通りに制御される

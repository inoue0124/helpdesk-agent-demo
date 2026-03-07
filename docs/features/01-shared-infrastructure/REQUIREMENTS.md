# shared-infrastructure — 要件定義書

## 概要

全エージェント共通のインフラ基盤・バックエンド基盤を構築する。

## 機能要件

### Docker 環境
- `docker compose up` で全サービスが起動する
- サービス: backend, frontend, Elasticsearch, Qdrant
- 本番環境用に Caddy による HTTPS 構成を用意する

### 共通バックエンド基盤
- Settings: 環境変数から設定を読み込む（OpenAI, ES, Qdrant, E2B, Tavily 等）
- Logger: 全エージェント共通のロガー
- SSE ヘルパー: LangGraph のストリームイベントを SSE に変換する共通関数
- 共通スキーマ: セッション作成/取得の共通レスポンス型

### 共通データベース
- SQLite で全エージェントのセッション・結果を管理する
- セッションテーブル: agent_type, input, output, status, created_at

## 受け入れ条件

- [ ] `docker compose up` で全サービスが起動し `/api/health` が 200 を返す
- [ ] Settings が全 API キーを読み込める
- [ ] SSE ヘルパーが LangGraph イベントを正しくストリーミングする

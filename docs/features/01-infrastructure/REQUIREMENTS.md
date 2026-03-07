# infrastructure — 要件定義書

## 概要

Docker Compose によるローカル開発環境・本番環境のコンテナ構成を整備する。

## 機能要件

- `docker compose up` のワンコマンドで全サービス（backend, frontend, Elasticsearch, Qdrant）が起動する
- 本番環境用に Caddy によるリバースプロキシ + 自動 HTTPS を構成する
- `.env.example` で必要な環境変数を明示する

## サービス一覧

| サービス | ポート | 説明 |
|---|---|---|
| backend | 8000 | FastAPI |
| frontend | 3000 | Next.js |
| elasticsearch | 9200 | kuromoji プラグイン入り |
| qdrant | 6333 | ベクトル検索 |
| caddy | 80/443 | リバースプロキシ（本番のみ） |

## 非機能要件

- ローカル開発用と本番用で Docker Compose ファイルを分離する
- Elasticsearch は kuromoji プラグインをプリインストールした Dockerfile を用意する
- コンテナ間通信は Docker 内部ネットワークで完結する

## 受け入れ条件

- [ ] `docker compose up` で全サービスが起動し、`/api/health` が 200 を返す
- [ ] `docker compose -f docker-compose.prod.yml up` で本番構成が起動する
- [ ] Elasticsearch に kuromoji アナライザが利用可能である
- [ ] Qdrant に接続してコレクション操作ができる

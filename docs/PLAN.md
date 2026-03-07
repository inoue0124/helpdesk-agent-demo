# ヘルプデスクエージェント デモシステム — 計画書

問い合わせ対応エージェントを組み込んだデモシステムを構築する。

## ドキュメント構成

### 全体スペック

| ドキュメント | 内容 |
|---|---|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 要件定義書 — 機能要件・非機能要件・画面設計・スコープ外 |
| [DESIGN.md](./DESIGN.md) | 詳細設計書 — アーキテクチャ・エージェント設計・API・DB・実装方針 |
| [TASKS.md](./TASKS.md) | タスクリスト — Phase 1〜4 の全タスク一覧 |

### フィーチャー別スペック

| # | フィーチャー | 概要 |
|---|---|---|
| 01 | [infrastructure](./features/01-infrastructure/) | Docker Compose, Dockerfile, Caddy, 環境変数 |
| 02 | [backend-core](./features/02-backend-core/) | Settings, モデル, DB, Repository, DI |
| 03 | [search-tools](./features/03-search-tools/) | ES キーワード検索, Qdrant ベクトル検索, データ投入 |
| 04 | [langgraph-agent](./features/04-langgraph-agent/) | LangGraph エージェント（planner → reflector → integrator） |
| 05 | [api-endpoints](./features/05-api-endpoints/) | REST API + SSE ストリーム + フィードバックループ |
| 06 | [operator-dashboard](./features/06-operator-dashboard/) | オペレーター画面（一覧・進捗可視化・承認フロー） |
| 07 | [user-inquiry-form](./features/07-user-inquiry-form/) | ユーザー問い合わせフォーム + 回答表示 |
| 08 | [deploy](./features/08-deploy/) | 本番デプロイ + README + デモ動画 |

### 依存関係

```
01-infrastructure
    └──> 02-backend-core
              └──> 03-search-tools ──> 04-langgraph-agent ──> 05-api-endpoints
                                                                   ├──> 06-operator-dashboard
                                                                   └──> 07-user-inquiry-form
                                                                              └──> 08-deploy
```

## 変更履歴

| 日付 | 変更内容 |
|---|---|
| 2026-03-07 | フィーチャー別スペック（01〜08）を作成 |
| 2026-03-07 | PLAN.md を REQUIREMENTS.md / DESIGN.md / TASKS.md に分割 |
| 2026-03-07 | ユーザー画面をチャット形式からお問い合わせフォーム形式に変更 |
| 2026-03-07 | 初版作成 |

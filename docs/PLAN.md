# AI Agent Demo Portfolio — 計画書

4 種類の AI エージェントを実際に試せるデモサイトを構築する。
各エージェントは異なるユースケース・アーキテクチャパターンを実装し、LangGraph ベースのエージェント技術を体系的に示す。

## エージェント一覧

| # | エージェント | ユースケース | パターン |
|---|---|---|---|
| 1 | 問い合わせ対応 | ヘルプデスク自動回答 | Plan→Subtask 分解→Reflection リトライ |
| 2 | データ分析 | CSV アップロード→分析→可視化 | コード生成→サンドボックス実行→レビューループ |
| 3 | マーケティング支援 | 施策提案・コンテンツ生成 | マルチエージェント協調（Router ベース） |
| 4 | 提案資料作成 | 情報収集→整理→資料生成 | Multi-chain + 評価リトライ |

## ドキュメント構成

### 全体スペック

| ドキュメント | 内容 |
|---|---|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 要件定義書 — ポートフォリオ全体の機能要件・非機能要件 |
| [DESIGN.md](./DESIGN.md) | 詳細設計書 — 共通アーキテクチャ・技術スタック |
| [TASKS.md](./TASKS.md) | タスクリスト — 全フィーチャーのタスク概要 |

### フィーチャー別スペック

| # | フィーチャー | 概要 |
|---|---|---|
| 01 | [shared-infrastructure](./features/01-shared-infrastructure/) | Docker Compose, 共通バックエンド基盤, DB |
| 02 | [portal-frontend](./features/02-portal-frontend/) | ポータル画面, エージェント選択, 共通 UI |
| 03 | [helpdesk-agent](./features/03-helpdesk-agent/) | 問い合わせ対応エージェント |
| 04 | [data-analysis-agent](./features/04-data-analysis-agent/) | データ分析エージェント |
| 05 | [marketing-agent](./features/05-marketing-agent/) | マーケティング支援エージェント |
| 06 | [proposal-agent](./features/06-proposal-agent/) | 提案資料作成エージェント |
| 07 | [deploy](./features/07-deploy/) | デプロイ + 公開準備 |

### 依存関係

```
01-shared-infrastructure
    └──> 02-portal-frontend
              └──> 03-helpdesk-agent
              └──> 04-data-analysis-agent
              └──> 05-marketing-agent
              └──> 06-proposal-agent
                        └──> 07-deploy
```

## 変更履歴

| 日付 | 変更内容 |
|---|---|
| 2026-03-08 | マルチエージェント・ポートフォリオサイトに構想変更 |
| 2026-03-07 | フィーチャー別スペック作成 |
| 2026-03-07 | PLAN.md を REQUIREMENTS / DESIGN / TASKS に分割 |
| 2026-03-07 | 初版作成 |

---
name: spec-driven-dev
description: スペック駆動開発の書類（要件定義書、詳細設計書、タスクリスト）を生成する。「要件定義」「設計書」「タスクリスト」「スペック駆動」「spec driven」「REQUIREMENTS」「DESIGN」「TASKS」で自動適用。
metadata:
  version: "1.0.0"
---

# スペック駆動開発スキル

機能の実装前に REQUIREMENTS.md → DESIGN.md → TASKS.md の 3 ドキュメントを段階的に生成し、レビュー・承認を経てから実装に入るワークフロー。

## ワークフロー概要

```
要件定義 (REQUIREMENTS.md)
    ↓ ユーザーレビュー・承認
詳細設計 (DESIGN.md)
    ↓ ユーザーレビュー・承認
タスクリスト (TASKS.md)
    ↓ ユーザーレビュー・承認
実装開始
```

## 各ドキュメントの役割

### REQUIREMENTS.md（要件定義書）
- **目的**: 何を作るか、なぜ作るかを明確にする
- **内容**: 機能要件、非機能要件、受け入れ条件、スコープ外の明示
- **レビュー観点**: 抜け漏れがないか、スコープが適切か

### DESIGN.md（詳細設計書）
- **目的**: どう作るかを明確にする
- **内容**: コンポーネント構成、データフロー、API 設計、データモデル、エラーハンドリング
- **レビュー観点**: 既存アーキテクチャとの整合性、実現可能性

### TASKS.md（タスクリスト）
- **目的**: 実装の順序と粒度を明確にする
- **内容**: チェックボックス付きタスク、依存関係、対象ファイル、推定規模
- **レビュー観点**: 順序の妥当性、粒度の適切さ

## ドキュメント配置規則

```
docs/
├── PLAN.md                        # プロジェクト全体の計画書
└── features/
    └── <feature-name>/
        ├── REQUIREMENTS.md        # 要件定義書
        ├── DESIGN.md              # 詳細設計書
        └── TASKS.md               # タスクリスト
```

## プロジェクト固有の制約

本プロジェクト (helpdesk-agent-demo) のドキュメント生成時は以下を考慮すること:

- **バックエンド**: FastAPI + LangGraph + SQLite。非同期処理 (async/await) を前提とする
- **フロントエンド**: Next.js 15 (App Router) + shadcn/ui + Tailwind CSS
- **検索**: Elasticsearch (kuromoji) + Qdrant のハイブリッド
- **リアルタイム通信**: SSE (sse-starlette)
- **全体計画**: `docs/PLAN.md` に記載されたアーキテクチャ・設計方針に従うこと
- **インフラ**: Docker Compose 構成。サービス間通信はコンテナ内部ネットワーク

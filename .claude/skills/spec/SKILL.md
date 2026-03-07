---
name: spec
description: スペック駆動開発 — 機能名を指定して REQUIREMENTS.md → DESIGN.md → TASKS.md を段階的に生成する。
disable-model-invocation: true
argument-hint: <機能名 or 機能の説明>
---

# スペック駆動開発

機能: $ARGUMENTS

## 原則

- 各フェーズの成果物をユーザーに提示し、**承認を得てから**次のフェーズに進むこと
- 推測で埋めず、不明点はユーザーに質問すること
- `docs/PLAN.md` のアーキテクチャ・設計方針に従うこと
- テンプレートは `.claude/skills/spec-driven-dev/references/` を参照すること

---

## Phase 1: 要件定義 (REQUIREMENTS.md)

**Goal**: 何を作るか、なぜ作るかを明確にする

**Actions**:
1. `requirements-analyst` エージェントを起動して、既存コードベースと設計書から関連情報を収集する
2. エージェントの分析結果と `$ARGUMENTS` の内容をもとに、不明点・曖昧な点をユーザーに質問する
3. 回答を得たら `.claude/skills/spec-driven-dev/references/requirements-template.md` に従って REQUIREMENTS.md を生成する
4. `docs/features/<feature-name>/REQUIREMENTS.md` に保存する
5. **ユーザーにレビューを依頼し、承認を得る**

承認されるまで次のフェーズに進まないこと。修正を求められたら修正して再度レビューを依頼する。

---

## Phase 2: 詳細設計 (DESIGN.md)

**Goal**: どう作るかを明確にする

**前提**: Phase 1 の REQUIREMENTS.md が承認済みであること

**Actions**:
1. `design-architect` エージェントを起動して、要件定義書をもとに設計案を作成する
2. エージェントの設計案をもとに `.claude/skills/spec-driven-dev/references/design-template.md` に従って DESIGN.md を生成する
3. `docs/features/<feature-name>/DESIGN.md` に保存する
4. **ユーザーにレビューを依頼し、承認を得る**

承認されるまで次のフェーズに進まないこと。

---

## Phase 3: タスクリスト (TASKS.md)

**Goal**: 実装の順序と粒度を明確にする

**前提**: Phase 2 の DESIGN.md が承認済みであること

**Actions**:
1. `task-planner` エージェントを起動して、設計書からタスクリストを生成する
2. エージェントの出力をもとに `.claude/skills/spec-driven-dev/references/tasks-template.md` に従って TASKS.md を生成する
3. `docs/features/<feature-name>/TASKS.md` に保存する
4. **ユーザーにレビューを依頼し、承認を得る**

---

## Phase 4: 完了報告

全ドキュメントが承認されたら、以下を報告する:

- 生成したファイル一覧
- 次のステップ（「TASKS.md のタスクを順番に実装していきましょう」）

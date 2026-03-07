---
name: spec-tasks
description: タスクリスト (TASKS.md) のみを生成する。DESIGN.md が存在する前提。機能名を引数に指定して実行する。
disable-model-invocation: true
argument-hint: <機能名 or features/ディレクトリパス>
---

# タスクリストの生成

機能: $ARGUMENTS

## 手順

1. `docs/features/` 配下から対象の DESIGN.md を読み込む
2. `task-planner` エージェントを起動して、設計書からタスクリストを生成する
3. `.claude/skills/spec-driven-dev/references/tasks-template.md` のテンプレートに従って TASKS.md を生成する
4. `docs/features/<feature-name>/TASKS.md` に保存する
5. ユーザーにレビューを依頼する

## 制約
- DESIGN.md が存在しない場合はユーザーに確認すること
- タスクの依存関係を正しく反映すること
- 各タスクは独立してテスト可能な粒度にすること

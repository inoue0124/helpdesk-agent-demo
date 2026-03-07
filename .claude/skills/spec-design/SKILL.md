---
name: spec-design
description: 詳細設計書 (DESIGN.md) のみを生成する。REQUIREMENTS.md が存在する前提。機能名を引数に指定して実行する。
disable-model-invocation: true
argument-hint: <機能名 or features/ディレクトリパス>
---

# 詳細設計書の生成

機能: $ARGUMENTS

## 手順

1. `docs/features/` 配下から対象の REQUIREMENTS.md を読み込む
2. `design-architect` エージェントを起動して、要件定義書をもとに設計案を作成する
3. `.claude/skills/spec-driven-dev/references/design-template.md` のテンプレートに従って DESIGN.md を生成する
4. `docs/features/<feature-name>/DESIGN.md` に保存する
5. ユーザーにレビューを依頼する

## 制約
- REQUIREMENTS.md が存在しない場合はユーザーに確認すること
- `docs/PLAN.md` のアーキテクチャ・設計方針に従うこと
- 既存のコードパターンと整合性を保つこと

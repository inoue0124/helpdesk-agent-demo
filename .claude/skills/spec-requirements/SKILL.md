---
name: spec-requirements
description: 要件定義書 (REQUIREMENTS.md) のみを生成する。機能名を引数に指定して実行する。
disable-model-invocation: true
argument-hint: <機能名 or 機能の説明>
---

# 要件定義書の生成

機能: $ARGUMENTS

## 手順

1. `requirements-analyst` エージェントを起動して、既存コードベースと設計書から関連情報を収集する
2. エージェントの分析結果をもとに、不明点・曖昧な点をユーザーに質問する
3. `.claude/skills/spec-driven-dev/references/requirements-template.md` のテンプレートに従って REQUIREMENTS.md を生成する
4. `docs/features/<feature-name>/REQUIREMENTS.md` に保存する
5. ユーザーにレビューを依頼する

## 制約
- `docs/PLAN.md` のアーキテクチャ・設計方針に従うこと
- 推測で埋めず、不明点はユーザーに質問すること
- 受け入れ条件はテスト可能な形式で記述すること

---
name: implement-next
description: 現在のフィーチャーの次の未完了タスクを自動検出して実装する。「次」「next」「続き」「続けて」で自動適用。
---

# 次のタスクを実装

## 手順

1. `docs/TASKS.md` を読み、最初の `- [ ]` タスクがどのフィーチャーに属するかを特定する
2. `/implement <そのフィーチャー名>` と同じフローを実行する

つまり:
- `docs/DESIGN.md`（共通設計）を読む
- `docs/features/<feature>/DESIGN.md` を読む
- `docs/features/<feature>/TASKS.md` を読む
- 依存が満たされている最初の未完了タスクを選び、ユーザーに提示して確認後に実装する

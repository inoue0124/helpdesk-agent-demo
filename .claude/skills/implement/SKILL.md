---
name: implement
description: フィーチャーの DESIGN.md / TASKS.md を読み、未完了タスクを順番に実装する。「実装」「implement」「タスク実行」「次のタスク」「コード書いて」で自動適用。
argument-hint: <フィーチャー名 例: 01-shared-infrastructure>
---

# フィーチャー実装スキル

フィーチャー: $ARGUMENTS

## 実装手順

### 1. コンテキスト読み込み

以下のドキュメントを **必ず** 読み込んでからコードを書く:

1. `docs/DESIGN.md` — 共通アーキテクチャ（SSE コントラクト、エラーハンドリング、Settings）
2. `docs/features/<feature>/DESIGN.md` — フィーチャー固有の設計
3. `docs/features/<feature>/TASKS.md` — タスクリスト
4. `docs/features/<feature>/REQUIREMENTS.md` — 要件（受け入れ条件の確認用）

### 2. 次の未完了タスクを特定

TASKS.md の `- [ ]` を上から順にスキャンし、**依存が満たされている最初の未完了タスク** を選ぶ。

ユーザーに実装するタスクを提示して確認を取る:
```
次のタスク: <タスク名>
ファイル: <対象ファイル>
内容: <1-2 行の説明>

実装してよいですか？
```

### 3. 実装

#### バックエンド (Python / FastAPI)

**必ず従うルール:**

- **非同期**: すべての I/O は `async/await` で書く
- **型ヒント**: 関数の引数・戻り値に型アノテーションを付ける
- **import 整理**: 標準ライブラリ → サードパーティ → ローカルの順
- **エラーハンドリング**: `backend/common/errors.py` の `AppError` を使う。生の `HTTPException` は使わない
- **外部サービス呼び出し**: `backend/common/retry.py` の `with_retry` を通す
- **SSE ストリーミング**: `backend/common/streaming.py` の `stream_agent_events` を使う。独自実装しない
- **設定値**: `backend/common/configs.py` の `Settings` から取得。ハードコードしない
- **DB 操作**: `backend/db/repository.py` を通す。SQL を直接ルートハンドラに書かない
- **DI**: FastAPI の `Depends()` で注入する

**ファイル配置:**

```
backend/
├── api/routes/<agent_type>.py    # API エンドポイント
├── agents/<agent_type>/
│   ├── agent.py                  # LangGraph グラフ定義
│   ├── models.py                 # State / Pydantic モデル
│   ├── prompts.py                # プロンプト定義
│   ├── tools/                    # LangGraph ツール (helpdesk)
│   ├── nodes/                    # ノード関数 (data_analysis)
│   ├── sub_agents/               # サブエージェント (marketing)
│   └── chains/                   # チェーン (proposal)
├── common/
│   ├── configs.py, errors.py, retry.py, streaming.py, schemas.py, logger.py
└── db/
    ├── database.py, repository.py
```

**LangGraph パターン:**

```python
# State は TypedDict で定義
class AgentState(TypedDict):
    ...

# グラフはファクトリ関数で構築
def create_graph(settings: Settings) -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("node_name", node_function)
    ...
    return graph.compile()
```

#### フロントエンド (TypeScript / Next.js)

**必ず従うルール:**

- **App Router**: `app/` ディレクトリ構成。Pages Router は使わない
- **Server Components**: デフォルトは Server Component。`"use client"` は状態・イベントが必要な場合のみ
- **SSE 受信**: `hooks/useAgentStream.ts` の共通フックを使う
- **UI コンポーネント**: shadcn/ui を優先。自前 CSS は最小限
- **API 呼び出し**: `lib/api.ts` の共通クライアントを使う
- **エラー表示**: API のエラーレスポンス (`error.code`, `error.message`) をそのまま活用

**ファイル配置:**

```
frontend/app/
├── layout.tsx                          # 共通レイアウト
├── page.tsx                            # ポータル
├── hooks/useAgentStream.ts             # SSE 共通フック
├── lib/api.ts                          # API クライアント
├── <agent-type>/
│   ├── page.tsx                        # エージェント画面
│   └── operator/page.tsx               # (helpdesk のみ)
└── components/
    ├── AgentCard.tsx, AgentProgress.tsx, StreamViewer.tsx  # 共通
    └── <agent-type>/                   # エージェント固有
```

### 4. 動作確認

実装後、以下を確認する:

- **構文チェック**: Python は `python -c "import ast; ast.parse(open('file').read())"` 、TypeScript は `npx tsc --noEmit` で確認
- **既存コードとの整合**: import パスが正しいか、既存の DI/ルーティングに登録されているか
- **DESIGN.md との一致**: 設計書のインターフェース（関数シグネチャ、API スキーマ）と実装が一致しているか

### 5. タスク完了の記録

実装が完了したら:

1. `docs/features/<feature>/TASKS.md` の該当タスクを `- [x]` に更新
2. `docs/TASKS.md`（グローバル）の対応項目も `- [x]` に更新
3. ユーザーに完了報告:

```
完了: <タスク名>
作成/変更ファイル:
  - backend/common/configs.py (新規)
  - backend/api/main.py (変更)

次のタスク: <次の未完了タスク名>
続けますか？
```

## 注意事項

- **1 タスク 1 コミット単位** を意識する。複数タスクをまとめて実装しない（ユーザーが明示的に求めた場合を除く）
- 設計書にない機能を勝手に追加しない。不足を見つけたらユーザーに相談する
- 共通基盤（`common/`, 共通コンポーネント）を変更する場合は、他のエージェントへの影響を確認する
- テストファイルは設計書に記載がある場合のみ作成する

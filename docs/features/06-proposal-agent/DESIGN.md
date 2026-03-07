# proposal-agent — 詳細設計書

## 1. グラフ構造（Chapter 6 パターン）

```
hearing → goal_setting → decompose_query → search → evaluate
                                              ^         |
                                              └── 不足時リトライ
                                                        |
                                                        v
                                                 generate_report
```

## 2. State 定義

```python
# backend/agents/proposal/models.py

class ProposalState(TypedDict):
    messages: list[dict]            # ヒアリング会話
    goal: str | None                # 最適化されたゴール
    tasks: list[SearchTask]         # 検索タスク一覧
    search_results: list[dict]      # 収集結果
    evaluation: str | None          # 評価結果
    final_report: str | None        # 最終レポート
    retry_count: int

class SearchTask(TypedDict):
    query: str
    purpose: str
    results: list[dict]
    is_completed: bool
```

## 3. Chain 設計

### Hearing Chain

```python
# ヒアリング: テーマ・目的・対象読者・求める粒度を対話で明確化
```

### Goal Optimizer

```python
# ヒアリング結果から具体的な調査ゴールを生成
# 例: 「SaaS市場のトレンド」→「2025年の日本SaaS市場における主要トレンド3つと、
#      各トレンドの市場規模・成長率・代表的企業を調査する」
```

### Query Decomposer

```python
# ゴールを検索可能なクエリに分解
# 例: ["SaaS市場 2025 トレンド", "SaaS 市場規模 成長率", ...]
```

### Searcher

```python
# Tavily API で Web 検索
from tavily import AsyncTavilyClient

async def search(query: str) -> list[dict]:
    client = AsyncTavilyClient(api_key=settings.tavily_api_key)
    results = await client.search(query)
    return results["results"]
```

### Task Evaluator

```python
# 検索結果がゴールを十分にカバーしているか評価
# 不足 → 追加クエリを生成してリトライ
# 十分 → レポート生成に進む
```

### Reporter

```python
# 構造化された Markdown レポートを生成
# セクション: 概要, 調査結果, 分析, 提案, まとめ
```

## 4. API

```
POST   /api/proposal/sessions                  セッション作成（ヒアリング開始）
POST   /api/proposal/sessions/{id}/messages     ヒアリング応答
GET    /api/proposal/sessions/{id}/stream       SSE ストリーム（調査〜レポート生成）
GET    /api/proposal/sessions/{id}              結果取得
```

## 5. フロントエンド

```
/proposal
├── ヒアリングフェーズ（チャット形式）
├── 調査進捗（AgentProgress）
│   ├── ゴール設定
│   ├── クエリ分解
│   ├── 検索実行
│   ├── 評価 + リトライ
│   └── レポート生成
└── レポート表示（Markdown レンダリング）
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/agents/proposal/agent.py` | LangGraph グラフ |
| `backend/agents/proposal/models.py` | State 定義 |
| `backend/agents/proposal/prompts.py` | プロンプト |
| `backend/agents/proposal/chains/hearing.py` | ヒアリング |
| `backend/agents/proposal/chains/search.py` | Web 検索 |
| `backend/agents/proposal/chains/evaluate.py` | 評価 |
| `backend/agents/proposal/chains/report.py` | レポート生成 |
| `backend/api/routes/proposal.py` | API |
| `frontend/app/proposal/page.tsx` | 画面 |
| `frontend/app/components/proposal/ThemeInput.tsx` | テーマ入力 |
| `frontend/app/components/proposal/ReportViewer.tsx` | レポート表示 |

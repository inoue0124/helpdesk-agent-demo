# langgraph-agent — 詳細設計書

## 1. グラフ構造

```
                    ┌─────────┐
                    │ planner │  質問をサブタスクに分解
                    └────┬────┘
                         v
                ┌────────────────┐
            ┌──>│ tool_selector  │  サブタスクに最適なツールを選択
            │   └───────┬────────┘
            │           v
            │   ┌───────────────┐
            │   │   searcher    │  ES or Qdrant で検索実行
            │   └───────┬───────┘
            │           v
            │   ┌───────────────┐
            │   │   answerer    │  検索結果をもとに回答生成
            │   └───────┬───────┘
            │           v
            │   ┌───────────────┐
  リトライ   │   │  reflector    │  回答品質を自己評価
  (最大3回)  │   └───────┬───────┘
            │           |
            │     ┌─────┴─────┐
            │     │           │
            │  不十分        十分
            │     │           │
            └─────┘           v
                      ┌─────────────┐
                      │ integrator  │  サブタスク結果を統合 → 最終回答
                      └─────────────┘
```

## 2. State 定義

```python
from typing import TypedDict

class Subtask(TypedDict):
    description: str
    tool: str | None
    query: str | None
    search_results: list[str]
    answer: str | None
    is_completed: bool
    challenge_count: int

class AgentState(TypedDict):
    question: str
    subtasks: list[Subtask]
    current_subtask_index: int
    final_answer: str | None
    confidence: float | None
```

## 3. 各ノードの実装方針

### planner

```python
async def planner(state: AgentState) -> AgentState:
    """LLM で質問をサブタスクに分解する"""
    # 入力: state["question"]
    # 出力: state["subtasks"] を設定
```

### tool_selector

```python
async def tool_selector(state: AgentState) -> AgentState:
    """現在のサブタスクに最適な検索ツールを LLM で選択する"""
    # 入力: 現在のサブタスク
    # 出力: subtask["tool"], subtask["query"] を設定
```

### searcher

```python
async def searcher(state: AgentState) -> AgentState:
    """選択されたツールで検索を実行する"""
    # tool == "search_xyz_manual" → ES 検索
    # tool == "search_xyz_qa" → Qdrant 検索
```

### answerer

```python
async def answerer(state: AgentState) -> AgentState:
    """検索結果をもとにサブタスクの回答を LLM で生成する"""
```

### reflector

```python
async def reflector(state: AgentState) -> AgentState:
    """回答品質を LLM で自己評価し、十分/不十分を判定する"""
    # 不十分 → subtask["is_completed"] = False, challenge_count += 1
    # 十分 → subtask["is_completed"] = True
```

### 条件分岐（リトライ判定）

```python
def should_retry(state: AgentState) -> str:
    subtask = state["subtasks"][state["current_subtask_index"]]
    if subtask["is_completed"]:
        return "next_or_integrate"
    if subtask["challenge_count"] >= 3:
        return "next_or_integrate"  # 打ち切り
    return "retry"  # tool_selector に戻る
```

### integrator

```python
async def integrator(state: AgentState) -> AgentState:
    """全サブタスクの回答を統合して最終回答を生成する"""
```

## 4. 信頼度算出

```python
def calc_confidence(subtasks: list[Subtask]) -> float:
    scores = []
    for subtask in subtasks:
        if subtask["is_completed"] and subtask["challenge_count"] == 1:
            scores.append(1.0)
        elif subtask["is_completed"]:
            scores.append(0.6)
        else:
            scores.append(0.0)
    return sum(scores) / len(scores) if scores else 0.0
```

## 5. プロンプト設計

```python
# backend/src/prompts.py
PLANNER_PROMPT = "..."
TOOL_SELECTOR_PROMPT = "..."
ANSWERER_PROMPT = "..."
REFLECTOR_PROMPT = "..."
INTEGRATOR_PROMPT = "..."
```

各プロンプトは `prompts.py` に集約し、ノード実装から分離する。

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/src/agent.py` | LangGraph グラフ構築 + 各ノード実装 |
| `backend/src/prompts.py` | 全プロンプト定義 |
| `backend/src/models.py` | AgentState, Subtask 型定義（既存に追加） |

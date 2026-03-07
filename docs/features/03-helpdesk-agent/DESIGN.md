# helpdesk-agent — 詳細設計書

## 1. グラフ構造（Chapter 4 パターン）

### メイングラフ

```
create_plan → execute_subtasks → create_answer
```

### サブグラフ（サブタスクごと）

```
select_tools → execute_tools → create_subtask_answer → reflect_subtask
     ^                                                       |
     └──────────── リトライ (最大 3 回) ────────────────────────┘
```

## 2. State 定義

```python
# backend/agents/helpdesk/models.py

class AgentState(TypedDict):
    question: str
    plan: list[str]
    current_step: int
    subtask_results: list[SubtaskResult]
    last_answer: str | None

class SubGraphState(TypedDict):
    question: str
    plan: list[str]
    subtask: str
    is_completed: bool
    messages: list
    challenge_count: int
    tool_results: list[dict]
    reflection_results: str | None
    subtask_answer: str | None
```

## 3. 検索ツール

```python
# backend/agents/helpdesk/tools/search_manual.py
@tool
async def search_manual(query: str) -> str:
    """ES キーワード検索"""

# backend/agents/helpdesk/tools/search_qa.py
@tool
async def search_qa(query: str) -> str:
    """Qdrant ベクトル検索"""
```

## 4. 信頼度算出

```python
def calc_confidence(subtask_results: list[SubtaskResult]) -> float:
    scores = []
    for r in subtask_results:
        if r.is_completed and r.challenge_count == 1:
            scores.append(1.0)
        elif r.is_completed:
            scores.append(0.6)
        else:
            scores.append(0.0)
    return sum(scores) / len(scores) if scores else 0.0
```

## 5. API

```
POST   /api/helpdesk/inquiries              問い合わせ受付
GET    /api/helpdesk/inquiries               一覧取得
GET    /api/helpdesk/inquiries/{id}          詳細取得
GET    /api/helpdesk/inquiries/{id}/stream   SSE ストリーム
PATCH  /api/helpdesk/inquiries/{id}          承認/却下
```

## 6. DB（追加テーブル）

```sql
CREATE TABLE inquiries (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    user_name TEXT DEFAULT '匿名',
    status TEXT DEFAULT 'pending',
    draft_answer TEXT,
    final_answer TEXT,
    confidence REAL,
    agent_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

CREATE TABLE qa_pairs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source TEXT DEFAULT 'agent_approved',
    inquiry_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/agents/helpdesk/agent.py` | LangGraph グラフ |
| `backend/agents/helpdesk/models.py` | State 定義 |
| `backend/agents/helpdesk/prompts.py` | プロンプト |
| `backend/agents/helpdesk/tools/search_manual.py` | ES 検索 |
| `backend/agents/helpdesk/tools/search_qa.py` | Qdrant 検索 |
| `backend/api/routes/helpdesk.py` | API |
| `frontend/app/helpdesk/page.tsx` | ユーザーフォーム |
| `frontend/app/helpdesk/operator/page.tsx` | オペレーター画面 |
| `frontend/app/components/helpdesk/*.tsx` | UI コンポーネント |
| `backend/scripts/create_index.py` | データ投入 |

# data-analysis-agent — 詳細設計書

## 1. グラフ構造（Chapter 5 パターン）

### Data Analysis グラフ

```
generate_plan → [open_programmer → programmer → ...]×N → generate_report
```

### Programmer サブグラフ（サブタスクごと）

```
set_dataframe → generate_code → execute_code → generate_review
                    ^                               |
                    └──── リトライ (エラー時) ─────────┘
```

## 2. State 定義

```python
# backend/agents/data_analysis/models.py

class DataThread(TypedDict):
    process_id: str
    user_request: str
    code: str | None
    error: str | None
    stdout: str | None
    results: list[dict]     # 画像パスや数値結果
    is_completed: bool
    observation: str | None

class ProgrammerState(TypedDict):
    user_request: str
    data_file: str
    sandbox_id: str
    data_threads: list[DataThread]
    next_node: str

class DataAnalysisState(TypedDict):
    user_request: str
    sub_tasks: list[str]
    sub_task_threads: list[DataThread]
    next_node: str
```

## 3. E2B サンドボックス連携

```python
# E2B Sandbox でコード実行
from e2b_code_interpreter import AsyncSandbox

async def execute_in_sandbox(code: str, sandbox_id: str) -> ExecutionResult:
    sandbox = await AsyncSandbox.connect(sandbox_id)
    result = await sandbox.run_code(code)
    return {
        "stdout": result.logs.stdout,
        "stderr": result.logs.stderr,
        "results": result.results,  # グラフ画像等
        "error": result.error,
    }
```

## 4. API

```
POST   /api/data-analysis/upload            CSV アップロード
POST   /api/data-analysis/sessions          分析セッション作成
GET    /api/data-analysis/sessions/{id}/stream  SSE ストリーム
GET    /api/data-analysis/sessions/{id}      結果取得
```

## 5. フロントエンド画面構成

```
/data-analysis
├── CSV アップロード領域
├── データ概要表示
├── 分析リクエスト入力
├── 分析進捗（AgentProgress）
└── レポート表示（Markdown + グラフ画像）
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/agents/data_analysis/agent.py` | LangGraph グラフ |
| `backend/agents/data_analysis/models.py` | State 定義 |
| `backend/agents/data_analysis/prompts.py` | プロンプト |
| `backend/agents/data_analysis/nodes/generate_code.py` | コード生成 |
| `backend/agents/data_analysis/nodes/execute_code.py` | サンドボックス実行 |
| `backend/agents/data_analysis/nodes/generate_review.py` | レビュー |
| `backend/api/routes/data_analysis.py` | API |
| `frontend/app/data-analysis/page.tsx` | 画面 |
| `frontend/app/components/data-analysis/FileUploader.tsx` | ファイルアップロード |
| `frontend/app/components/data-analysis/ReportViewer.tsx` | レポート表示 |

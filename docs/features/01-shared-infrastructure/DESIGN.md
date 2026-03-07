# shared-infrastructure — 詳細設計書

## 1. Docker Compose

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [elasticsearch, qdrant]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]

  elasticsearch:
    build: ./.docker
    ports: ["9200:9200"]
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"

  qdrant:
    image: qdrant/qdrant:latest
    ports: ["6333:6333"]
    volumes: ["qdrant_data:/qdrant/storage"]
```

## 2. Settings

```python
# backend/common/configs.py
class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4o"
    elasticsearch_url: str = "http://elasticsearch:9200"
    qdrant_url: str = "http://qdrant:6333"
    e2b_api_key: str = ""
    tavily_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./demo.db"
    daily_limit: int = 50
```

## 3. 共通 DB

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    agent_type TEXT NOT NULL,       -- helpdesk / data_analysis / marketing / proposal
    status TEXT DEFAULT 'pending',
    input JSON,
    output JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

エージェント固有のテーブル（inquiries, qa_pairs 等）は各フィーチャーで追加定義する。

## 4. SSE ストリーミングヘルパー

```python
# backend/common/streaming.py
import json
from datetime import datetime, timezone
from sse_starlette.sse import EventSourceResponse

async def stream_agent_events(
    session_id: str,
    agent_type: str,
    graph,
    initial_state: dict,
    session_repo,
):
    """全エージェント共通の SSE ストリーミング。

    イベント種別:
      - session_start: ストリーム開始
      - node_start / node_complete: 各ノードの開始・完了
      - error: 回復可能なエラー（リトライ中など）
      - done: 全処理完了 (status: completed | failed)
    """
    now = lambda: datetime.now(timezone.utc).isoformat()

    yield {
        "event": "session_start",
        "data": json.dumps(
            {"timestamp": now(), "session_id": session_id, "agent_type": agent_type},
            ensure_ascii=False,
        ),
    }

    try:
        async for event in graph.astream(initial_state):
            for node_name, output in event.items():
                yield {
                    "event": "node_start",
                    "data": json.dumps(
                        {"timestamp": now(), "node": node_name},
                        ensure_ascii=False,
                    ),
                }
                yield {
                    "event": "node_complete",
                    "data": json.dumps(
                        {"timestamp": now(), "node": node_name, "output": output},
                        ensure_ascii=False,
                        default=str,
                    ),
                }

        await session_repo.update_status(session_id, "completed")
        yield {
            "event": "done",
            "data": json.dumps(
                {"timestamp": now(), "session_id": session_id, "status": "completed"},
                ensure_ascii=False,
            ),
        }

    except Exception as exc:
        await session_repo.update_status(session_id, "failed")
        yield {
            "event": "error",
            "data": json.dumps(
                {"timestamp": now(), "code": "INTERNAL_ERROR", "message": str(exc)},
                ensure_ascii=False,
            ),
        }
        yield {
            "event": "done",
            "data": json.dumps(
                {"timestamp": now(), "session_id": session_id, "status": "failed"},
                ensure_ascii=False,
            ),
        }
```

## 5. エラーハンドリング共通基盤

```python
# backend/common/errors.py

class AppError(Exception):
    """アプリケーション共通エラー"""
    def __init__(self, code: str, message: str, status_code: int = 500, details: dict | None = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

# backend/api/main.py — グローバル例外ハンドラ登録
@app.exception_handler(AppError)
async def app_error_handler(request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message, "details": exc.details}},
    )

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"error": {"code": "VALIDATION_ERROR", "message": str(exc), "details": {}}},
    )
```

### 外部サービスリトライヘルパー

```python
# backend/common/retry.py
import asyncio

async def with_retry(
    fn,
    *,
    max_retries: int = 2,
    base_delay: float = 1.0,
    timeout: float = 60.0,
    error_code: str = "INTERNAL_ERROR",
    error_message: str = "外部サービスの呼び出しに失敗しました",
):
    """指数バックオフ付きリトライ。全外部サービス呼び出しで使用する。"""
    last_exc = None
    for attempt in range(max_retries + 1):
        try:
            return await asyncio.wait_for(fn(), timeout=timeout)
        except Exception as exc:
            last_exc = exc
            if attempt < max_retries:
                await asyncio.sleep(base_delay * (2 ** attempt))
    raise AppError(code=error_code, message=error_message, status_code=502, details={"cause": str(last_exc)})
```

### 外部サービス別の設定

| サービス | timeout | max_retries | base_delay | error_code |
|---|---|---|---|---|
| OpenAI API | 60s | 2 | 1.0s | `LLM_ERROR` |
| Elasticsearch | 10s | 2 | 1.0s | `SEARCH_ERROR` |
| Qdrant | 10s | 2 | 1.0s | `SEARCH_ERROR` |
| E2B Sandbox | 30s | 1 | 1.0s | `SANDBOX_ERROR` |
| Tavily API | 15s | 2 | 1.0s | `WEB_SEARCH_ERROR` |

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `docker-compose.yml` | ローカル開発 |
| `docker-compose.prod.yml` | 本番 |
| `.docker/Dockerfile` | ES + kuromoji |
| `backend/common/configs.py` | Settings |
| `backend/common/logger.py` | ロガー |
| `backend/common/schemas.py` | 共通スキーマ |
| `backend/common/streaming.py` | SSE ストリーミングヘルパー |
| `backend/common/errors.py` | AppError + グローバル例外ハンドラ |
| `backend/common/retry.py` | 指数バックオフ付きリトライヘルパー |
| `backend/db/database.py` | DB 接続 |
| `backend/db/repository.py` | 共通 CRUD |

# backend-core — 詳細設計書

## 1. 設定管理

```python
# backend/src/configs.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4o"
    elasticsearch_url: str = "http://elasticsearch:9200"
    qdrant_url: str = "http://qdrant:6333"
    database_url: str = "sqlite+aiosqlite:///./helpdesk.db"
    daily_limit: int = 50

    class Config:
        env_file = ".env"
```

## 2. データモデル

```python
# backend/src/models.py
from pydantic import BaseModel
from enum import Enum

class InquiryStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DRAFT = "draft"
    AUTO_APPROVED = "auto_approved"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"

class Inquiry(BaseModel):
    id: str
    question: str
    user_name: str = "匿名"
    status: InquiryStatus = InquiryStatus.PENDING
    draft_answer: str | None = None
    final_answer: str | None = None
    confidence: float | None = None
    plan: dict | None = None
    agent_result: dict | None = None
    created_at: str
    answered_at: str | None = None

class QAPair(BaseModel):
    id: str
    question: str
    answer: str
    source: str = "agent_approved"
    inquiry_id: str | None = None
    created_at: str
```

## 3. データベース

```python
# backend/db/database.py
import aiosqlite

async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect("helpdesk.db")
    db.row_factory = aiosqlite.Row
    return db

async def init_db():
    """テーブル作成（アプリ起動時に実行）"""
```

### テーブル定義

```sql
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    user_name TEXT DEFAULT '匿名',
    status TEXT DEFAULT 'pending',
    draft_answer TEXT,
    final_answer TEXT,
    confidence REAL,
    plan JSON,
    agent_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qa_pairs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source TEXT DEFAULT 'agent_approved',
    inquiry_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
);
```

## 4. Repository

```python
# backend/db/repository.py

class InquiryRepository:
    async def create(self, question: str, user_name: str) -> Inquiry: ...
    async def get(self, inquiry_id: str) -> Inquiry | None: ...
    async def list(self, status: str | None = None) -> list[Inquiry]: ...
    async def update_status(self, inquiry_id: str, status: str) -> None: ...
    async def update_draft(self, inquiry_id: str, draft: str, confidence: float) -> None: ...
    async def approve(self, inquiry_id: str, final_answer: str) -> None: ...
    async def count_today(self) -> int: ...

class QAPairRepository:
    async def create(self, question: str, answer: str, source: str, inquiry_id: str) -> QAPair: ...
    async def list(self) -> list[QAPair]: ...
```

## 5. API スキーマ

```python
# backend/api/schemas.py
from pydantic import BaseModel

class CreateInquiryRequest(BaseModel):
    question: str
    user_name: str = "匿名"

class CreateInquiryResponse(BaseModel):
    id: str
    status: str
    created_at: str

class UpdateInquiryRequest(BaseModel):
    status: str           # "approved" / "rejected"
    final_answer: str | None = None

class InquiryResponse(BaseModel):
    id: str
    question: str
    user_name: str
    status: str
    draft_answer: str | None
    final_answer: str | None
    confidence: float | None
    created_at: str
    answered_at: str | None
```

## 6. DI

```python
# backend/api/dependencies.py
from functools import lru_cache

@lru_cache
def get_settings() -> Settings: ...

async def get_inquiry_repo() -> InquiryRepository: ...
async def get_qa_repo() -> QAPairRepository: ...
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/src/configs.py` | 設定管理 |
| `backend/src/models.py` | ドメインモデル |
| `backend/api/schemas.py` | API スキーマ |
| `backend/api/dependencies.py` | DI |
| `backend/db/database.py` | DB 接続 |
| `backend/db/repository.py` | CRUD 操作 |
| `backend/src/custom_logger.py` | ロガー |

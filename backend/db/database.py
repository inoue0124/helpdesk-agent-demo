import aiosqlite

from common.logger import get_logger

logger = get_logger(__name__)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    agent_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    input JSON,
    output JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
"""


async def get_connection(database_url: str) -> aiosqlite.Connection:
    """SQLite に接続して Row ファクトリを設定する。"""
    # sqlite+aiosqlite:///./demo.db → ./demo.db
    db_path = database_url.split("///")[-1]
    db = await aiosqlite.connect(db_path)
    db.row_factory = aiosqlite.Row
    return db


async def init_db(database_url: str) -> None:
    """アプリ起動時にテーブルを作成する。"""
    db = await get_connection(database_url)
    try:
        await db.executescript(_SCHEMA)
        await db.commit()
        logger.info("Database initialized")
    finally:
        await db.close()

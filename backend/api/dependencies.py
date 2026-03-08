from collections.abc import AsyncGenerator

import aiosqlite

from common.configs import Settings, get_settings
from db.database import get_connection
from db.repository import SessionRepository

# Settings は lru_cache 済みなので re-export するだけ
__all__ = ["get_settings", "get_db", "get_session_repo"]


async def get_db(
    settings: Settings = None,
) -> AsyncGenerator[aiosqlite.Connection, None]:
    """リクエストスコープの DB コネクションを提供する。"""
    if settings is None:
        settings = get_settings()
    db = await get_connection(settings.database_url)
    try:
        yield db
    finally:
        await db.close()


async def get_session_repo(
    settings: Settings = None,
) -> AsyncGenerator[SessionRepository, None]:
    """リクエストスコープの SessionRepository を提供する。"""
    if settings is None:
        settings = get_settings()
    db = await get_connection(settings.database_url)
    try:
        yield SessionRepository(db)
    finally:
        await db.close()

import json
import uuid
from datetime import datetime, timezone

import aiosqlite


class SessionRepository:
    """sessions テーブルの CRUD 操作。"""

    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def create(self, agent_type: str, input_data: dict) -> dict:
        """セッションを作成する。"""
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()

        await self._db.execute(
            """
            INSERT INTO sessions (id, agent_type, status, input, created_at)
            VALUES (?, ?, 'pending', ?, ?)
            """,
            (session_id, agent_type, json.dumps(input_data, ensure_ascii=False), now),
        )
        await self._db.commit()

        return {
            "id": session_id,
            "agent_type": agent_type,
            "status": "pending",
            "input": input_data,
            "output": None,
            "created_at": now,
            "completed_at": None,
        }

    async def get(self, session_id: str) -> dict | None:
        """セッションを取得する。"""
        cursor = await self._db.execute(
            "SELECT * FROM sessions WHERE id = ?",
            (session_id,),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return _row_to_dict(row)

    async def list_by_agent(self, agent_type: str) -> list[dict]:
        """エージェント種別でセッション一覧を取得する。"""
        cursor = await self._db.execute(
            "SELECT * FROM sessions WHERE agent_type = ? ORDER BY created_at DESC",
            (agent_type,),
        )
        rows = await cursor.fetchall()
        return [_row_to_dict(row) for row in rows]

    async def update_status(self, session_id: str, status: str) -> None:
        """セッションのステータスを更新する。"""
        completed_at = (
            datetime.now(timezone.utc).isoformat()
            if status in ("completed", "failed")
            else None
        )
        await self._db.execute(
            "UPDATE sessions SET status = ?, completed_at = ? WHERE id = ?",
            (status, completed_at, session_id),
        )
        await self._db.commit()

    async def update_output(self, session_id: str, output: dict) -> None:
        """セッションの出力結果を保存する。"""
        await self._db.execute(
            "UPDATE sessions SET output = ? WHERE id = ?",
            (json.dumps(output, ensure_ascii=False, default=str), session_id),
        )
        await self._db.commit()

    async def count_today(self) -> int:
        """本日のセッション数を返す（レート制限用）。"""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        cursor = await self._db.execute(
            "SELECT COUNT(*) FROM sessions WHERE created_at >= ?",
            (today,),
        )
        row = await cursor.fetchone()
        return row[0] if row else 0


def _row_to_dict(row: aiosqlite.Row) -> dict:
    """Row を dict に変換し、JSON カラムをパースする。"""
    d = dict(row)
    for key in ("input", "output"):
        if d.get(key) and isinstance(d[key], str):
            d[key] = json.loads(d[key])
    return d

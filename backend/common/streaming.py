import json
from collections.abc import AsyncGenerator
from datetime import datetime, timezone

from common.logger import get_logger

logger = get_logger(__name__)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def stream_agent_events(
    session_id: str,
    agent_type: str,
    graph,
    initial_state: dict,
    session_repo,
) -> AsyncGenerator[dict[str, str], None]:
    """全エージェント共通の SSE ストリーミング。

    イベント種別:
      - session_start: ストリーム開始
      - node_start / node_complete: 各ノードの開始・完了
      - error: 回復可能なエラー（リトライ中など）
      - done: 全処理完了 (status: completed | failed)
    """
    yield {
        "event": "session_start",
        "data": json.dumps(
            {"timestamp": _now(), "session_id": session_id, "agent_type": agent_type},
            ensure_ascii=False,
        ),
    }

    try:
        async for event in graph.astream(initial_state):
            for node_name, output in event.items():
                yield {
                    "event": "node_start",
                    "data": json.dumps(
                        {"timestamp": _now(), "node": node_name},
                        ensure_ascii=False,
                    ),
                }
                yield {
                    "event": "node_complete",
                    "data": json.dumps(
                        {"timestamp": _now(), "node": node_name, "output": output},
                        ensure_ascii=False,
                        default=str,
                    ),
                }

        await session_repo.update_status(session_id, "completed")
        yield {
            "event": "done",
            "data": json.dumps(
                {"timestamp": _now(), "session_id": session_id, "status": "completed"},
                ensure_ascii=False,
            ),
        }

    except Exception as exc:
        logger.exception("Agent stream error for session %s", session_id)
        await session_repo.update_status(session_id, "failed")
        yield {
            "event": "error",
            "data": json.dumps(
                {"timestamp": _now(), "code": "INTERNAL_ERROR", "message": str(exc)},
                ensure_ascii=False,
            ),
        }
        yield {
            "event": "done",
            "data": json.dumps(
                {"timestamp": _now(), "session_id": session_id, "status": "failed"},
                ensure_ascii=False,
            ),
        }

import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar

from common.errors import AppError
from common.logger import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


async def with_retry(
    fn: Callable[[], Awaitable[T]],
    *,
    max_retries: int = 2,
    base_delay: float = 1.0,
    timeout: float = 60.0,
    error_code: str = "INTERNAL_ERROR",
    error_message: str = "外部サービスの呼び出しに失敗しました",
) -> T:
    """指数バックオフ付きリトライ。全外部サービス呼び出しで使用する。"""
    last_exc: Exception | None = None

    for attempt in range(max_retries + 1):
        try:
            return await asyncio.wait_for(fn(), timeout=timeout)
        except Exception as exc:
            last_exc = exc
            logger.warning(
                "Retry %d/%d failed for %s: %s",
                attempt + 1,
                max_retries + 1,
                error_code,
                exc,
            )
            if attempt < max_retries:
                await asyncio.sleep(base_delay * (2**attempt))

    raise AppError(
        code=error_code,
        message=error_message,
        status_code=502,
        details={"cause": str(last_exc)},
    )

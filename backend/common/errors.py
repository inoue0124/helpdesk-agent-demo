class AppError(Exception):
    """アプリケーション共通エラー。

    全 API エンドポイントで統一的なエラーレスポンスを返すために使用する。
    レスポンス形式: {"error": {"code": "...", "message": "...", "details": {}}}
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 500,
        details: dict | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)

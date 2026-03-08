from pydantic import BaseModel


class SessionCreate(BaseModel):
    """セッション作成リクエスト（共通部分）。エージェント固有フィールドは各ルートで拡張する。"""

    input: dict


class SessionResponse(BaseModel):
    """セッション取得レスポンス。"""

    id: str
    agent_type: str
    status: str
    input: dict | None = None
    output: dict | None = None
    created_at: str
    completed_at: str | None = None


class ErrorDetail(BaseModel):
    """エラーレスポンスの内部構造。"""

    code: str
    message: str
    details: dict = {}


class ErrorResponse(BaseModel):
    """エラーレスポンス。"""

    error: ErrorDetail

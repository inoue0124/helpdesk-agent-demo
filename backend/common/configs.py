from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """全エージェント共通の設定。環境変数または .env から読み込む。"""

    openai_api_key: str
    openai_model: str = "gpt-4o"

    elasticsearch_url: str = "http://elasticsearch:9200"
    qdrant_url: str = "http://qdrant:6333"

    e2b_api_key: str = ""
    tavily_api_key: str = ""

    database_url: str = "sqlite+aiosqlite:///./demo.db"
    daily_limit: int = 50

    model_config = {"env_file": ".env"}


@lru_cache
def get_settings() -> Settings:
    return Settings()

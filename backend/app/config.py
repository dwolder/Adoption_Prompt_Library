"""Application configuration from environment variables."""
from pathlib import Path

from pydantic_settings import BaseSettings

# Load .env from the backend directory so it works regardless of current working directory
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Load from .env; never hardcode secrets."""

    database_url: str = "postgresql://localhost/prompt_library"
    secret_key: str = "dev-secret-change-in-production"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    openai_api_key: str = ""  # Set in .env for "Help me create a prompt" AI generation

    class Config:
        env_file = str(_ENV_FILE) if _ENV_FILE.exists() else ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


def get_cors_origins() -> list[str]:
    """Return list of allowed CORS origins."""
    from app.config import get_settings
    s = get_settings()
    return [o.strip() for o in s.cors_origins.split(",") if o.strip()]


def get_settings() -> Settings:
    return Settings()

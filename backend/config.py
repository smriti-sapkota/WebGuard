from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    # Either DATABASE_URL (hosted, e.g. Neon) or the individual DATABASE_* parts (local/docker).
    DATABASE_URL: Optional[str] = None
    DATABASE_NAME: Optional[str] = None
    DATABASE_USERNAME: Optional[str] = None
    DATABASE_PASSWORD: Optional[str] = None
    DATABASE_HOST: Optional[str] = None
    DATABASE_PORT: int = 5432

    # Auth
    JWT_SECRET: str = "dev-only-change-me"
    JWT_EXPIRE_HOURS: int = 24 * 7
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Comma-separated list of allowed frontend origins
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Abuse protection
    MAX_SCANS_PER_HOUR: int = 10
    ALLOW_PRIVATE_TARGETS: bool = False  # set true ONLY for local development (e.g. DVWA)

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def sqlalchemy_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            for prefix in ("postgresql://", "postgres://"):
                if url.startswith(prefix):
                    url = "postgresql+psycopg://" + url[len(prefix):]
            return url
        return (
            f"postgresql+psycopg://{self.DATABASE_USERNAME}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()

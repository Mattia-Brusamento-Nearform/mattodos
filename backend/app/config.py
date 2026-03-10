from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://mattodos_user:mattodos_password@db:5432/mattodos"
    cors_origins: str = "http://localhost:3000"

    model_config = {"env_file": ".env"}


settings = Settings()

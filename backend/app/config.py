from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AI Chemistry Video"
    database_url: str = "postgresql+psycopg://chemistry:chemistry_dev@localhost:5432/chemistry_video"
    redis_url: str = "redis://localhost:6379/0"
    storage_backend: str = "local"
    local_storage_dir: str = "./var/artifacts"


settings = Settings()

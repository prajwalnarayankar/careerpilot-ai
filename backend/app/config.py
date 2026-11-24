import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerPilot AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Security
    SECRET_KEY: str = "careerpilot_super_secret_jwt_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'careerpilot.db'}"
    
    # AI / LLM
    LLM_PROVIDER: str = "local"  # "openai", "gemini", "anthropic", "local"
    LLM_MODEL: str = "heuristic-nlp-engine"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = ""
    LLM_TEMPERATURE: float = 0.7
    
    # Demo & Operation Modes
    DEMO_MODE: bool = True
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

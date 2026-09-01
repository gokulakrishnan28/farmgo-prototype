import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file (look in root project dir)
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "FarmGo Platform"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforfarmgoprototypedevelopment")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/farmgo"
    )
    
    # AI / LLM
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Government Open Data (data.gov.in)
    OGD_API_KEY: str = os.getenv("OGD_API_KEY", "")
    OGD_BASE_URL: str = "https://api.data.gov.in/resource"
    
    # Feature flags
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["*"]

settings = Settings()

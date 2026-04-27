"""
PitWall AI — Configuration
Loads environment variables for LLM, data, and server settings.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # LLM
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "ollama")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:14b-instruct")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Data
    FASTF1_CACHE_DIR: str = os.getenv("FASTF1_CACHE_DIR", "./cache/fastf1")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

    # Server - CORS configuration
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") else ["*"]


settings = Settings()

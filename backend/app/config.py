from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    DATABASE_URL: str
    
    # Redis / Upstash
    UPSTASH_REDIS_REST_URL: str
    UPSTASH_REDIS_REST_TOKEN: str
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    
    # OpenAI API
    OPENAI_API_KEY: str = ""
    
    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - as string, we'll parse it
    CORS_ORIGINS: str = "*"
    
    # Admin
    ADMIN_EMAIL: str = ""
    
    class Config:
        env_file = ".env"

    @property
    def cors_origins_list(self):
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()

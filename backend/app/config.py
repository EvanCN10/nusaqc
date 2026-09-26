from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "NusaQC Backend"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    DATABASE_URL: str = "sqlite:///./nusaqc.db"
    ENABLE_MOCK_HARDWARE: bool = True
    MODEL_DIR: str = "./models_weights"
    UPLOAD_DIR: str = "./uploads"

    # AWS Bedrock Configuration
    AWS_REGION: str = "us-east-1"
    AWS_BEARER_TOKEN_BEDROCK: str = ""
    AWS_BEDROCK_MODEL_ID: str = "amazon.nova-pro-v1:0"

    # Certificate & Tracking Configuration
    CERTIFICATE_ISSUER: str = "PT Nusantara Quality Control"
    CERTIFICATE_STANDARD: str = "SNI 01-2729:2013 | HACCP Level II"
    APP_PUBLIC_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

"""
Configuración de variables de entorno y parámetros globales para la aplicación de estadísticas deportivas.

Utiliza Pydantic y dotenv para cargar y validar las variables de entorno necesarias para la conexión a MongoDB, Redis, JWT y otros parámetros globales.
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class Settings(BaseSettings):
    """
    Clase de configuración que carga y valida las variables de entorno necesarias para la aplicación.
    """
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://mongo:27017/statistics")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your_secret_here")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    TIMEZONE: str = os.getenv("TIMEZONE", "UTC")

settings = Settings()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
import logging
import pytz
import uvicorn
from app.api.endpoints.teams import router as teams_router
from app.api.endpoints.players import router as athletes_router
from app.api.endpoints.competition import router as competitions_router
from app.api.endpoints.matches import router as matches_router
from app.api.endpoints.arbitre import router as arbitre_router
from app.api.endpoints.season import router as season_router
from app.api.endpoints.result import router as result_router
from app.api.endpoints.event_match import router as event_match_router
from app.api.endpoints.scoreboard import router as scoreboard_router
from app.api.endpoints.table_rating import router as table_rating_router
from app.api.endpoints.position_table import router as position_table_router
from app.api.endpoints.catalog_item import router as catalog_item_router
from app.api.endpoints.statistics_competence import router as statistic_competence_router
from app.api.endpoints.statistic_individual import router as statistic_individual_router
from app.api.endpoints.statistic_team import router as statistic_team_router
from app.api.endpoints.statistic_season import router as statistic_season_router
from app.api.endpoints.table_rating_competition import router as table_rating_competition_router

app = FastAPI(title="Statistics Microservice", version="1.0.0")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS] if settings.CORS_ORIGINS != '*' else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

# Timezone global
import os
os.environ["TZ"] = settings.TIMEZONE

@app.on_event("startup")
async def startup_event():
    try:
        logger.info("Iniciando el microservicio de estadísticas...")
        await connect_to_mongo()
        logger.info("Microservicio de estadísticas iniciado exitosamente.")
    except Exception as e:
        logger.error(f"Error al iniciar el microservicio: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    try:
        logger.info("Deteniendo el microservicio de estadísticas...")
        await close_mongo_connection()
        logger.info("Microservicio de estadísticas detenido exitosamente.")
    except Exception as e:
        logger.error(f"Error al detener el microservicio: {str(e)}")
        raise

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Verificar el estado del servicio y sus dependencias
    """
    health_status = {
        "status": "ok",
        "details": {
            "mongodb": "ok",
        }
    }
    
    try:
        from app.database.mongodb import get_database
        db = get_database()
        await db.command("ping")
    except Exception as e:
        health_status["details"]["mongodb"] = "error"
        health_status["status"] = "degraded"
    
    return health_status

# Routers principales
app.include_router(teams_router)
app.include_router(athletes_router)
app.include_router(competitions_router)
app.include_router(matches_router)
app.include_router(arbitre_router)
app.include_router(season_router)
app.include_router(result_router)
app.include_router(event_match_router)
app.include_router(scoreboard_router)
app.include_router(table_rating_router)
app.include_router(position_table_router)
app.include_router(catalog_item_router)
app.include_router(statistic_competence_router)
app.include_router(statistic_individual_router)
app.include_router(statistic_team_router)
app.include_router(statistic_season_router)
app.include_router(table_rating_competition_router)

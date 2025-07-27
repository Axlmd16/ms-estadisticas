from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.statistics_competence_schema import (
    StatisticCompetenceCreate,
    StatisticCompetenceUpdate,
    StatisticCompetenceResponse,
)
from beanie import PydanticObjectId
from app.services.statistics_competence_service import statistic_competence_service
from bson import ObjectId

router = APIRouter(prefix="/api/v1/statistics/competence", tags=["StatisticCompetence"])

@router.post("/", response_model=StatisticCompetenceResponse, status_code=status.HTTP_201_CREATED)
async def create_statistic_competence(stat: StatisticCompetenceCreate):
    """
    Crea una nueva estadística de competencia.

    Args:
        stat (StatisticCompetenceCreate): Datos de la estadística de competencia a crear.
    Returns:
        StatisticCompetenceResponse: Estadística de competencia creada.
    """
    return await statistic_competence_service.create_statistic_competence(stat)

@router.get("/", response_model=List[StatisticCompetenceResponse])
async def list_statistic_competences():
    """
    Obtiene la lista de todas las estadísticas de competencia registradas.

    Returns:
        List[StatisticCompetenceResponse]: Lista de estadísticas de competencia.
    """
    return await statistic_competence_service.list_statistic_competences()

@router.get("/by-competition/{competition_id}", response_model=StatisticCompetenceResponse)
async def get_statistic_competence_by_competition(competition_id: str):
    """
    Obtiene las estadísticas de una competencia específica por el ID de la competencia.

    Args:
        competition_id (str): ID de la competencia.
    Returns:
        StatisticCompetenceResponse: Estadísticas de la competencia solicitada.
    """
    return await statistic_competence_service.get_statistic_competence_by_competition(competition_id)

@router.get("/{stat_id}", response_model=StatisticCompetenceResponse)
async def get_statistic_competence(stat_id: PydanticObjectId):
    """
    Obtiene la información de una estadística de competencia específica por su ID.

    Args:
        stat_id (PydanticObjectId): ID de la estadística de competencia.
    Returns:
        StatisticCompetenceResponse: Información de la estadística de competencia solicitada.
    """
    return await statistic_competence_service.get_statistic_competence(stat_id)

@router.put("/{stat_id}", response_model=StatisticCompetenceResponse)
async def update_statistic_competence(stat_id: PydanticObjectId, stat: StatisticCompetenceUpdate):
    """
    Actualiza la información de una estadística de competencia existente.

    Args:
        stat_id (PydanticObjectId): ID de la estadística de competencia a actualizar.
        stat (StatisticCompetenceUpdate): Datos nuevos de la estadística de competencia.
    Returns:
        StatisticCompetenceResponse: Estadística de competencia actualizada.
    """
    return await statistic_competence_service.update_statistic_competence(stat_id, stat)

@router.delete("/{stat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_statistic_competence(stat_id: PydanticObjectId):
    """
    Elimina una estadística de competencia del sistema por su ID.

    Args:
        stat_id (PydanticObjectId): ID de la estadística de competencia a eliminar.
    Returns:
        None
    """
    await statistic_competence_service.delete_statistic_competence(stat_id)
    return None

@router.post("/recalculate/{statistic_competence_id}/{competition_id}", response_model=StatisticCompetenceResponse)
async def recalculate_statistic_competence(statistic_competence_id: PydanticObjectId, competition_id: PydanticObjectId):
    """
    Recalcula y actualiza la estadística de competencia para una competición específica.

    Args:
        statistic_competence_id (PydanticObjectId): ID del registro de StatisticCompetence a actualizar.
        competition_id (PydanticObjectId): ID de la competición.
    Returns:
        StatisticCompetenceResponse: Estadística de competencia recalculada y actualizada.
    """
    try:
        comp_obj_id = ObjectId(str(competition_id))
        stat_obj_id = ObjectId(str(statistic_competence_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido para competición o estadística")
    stat = await statistic_competence_service.update_statistic_competence_for_competition(stat_obj_id, str(comp_obj_id))
    return stat

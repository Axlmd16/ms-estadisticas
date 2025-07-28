from fastapi import APIRouter, status, Path
from typing import List
from beanie import PydanticObjectId
from app.schemas.statistic_individual_schema import (
    StatisticIndividualCreate,
    StatisticIndividualUpdate,
    StatisticIndividualResponse,
    StatisticIndividualWithAthleteResponse,
)
from app.services.statistic_individual_service import statistic_individual_service

router = APIRouter(prefix="/api/v1/statistics/individual", tags=["Statistics Individual"])

@router.post("/", response_model=StatisticIndividualResponse, status_code=status.HTTP_201_CREATED)
async def create_statistic(data: StatisticIndividualCreate):
    """
    Crea una nueva estadística individual para un jugador.

    Args:
        data (StatisticIndividualCreate): Datos de la estadística individual a crear.
    Returns:
        StatisticIndividualResponse: Estadística individual creada.
    """
    return await statistic_individual_service.create_statistic(data)

@router.get("/", response_model=List[StatisticIndividualResponse])
async def list_statistics():
    """
    Obtiene la lista de todas las estadísticas individuales registradas.

    Returns:
        List[StatisticIndividualResponse]: Lista de estadísticas individuales.
    """
    return await statistic_individual_service.list_statistics()

@router.get("/{stat_id}", response_model=StatisticIndividualResponse)
async def get_statistic(stat_id: PydanticObjectId):
    """
    Obtiene la información de una estadística individual específica por su ID.

    Args:
        stat_id (PydanticObjectId): ID de la estadística individual.
    Returns:
        StatisticIndividualResponse: Información de la estadística individual solicitada.
    """
    return await statistic_individual_service.get_statistic(stat_id)

@router.put("/{stat_id}", response_model=StatisticIndividualResponse)
async def update_statistic(stat_id: PydanticObjectId, data: StatisticIndividualUpdate):
    """
    Actualiza la información de una estadística individual existente.

    Args:
        stat_id (PydanticObjectId): ID de la estadística individual a actualizar.
        data (StatisticIndividualUpdate): Datos nuevos de la estadística individual.
    Returns:
        StatisticIndividualResponse: Estadística individual actualizada.
    """
    return await statistic_individual_service.update_statistic(stat_id, data)

@router.get("/by-athlete/{athlete_id}", response_model=StatisticIndividualWithAthleteResponse)
async def get_statistic_by_athlete_id(athlete_id: str = Path(...)):
    """
    Obtiene las estadísticas individuales de un atleta específico con información completa del atleta.

    Args:
        athlete_id (str): ID del atleta.
    Returns:
        StatisticIndividualWithAthleteResponse: Estadísticas del atleta con información completa.
    """
    return await statistic_individual_service.get_statistic_by_athlete_id(athlete_id)

@router.delete("/{stat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_statistic(stat_id: PydanticObjectId):
    """
    Elimina una estadística individual del sistema por su ID.

    Args:
        stat_id (PydanticObjectId): ID de la estadística individual a eliminar.
    Returns:
        None
    """
    await statistic_individual_service.delete_statistic(stat_id)
    return None

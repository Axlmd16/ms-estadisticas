from fastapi import APIRouter, Depends, Path
from beanie import PydanticObjectId

from app.schemas.statistics_team_schema import (
    StatisticTeamCreate,
    StatisticTeamUpdate,
    StatisticTeamResponse,
    StatisticTeamWithTeamResponse
)
from app.services.statistics_team_service import statistic_team_service

router = APIRouter(prefix="/api/v1/statistics/team", tags=["Statistic Team"])

@router.post("/", response_model=StatisticTeamResponse)
async def create_statistic_team(stat: StatisticTeamCreate):
    """
    Crea una nueva estadística de equipo.

    Args:
        stat (StatisticTeamCreate): Datos de la estadística de equipo a crear.
    Returns:
        StatisticTeamResponse: Estadística de equipo creada.
    """
    return await statistic_team_service.create_statistic_team(stat)

@router.get("/", response_model=list[StatisticTeamResponse])
async def list_statistic_teams():
    """
    Obtiene la lista de todas las estadísticas de equipo registradas.

    Returns:
        list[StatisticTeamResponse]: Lista de estadísticas de equipo.
    """
    return await statistic_team_service.list_statistic_teams()

@router.get("/by-team/{team_id}", response_model=StatisticTeamWithTeamResponse)
async def get_statistic_team_by_team_id(team_id: str = Path(...)):
    """
    Obtiene las estadísticas de un equipo específico buscando por su ID de equipo.

    Args:
        team_id (str): ID del equipo.
    Returns:
        StatisticTeamWithTeamResponse: Información de la estadística de equipo con datos del equipo incluidos.
    """
    return await statistic_team_service.get_statistic_team_by_team_id(team_id)

@router.get("/{stat_id}", response_model=StatisticTeamResponse)
async def get_statistic_team(stat_id: PydanticObjectId = Path(...)):
    """
    Obtiene la información de una estadística de equipo específica por su ID.

    Args:
        stat_id (PydanticObjectId): ID de la estadística de equipo.
    Returns:
        StatisticTeamResponse: Información de la estadística de equipo solicitada.
    """
    return await statistic_team_service.get_statistic_team(stat_id)

@router.get("/{stat_id}/with-team-info", response_model=StatisticTeamWithTeamResponse)
async def get_statistic_team_with_info(stat_id: PydanticObjectId = Path(...)):
    """
    Obtiene la información de una estadística de equipo con información completa del equipo.

    Args:
        stat_id (PydanticObjectId): ID de la estadística de equipo.
    Returns:
        StatisticTeamWithTeamResponse: Información de la estadística de equipo con datos del equipo incluidos.
    """
    return await statistic_team_service.get_statistic_team_with_team_info(stat_id)

@router.put("/{stat_id}", response_model=StatisticTeamResponse)
async def update_statistic_team(
    stat_id: PydanticObjectId = Path(...),
    stat: StatisticTeamUpdate = Depends()
):
    """
    Actualiza la información de una estadística de equipo existente.

    Args:
        stat_id (PydanticObjectId): ID de la estadística de equipo a actualizar.
        stat (StatisticTeamUpdate): Datos nuevos de la estadística de equipo.
    Returns:
        StatisticTeamResponse: Estadística de equipo actualizada.
    """
    return await statistic_team_service.update_statistic_team(stat_id, stat)

@router.delete("/{stat_id}")
async def delete_statistic_team(stat_id: PydanticObjectId = Path(...)):
    """
    Elimina una estadística de equipo del sistema por su ID.

    Args:
        stat_id (PydanticObjectId): ID de la estadística de equipo a eliminar.
    Returns:
        dict: Mensaje de éxito.
    """
    await statistic_team_service.delete_statistic_team(stat_id)
    return {"message": "StatisticTeam deleted successfully"}

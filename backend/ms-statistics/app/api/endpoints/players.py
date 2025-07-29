from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.athlete_schema import AthleteCreate, AthleteUpdate, AthleteResponse
from beanie import PydanticObjectId
from app.services.player_service import player_service

router = APIRouter(prefix="/api/v1/athletes", tags=["Athletes"])

@router.post("/", response_model=AthleteResponse, status_code=status.HTTP_201_CREATED)
async def create_athlete(athlete: AthleteCreate):
    """
    Crea un nuevo atleta (jugador) en el sistema.

    Args:
        athlete (AthleteCreate): Datos del atleta a crear.
    Returns:
        AthleteResponse: Atleta creado con su información.
    """
    return await player_service.create_athlete(athlete)

@router.get("/", response_model=List[AthleteResponse])
async def list_athletes():
    """
    Obtiene la lista de todos los atletas registrados.

    Returns:
        List[AthleteResponse]: Lista de atletas.
    """
    return await player_service.list_athletes()

@router.get("/{athlete_id}", response_model=AthleteResponse)
async def get_athlete(athlete_id: PydanticObjectId):
    """
    Obtiene la información de un atleta específico por su ID.

    Args:
        athlete_id (PydanticObjectId): ID del atleta.
    Returns:
        AthleteResponse: Información del atleta solicitado.
    """
    return await player_service.get_athlete(athlete_id)

@router.put("/{athlete_id}", response_model=AthleteResponse)
async def update_athlete(athlete_id: PydanticObjectId, athlete: AthleteUpdate):
    """
    Actualiza la información de un atleta existente.

    Args:
        athlete_id (PydanticObjectId): ID del atleta a actualizar.
        athlete (AthleteUpdate): Datos nuevos del atleta.
    Returns:
        AthleteResponse: Atleta actualizado.
    """
    return await player_service.update_athlete(athlete_id, athlete)

@router.get("/team/{team_id}", response_model=List[AthleteResponse])
async def get_athletes_by_team(team_id: PydanticObjectId):
    """
    Obtiene todos los atletas (jugadores) de un equipo específico.

    Args:
        team_id (PydanticObjectId): ID del equipo.
    Returns:
        List[AthleteResponse]: Lista de atletas del equipo.
    """
    return await player_service.get_athletes_by_team(team_id)

@router.delete("/{athlete_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_athlete(athlete_id: PydanticObjectId):
    """
    Elimina un atleta del sistema por su ID.

    Args:
        athlete_id (PydanticObjectId): ID del atleta a eliminar.
    Returns:
        None
    """
    await player_service.delete_athlete(athlete_id)
    return None

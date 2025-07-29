from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.match_schema import MatchCreate, MatchUpdate, MatchResponse, MatchWithTeamsResponse
from beanie import PydanticObjectId
from app.services.match_service import match_service

router = APIRouter(prefix="/api/v1/matches", tags=["Matches"])

@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(match: MatchCreate):
    """
    Crea un nuevo partido.

    Args:
        match (MatchCreate): Datos del partido a crear.
    Returns:
        MatchResponse: Partido creado con su información.
    """
    return await match_service.create_match(match)

@router.get("/", response_model=List[MatchResponse])
async def list_matches():
    """
    Obtiene la lista de todos los partidos registrados.

    Returns:
        List[MatchResponse]: Lista de partidos.
    """
    return await match_service.list_matches()

@router.get("/with-teams", response_model=List[MatchWithTeamsResponse])
async def list_matches_with_teams():
    """
    Obtiene la lista de todos los partidos con información completa de los equipos.

    Returns:
        List[MatchWithTeamsResponse]: Lista de partidos con información de equipos.
    """
    return await match_service.list_matches_with_teams()

@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: PydanticObjectId):
    """
    Obtiene la información de un partido específico por su ID.

    Args:
        match_id (PydanticObjectId): ID del partido.
    Returns:
        MatchResponse: Información del partido solicitado.
    """
    return await match_service.get_match(match_id)

@router.get("/{match_id}/with-teams", response_model=MatchWithTeamsResponse)
async def get_match_with_teams(match_id: PydanticObjectId):
    """
    Obtiene la información de un partido específico con detalles de los equipos.

    Args:
        match_id (PydanticObjectId): ID del partido.
    Returns:
        MatchWithTeamsResponse: Información del partido con equipos.
    """
    return await match_service.get_match_with_teams(match_id)

@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(match_id: PydanticObjectId, match: MatchUpdate):
    """
    Actualiza la información de un partido existente.

    Args:
        match_id (PydanticObjectId): ID del partido a actualizar.
        match (MatchUpdate): Datos nuevos del partido.
    Returns:
        MatchResponse: Partido actualizado.
    """
    return await match_service.update_match(match_id, match)

@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match(match_id: PydanticObjectId):
    """
    Elimina un partido del sistema por su ID.

    Args:
        match_id (PydanticObjectId): ID del partido a eliminar.
    Returns:
        None
    """
    await match_service.delete_match(match_id)
    return None

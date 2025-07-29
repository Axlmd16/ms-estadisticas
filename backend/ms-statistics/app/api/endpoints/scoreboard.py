from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.scoreboard_schema import ScoreboardCreate, ScoreboardUpdate, ScoreboardResponse
from beanie import PydanticObjectId
from app.services.scoreboard_service import scoreboard_service
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/scoreboards", tags=["Scoreboards"])

class StartGameRequest(BaseModel):
    start_game: bool

@router.post("/", response_model=ScoreboardResponse, status_code=status.HTTP_201_CREATED)
async def create_scoreboard(scoreboard: ScoreboardCreate):
    """
    Crea un nuevo marcador (scoreboard).

    Args:
        scoreboard (ScoreboardCreate): Datos del marcador a crear.
    Returns:
        ScoreboardResponse: Marcador creado con su información.
    """
    return await scoreboard_service.create_scoreboard(scoreboard)

@router.get("/", response_model=List[ScoreboardResponse])
async def list_scoreboards():
    """
    Obtiene la lista de todos los marcadores registrados.

    Returns:
        List[ScoreboardResponse]: Lista de marcadores.
    """
    return await scoreboard_service.list_scoreboards()

@router.get("/{scoreboard_id}", response_model=ScoreboardResponse)
async def get_scoreboard(scoreboard_id: PydanticObjectId):
    """
    Obtiene la información de un marcador específico por su ID.

    Args:
        scoreboard_id (PydanticObjectId): ID del marcador.
    Returns:
        ScoreboardResponse: Información del marcador solicitado.
    """
    return await scoreboard_service.get_scoreboard(scoreboard_id)

@router.put("/{scoreboard_id}", response_model=ScoreboardResponse)
async def update_scoreboard(scoreboard_id: PydanticObjectId, scoreboard: ScoreboardUpdate):
    """
    Actualiza la información de un marcador existente.

    Args:
        scoreboard_id (PydanticObjectId): ID del marcador a actualizar.
        scoreboard (ScoreboardUpdate): Datos nuevos del marcador.
    Returns:
        ScoreboardResponse: Marcador actualizado.
    """
    return await scoreboard_service.update_scoreboard(scoreboard_id, scoreboard)

@router.delete("/{scoreboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scoreboard(scoreboard_id: PydanticObjectId):
    """
    Elimina un marcador del sistema por su ID.

    Args:
        scoreboard_id (PydanticObjectId): ID del marcador a eliminar.
    Returns:
        None
    """
    await scoreboard_service.delete_scoreboard(scoreboard_id)
    return None

# Actualizar is_final de un scoreboard
@router.put("/{scoreboard_id}/finalize", response_model=ScoreboardResponse)
async def finalize_scoreboard(scoreboard_id: PydanticObjectId):
    """
    Marca un marcador como finalizado (is_final=True).

    Args:
        scoreboard_id (PydanticObjectId): ID del marcador a finalizar.
    Returns:
        ScoreboardResponse: Marcador actualizado como finalizado.
    Raises:
        HTTPException: Si el marcador no existe.
    """
    scoreboard = await scoreboard_service.finalize_scoreboard(scoreboard_id)
    if not scoreboard:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scoreboard not found")
    return scoreboard

# Nuevo endpoint para iniciar el partido
@router.post("/{scoreboard_id}/start-game", response_model=ScoreboardResponse)
async def start_game(scoreboard_id: PydanticObjectId, request: StartGameRequest):
    """
    Inicia el conteo de tiempo de un partido.

    Args:
        scoreboard_id (PydanticObjectId): ID del marcador.
        request (StartGameRequest): Objeto con el boolean start_game.
    Returns:
        ScoreboardResponse: Marcador con el tiempo iniciado.
    Raises:
        HTTPException: Si el marcador no existe o si start_game no es True.
    """
    if not request.start_game:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="start_game must be True to start the game"
        )
    
    scoreboard = await scoreboard_service.start_game_timer(scoreboard_id)
    if not scoreboard:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scoreboard not found")
    return scoreboard
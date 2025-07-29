from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.event_match_schema import EventMatchCreate, EventMatchUpdate, EventMatchResponse
from beanie import PydanticObjectId
from app.services.event_match_service import event_match_service

router = APIRouter(prefix="/api/v1/event_matches", tags=["EventMatches"])

@router.post("/", response_model=EventMatchResponse, status_code=status.HTTP_201_CREATED)
async def create_event_match(event: EventMatchCreate):
    """
    Crea un nuevo evento de partido.

    Args:
        event (EventMatchCreate): Datos del evento a crear.
    Returns:
        EventMatchResponse: Evento de partido creado.
    """
    return await event_match_service.create_event_match(event)

@router.get("/", response_model=List[EventMatchResponse])
async def list_event_matches():
    """
    Obtiene la lista de todos los eventos de partido registrados.

    Returns:
        List[EventMatchResponse]: Lista de eventos de partido.
    """
    return await event_match_service.list_event_matches()

@router.get("/{event_id}", response_model=EventMatchResponse)
async def get_event_match(event_id: PydanticObjectId):
    """
    Obtiene la información de un evento de partido específico por su ID.

    Args:
        event_id (PydanticObjectId): ID del evento de partido.
    Returns:
        EventMatchResponse: Información del evento solicitado.
    """
    return await event_match_service.get_event_match(event_id)

@router.put("/{event_id}", response_model=EventMatchResponse)
async def update_event_match(event_id: PydanticObjectId, event: EventMatchUpdate):
    """
    Actualiza la información de un evento de partido existente.

    Args:
        event_id (PydanticObjectId): ID del evento a actualizar.
        event (EventMatchUpdate): Datos nuevos del evento.
    Returns:
        EventMatchResponse: Evento de partido actualizado.
    """
    return await event_match_service.update_event_match(event_id, event)

@router.get("/match/{match_id}", response_model=List[EventMatchResponse])
async def get_events_by_match(match_id: str):
    """
    Obtiene todos los eventos de un partido específico ordenados por minuto descendente.

    Args:
        match_id (str): ID del partido.
    Returns:
        List[EventMatchResponse]: Lista de eventos del partido ordenados por minuto descendente.
    """
    return await event_match_service.get_events_by_match_str(match_id)

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_match(event_id: PydanticObjectId):
    """
    Elimina un evento de partido por su ID.

    Args:
        event_id (PydanticObjectId): ID del evento a eliminar.
    Returns:
        None
    """
    await event_match_service.delete_event_match(event_id)
    return None

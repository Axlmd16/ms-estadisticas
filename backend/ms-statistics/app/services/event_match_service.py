"""
Servicio para la gestión de eventos de partido en el sistema de estadísticas deportivas.

Incluye la lógica para crear, listar, obtener, actualizar y eliminar eventos de partido, así como la actualización automática de estadísticas individuales de los atletas según el tipo de evento registrado.
"""

import logging
from beanie import PydanticObjectId
from fastapi import HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.repositories.statistic_individual_repository import StatisticIndividualRepository
from app.models.catalog_item import CatalogItem

from app.repositories.event_match_repository import EventMatchRepository
from app.schemas.event_match_schema import (
    EventMatchCreate,
    EventMatchUpdate,
    EventMatchResponse,
)

logger = logging.getLogger(__name__)

class EventMatchService:
    """
    Servicio que encapsula la lógica de negocio para la gestión de eventos de partido.
    """
    def __init__(self):
        """
        Inicializa el servicio con los repositorios necesarios.
        """
        self.repo = EventMatchRepository()
        self.stat_repo = StatisticIndividualRepository()

    async def create_event_match(self, event: EventMatchCreate) -> EventMatchResponse:
        """
        Crea un nuevo evento de partido y actualiza las estadísticas individuales del atleta si corresponde.

        Args:
            event (EventMatchCreate): Datos del evento a crear.
        Returns:
            EventMatchResponse: Evento de partido creado.
        Raises:
            HTTPException: Si ocurre un error durante la creación.
        """
        try:
            event_data = event.model_dump(exclude_unset=True)

            athlete_oid = ObjectId(event_data["athlete_id"]) if "athlete_id" in event_data and event_data["athlete_id"] else None
            type_event_oid = ObjectId(event_data["type_event"]) if "type_event" in event_data and event_data["type_event"] else None
            match_oid = ObjectId(event_data["match_id"]) if "match_id" in event_data and event_data["match_id"] else None

            event_data["athlete_id"] = athlete_oid
            event_data["type_event"] = type_event_oid
            event_data["match_id"] = match_oid

            doc = await self.repo.create(event_data)

            # Actualizar estadísticas individuales del atleta (lógica existente)
            if athlete_oid and type_event_oid:
                catalog_item = await CatalogItem.get(type_event_oid)
                if catalog_item and catalog_item.description in ["goal", "own goal", "foul", "red card", "yellow card"]:
                    field_to_update = catalog_item.description.replace(" ", "_")

                    # Buscar con el repo, no con collection
                    existing_stat = await self.stat_repo.model.find_one({"athlete_id": athlete_oid})

                    if not existing_stat:
                        new_stat_data = {
                            "athlete_id": athlete_oid,
                            "description": catalog_item.description,
                            "date_generation": datetime.utcnow().isoformat(),
                            "value": 1,
                            field_to_update: 1
                        }
                        await self.stat_repo.create(new_stat_data)
                    else:
                        current_value = getattr(existing_stat, field_to_update, 0)
                        if current_value is None:
                            current_value = 0
                        updated_value = current_value + 1

                        update_data = {
                            field_to_update: updated_value,
                            "date_generation": datetime.utcnow().isoformat()
                        }
                        await self.stat_repo.update(existing_stat.id, update_data)
                
                # NUEVA FUNCIONALIDAD: Actualizar scoreboard si es un gol
                if catalog_item and catalog_item.code in ["GOL", "GOL_PENAL", "GOL_TIRO_LIBRE", "AUTOGOL"] and match_oid:
                    await self._update_scoreboard_on_goal(match_oid, catalog_item.code, athlete_oid)

            return EventMatchResponse(
                id=str(doc.id),
                description=doc.description,
                date_registration=doc.date_registration,
                minute=doc.minute,
                type_event=str(doc.type_event) if doc.type_event else None,
                athlete_id=str(doc.athlete_id) if doc.athlete_id else None,
                match_id=str(doc.match_id) if doc.match_id else None,
            )
        except Exception as e:
            logger.error(f"Error creating event match: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating event match: {str(e)}"
            )

    async def list_event_matches(self) -> list[EventMatchResponse]:
        """
        Obtiene la lista de todos los eventos de partido registrados.

        Returns:
            list[EventMatchResponse]: Lista de eventos de partido.
        Raises:
            HTTPException: Si ocurre un error al obtener los eventos.
        """
        try:
            events = await self.repo.list()
            return [
                EventMatchResponse(
                    id=str(e.id),
                    description=e.description,
                    date_registration=e.date_registration,
                    minute=e.minute,
                    type_event=str(e.type_event) if e.type_event else None,
                    athlete_id=str(e.athlete_id) if e.athlete_id else None,
                    match_id=str(e.match_id) if e.match_id else None,
                ) for e in events
            ]
        except Exception as e:
            logger.error(f"Error listing event matches: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving event matches"
            )

    async def get_event_match(self, event_id: PydanticObjectId) -> EventMatchResponse:
        """
        Obtiene un evento de partido por su ID.

        Args:
            event_id (PydanticObjectId): ID del evento de partido.
        Returns:
            EventMatchResponse: Evento de partido encontrado.
        Raises:
            HTTPException: Si el evento no existe.
        """
        event = await self.repo.get_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="EventMatch not found")
        return EventMatchResponse(
            id=str(event.id),
            description=event.description,
            date_registration=event.date_registration,
            minute=event.minute,
            type_event=str(event.type_event) if event.type_event else None,
            athlete_id=str(event.athlete_id) if event.athlete_id else None,
            match_id=str(event.match_id) if event.match_id else None,
        )

    async def update_event_match(self, event_id: PydanticObjectId, event: EventMatchUpdate) -> EventMatchResponse:
        """
        Actualiza los datos de un evento de partido existente.

        Args:
            event_id (PydanticObjectId): ID del evento a actualizar.
            event (EventMatchUpdate): Datos a actualizar.
        Returns:
            EventMatchResponse: Evento de partido actualizado.
        Raises:
            HTTPException: Si el evento no existe.
        """
        db_event = await self.repo.get_by_id(event_id)
        if not db_event:
            raise HTTPException(status_code=404, detail="EventMatch not found")

        update_data = event.model_dump(exclude_unset=True)

        if "type_event" in update_data and update_data["type_event"]:
            update_data["type_event"] = ObjectId(update_data["type_event"])

        if "athlete_id" in update_data and update_data["athlete_id"]:
            update_data["athlete_id"] = ObjectId(update_data["athlete_id"])
        
        if "match_id" in update_data and update_data["match_id"]:
            update_data["match_id"] = ObjectId(update_data["match_id"])

        updated = await self.repo.update(event_id, update_data)
        return EventMatchResponse(
            id=str(updated.id),
            description=updated.description,
            date_registration=updated.date_registration,
            minute=updated.minute,
            type_event=str(updated.type_event) if updated.type_event else None,
            athlete_id=str(updated.athlete_id) if updated.athlete_id else None,
            match_id=str(updated.match_id) if updated.match_id else None,
        )

    async def get_events_by_match(self, match_id: PydanticObjectId) -> list[EventMatchResponse]:
        """
        Obtiene todos los eventos de un partido específico ordenados por minuto descendente.

        Args:
            match_id (PydanticObjectId): ID del partido.
        Returns:
            list[EventMatchResponse]: Lista de eventos del partido ordenados por minuto descendente.
        Raises:
            HTTPException: Si ocurre un error al obtener los eventos.
        """
        try:
            logger.info(f"Getting events for match_id: {match_id}")
            
            # Buscar eventos por match_id
            events = await self.repo.model.find({"match_id": match_id}).sort([("minute", -1)]).to_list()
            
            logger.info(f"Found {len(events)} events for match {match_id}")
            
            return [EventMatchResponse(**event.model_dump()) for event in events]
            
        except Exception as e:
            logger.error(f"Error getting events by match {match_id}: {str(e)}")
            logger.error(f"Exception type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving events for match"
            )

    async def get_events_by_match_str(self, match_id: str) -> list[EventMatchResponse]:
        """
        Obtiene todos los eventos de un partido específico usando string ID.

        Args:
            match_id (str): ID del partido como string.
        Returns:
            list[EventMatchResponse]: Lista de eventos del partido ordenados por minuto descendente.
        """
        try:
            logger.info(f"Getting events for match_id string: {match_id}")
            
            # Intentar buscar tanto como string como ObjectId
            # Primero como string
            logger.info(f"Searching for events with match_id as string: {match_id}")
            events = await self.repo.model.find({"match_id": match_id}).sort([("minute", -1)]).to_list()
            logger.info(f"Found {len(events)} events as string")
            
            # Si no encuentra como string, intentar como ObjectId
            if not events:
                try:
                    logger.info(f"Trying with ObjectId conversion for: {match_id}")
                    object_id = ObjectId(match_id)
                    events = await self.repo.model.find({"match_id": object_id}).sort([("minute", -1)]).to_list()
                    logger.info(f"Found {len(events)} events as ObjectId")
                except Exception as ex:
                    logger.warning(f"Failed to convert to ObjectId: {ex}")
            
            logger.info(f"Final result: Found {len(events)} events for match {match_id}")
            
            return [EventMatchResponse(**event.model_dump()) for event in events]
            
        except Exception as e:
            logger.error(f"Error getting events by match string {match_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving events for match"
            )

    async def delete_event_match(self, event_id: PydanticObjectId) -> None:
        """
        Elimina un evento de partido por su ID.

        Args:
            event_id (PydanticObjectId): ID del evento a eliminar.
        Raises:
            HTTPException: Si el evento no existe.
        """
        deleted = await self.repo.delete(event_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="EventMatch not found")

    async def _update_scoreboard_on_goal(self, match_id: ObjectId, goal_type: str, athlete_id: ObjectId):
        """
        Actualiza el scoreboard cuando se registra un gol.
        
        Args:
            match_id (ObjectId): ID del match
            goal_type (str): Tipo de gol (GOL, GOL_PENAL, etc.)
            athlete_id (ObjectId): ID del atleta que hizo el gol
        """
        try:
            # Importar aquí para evitar dependencias circulares
            from app.repositories.scoreboard_repository import ScoreboardRepository
            from app.repositories.match_repository import MatchRepository
            from app.schemas.scoreboard_schema import ScoreboardUpdate
            
            scoreboard_repo = ScoreboardRepository()
            match_repo = MatchRepository()
            
            # Buscar el scoreboard del match
            scoreboard = await scoreboard_repo.model.find_one({"match_id": match_id})
            if not scoreboard:
                logger.warning(f"No scoreboard found for match {match_id}")
                return
            
            # Obtener información del match para determinar si es local o visitante
            match = await match_repo.get_by_id(match_id)
            if not match:
                logger.warning(f"Match {match_id} not found")
                return
            
            # Determinar si es gol del equipo local o visitante
            # Por ahora, como no tenemos la relación athlete->team, incrementamos score_local
            # TODO: Implementar lógica para determinar si el atleta pertenece al equipo local o visitante
            
            if goal_type == "AUTOGOL":
                # En autogol, se suma al equipo contrario
                # Por simplicidad, sumamos al score_visitor
                new_score = scoreboard.score_visitor + 1
                update_data = ScoreboardUpdate(score_visitor=new_score)
            else:
                # Gol normal, sumar al equipo local (por defecto)
                new_score = scoreboard.score_local + 1
                update_data = ScoreboardUpdate(score_local=new_score)
            
            # Actualizar el scoreboard
            await scoreboard_repo.update(scoreboard.id, update_data.model_dump(exclude_unset=True))
            
            logger.info(f"Scoreboard updated for match {match_id}: {goal_type} scored by athlete {athlete_id}")
            
        except Exception as e:
            logger.error(f"Error updating scoreboard on goal: {str(e)}")
            # No lanzamos excepción para no interrumpir la creación del evento

event_match_service = EventMatchService()

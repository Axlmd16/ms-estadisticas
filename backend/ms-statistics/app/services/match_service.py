"""
Servicio para la gestión de partidos en el sistema de estadísticas deportivas.

Incluye la lógica para crear, listar, obtener, actualizar y eliminar partidos, así como la conversión de identificadores de cadena a ObjectId para integridad con MongoDB.
"""

from app.repositories.match_repository import MatchRepository
from app.repositories.team_repository import TeamRepository
from app.repositories.scoreboard_repository import ScoreboardRepository
from app.schemas.match_schema import MatchCreate, MatchUpdate, MatchResponse, MatchWithTeamsResponse, TeamInfo
from beanie import PydanticObjectId
from fastapi import HTTPException, status
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class MatchService:
    """
    Servicio que encapsula la lógica de negocio para la gestión de partidos.
    """
    def __init__(self):
        """
        Inicializa el servicio con instancias de los repositorios de partidos y equipos.
        """
        self.repo = MatchRepository()
        self.team_repo = TeamRepository()
        self.scoreboard_repo = ScoreboardRepository()

    def _convert_string_ids_to_objectid(self, data: dict) -> dict:
        """
        Convierte los IDs en formato string a ObjectId para almacenar en MongoDB.

        Args:
            data (dict): Diccionario con los datos del partido.
        Returns:
            dict: Diccionario con los IDs convertidos a ObjectId.
        """
        converted_data = data.copy()
        if converted_data.get('season_id'):
            converted_data['season_id'] = ObjectId(converted_data['season_id'])
        if converted_data.get('local_team_id'):
            converted_data['local_team_id'] = ObjectId(converted_data['local_team_id'])
        if converted_data.get('visitor_team_id'):
            converted_data['visitor_team_id'] = ObjectId(converted_data['visitor_team_id'])
        return converted_data

    async def create_match(self, match: MatchCreate) -> MatchResponse:
        """
        Crea un nuevo partido en la base de datos y automáticamente crea un scoreboard asociado.

        Args:
            match (MatchCreate): Datos del partido a crear.
        Returns:
            MatchResponse: Partido creado.
        Raises:
            HTTPException: Si ocurre un error durante la creación.
        """
        try:
            # Crear el match
            match_data = match.model_dump(exclude_unset=True)
            match_data = self._convert_string_ids_to_objectid(match_data)
            doc = await self.repo.create(match_data)
            
            # Crear automáticamente un scoreboard para este match
            scoreboard_data = {
                "match_id": doc.id,
                "status_game": ObjectId("6886f7a1bd86bb802c751b29"),
                "score_local": 0,
                "score_visitor": 0,
                "time_restant": 90,
                "is_final": False
            }
            await self.scoreboard_repo.create(scoreboard_data)
            logger.info(f"Scoreboard created automatically for match {doc.id}")
            
            return MatchResponse(
                id=str(doc.id),
                season_id=str(doc.season_id) if doc.season_id else None,
                local_team_id=str(doc.local_team_id),
                visitor_team_id=str(doc.visitor_team_id),
                date=doc.date
            )
        except Exception as e:
            logger.error(f"Error creating match: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating match: {str(e)}"
            )

    async def list_matches(self) -> list[MatchResponse]:
        """
        Obtiene la lista de todos los partidos registrados.

        Returns:
            list[MatchResponse]: Lista de partidos.
        Raises:
            HTTPException: Si ocurre un error al obtener los partidos.
        """
        try:
            matches = await self.repo.list()
            return [
                MatchResponse(
                    id=str(match.id),
                    season_id=str(match.season_id) if match.season_id else None,
                    local_team_id=str(match.local_team_id),
                    visitor_team_id=str(match.visitor_team_id),
                    date=match.date
                ) for match in matches
            ]
        except Exception as e:
            logger.error(f"Error listing matches: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving matches"
            )

    async def list_matches_with_teams(self) -> list[MatchWithTeamsResponse]:
        """
        Obtiene la lista de todos los partidos con información completa de los equipos.

        Returns:
            list[MatchWithTeamsResponse]: Lista de partidos con información de equipos.
        Raises:
            HTTPException: Si ocurre un error al obtener los partidos.
        """
        try:
            matches = await self.repo.list()
            result = []
            
            for match in matches:
                # Obtener información del equipo local
                local_team = None
                if match.local_team_id:
                    local_team_doc = await self.team_repo.get_by_id(match.local_team_id)
                    if local_team_doc:
                        local_team = TeamInfo(
                            id=str(local_team_doc.id),
                            name=local_team_doc.name,
                            description=local_team_doc.description,
                            founded=local_team_doc.founded
                        )
                
                # Obtener información del equipo visitante
                visitor_team = None
                if match.visitor_team_id:
                    visitor_team_doc = await self.team_repo.get_by_id(match.visitor_team_id)
                    if visitor_team_doc:
                        visitor_team = TeamInfo(
                            id=str(visitor_team_doc.id),
                            name=visitor_team_doc.name,
                            description=visitor_team_doc.description,
                            founded=visitor_team_doc.founded
                        )
                
                # Crear el match con información de equipos
                match_with_teams = MatchWithTeamsResponse(
                    id=str(match.id),
                    season_id=str(match.season_id) if match.season_id else None,
                    local_team=local_team,
                    visitor_team=visitor_team,
                    date=match.date
                )
                result.append(match_with_teams)
            
            return result
        except Exception as e:
            logger.error(f"Error listing matches with teams: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving matches with teams"
            )

    async def get_match(self, match_id: PydanticObjectId) -> MatchResponse:
        """
        Obtiene un partido por su ID.

        Args:
            match_id (PydanticObjectId): ID del partido.
        Returns:
            MatchResponse: Partido encontrado.
        Raises:
            HTTPException: Si el partido no existe.
        """
        match = await self.repo.get_by_id(match_id)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match not found"
            )
        return MatchResponse(
            id=str(match.id),
            season_id=str(match.season_id) if match.season_id else None,
            local_team_id=str(match.local_team_id),
            visitor_team_id=str(match.visitor_team_id),
            date=match.date
        )

    async def update_match(self, match_id: PydanticObjectId, match: MatchUpdate) -> MatchResponse:
        """
        Actualiza los datos de un partido existente.

        Args:
            match_id (PydanticObjectId): ID del partido a actualizar.
            match (MatchUpdate): Datos a actualizar.
        Returns:
            MatchResponse: Partido actualizado.
        Raises:
            HTTPException: Si el partido no existe.
        """
        db_match = await self.repo.get_by_id(match_id)
        if not db_match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match not found"
            )
        update_data = match.model_dump(exclude_unset=True)
        update_data = self._convert_string_ids_to_objectid(update_data)
        updated = await self.repo.update(match_id, update_data)
        return MatchResponse(
            id=str(updated.id),
            season_id=str(updated.season_id) if updated.season_id else None,
            local_team_id=str(updated.local_team_id),
            visitor_team_id=str(updated.visitor_team_id),
            date=updated.date
        )

    async def delete_match(self, match_id: PydanticObjectId) -> None:
        """
        Elimina un partido por su ID.

        Args:
            match_id (PydanticObjectId): ID del partido a eliminar.
        Raises:
            HTTPException: Si el partido no existe.
        """
        deleted = await self.repo.delete(match_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Match not found"
            )

match_service = MatchService()
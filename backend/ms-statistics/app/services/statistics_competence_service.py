"""
Servicio para la gestión de estadísticas de competencia en el sistema de estadísticas deportivas.

Incluye la lógica para crear, listar, obtener, actualizar y eliminar estadísticas de competencia, así como la generación y actualización automática de estadísticas a partir de los datos de las competiciones, partidos y resultados relacionados.
"""

import logging
from beanie import PydanticObjectId
from fastapi import HTTPException, status
from bson import ObjectId
from datetime import datetime

from app.models.competition import Competition
from app.models.match import Match
from app.models.result import Result
from app.models.statistic_team import StatisticTeam
from app.repositories.statistics_competence_repository import StatisticCompetenceRepository
from app.schemas.statistics_competence_schema import (
    StatisticCompetenceCreate,
    StatisticCompetenceUpdate,
    StatisticCompetenceResponse,
)

logger = logging.getLogger(__name__)

class StatisticCompetenceService:
    """
    Servicio que encapsula la lógica de negocio para la gestión de estadísticas de competencia.
    """
    def __init__(self):
        """
        Inicializa el servicio con una instancia del repositorio de estadísticas de competencia.
        """
        self.repo = StatisticCompetenceRepository()

    async def create_statistic_competence(self, stat: StatisticCompetenceCreate) -> StatisticCompetenceResponse:
        """
        Crea una nueva estadística de competencia en la base de datos.

        Args:
            stat (StatisticCompetenceCreate): Datos de la estadística a crear.
        Returns:
            StatisticCompetenceResponse: Estadística de competencia creada.
        Raises:
            HTTPException: Si ocurre un error durante la creación.
        """
        try:
            stat_data = stat.model_dump(exclude_unset=True)
            if "id_competition" in stat_data and stat_data["id_competition"]:
                stat_data["id_competition"] = ObjectId(stat_data["id_competition"])
            doc = await self.repo.create(stat_data)
            return StatisticCompetenceResponse(
                id=str(doc.id),
                description=doc.description,
                date_generation=doc.date_generation,
                value=doc.value,
                average_score=doc.average_score,
                matches_completed=doc.matches_completed,
                record_score=doc.record_score,
                total_parties=doc.total_parties,
                id_competition=str(doc.id_competition) if doc.id_competition else None,
            )
        except Exception as e:
            logger.error(f"Error creating statistic competence: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating statistic competence: {str(e)}"
            )

    async def list_statistic_competences(self) -> list[StatisticCompetenceResponse]:
        """
        Obtiene la lista de todas las estadísticas de competencia registradas.

        Returns:
            list[StatisticCompetenceResponse]: Lista de estadísticas de competencia.
        Raises:
            HTTPException: Si ocurre un error al obtener las estadísticas.
        """
        try:
            stats = await self.repo.list()
            return [
                StatisticCompetenceResponse(
                    id=str(s.id),
                    description=s.description,
                    date_generation=s.date_generation,
                    value=s.value,
                    average_score=s.average_score,
                    matches_completed=s.matches_completed,
                    record_score=s.record_score,
                    total_parties=s.total_parties,
                    id_competition=str(s.id_competition) if s.id_competition else None,
                ) for s in stats
            ]
        except Exception as e:
            logger.error(f"Error listing statistic competences: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving statistic competences"
            )

    async def get_statistic_competence(self, stat_id: PydanticObjectId) -> StatisticCompetenceResponse:
        """
        Obtiene una estadística de competencia por su ID.

        Args:
            stat_id (PydanticObjectId): ID de la estadística de competencia.
        Returns:
            StatisticCompetenceResponse: Estadística de competencia encontrada.
        Raises:
            HTTPException: Si la estadística no existe.
        """
        stat = await self.repo.get_by_id(stat_id)
        if not stat:
            raise HTTPException(status_code=404, detail="StatisticCompetence not found")
        return StatisticCompetenceResponse(
            id=str(stat.id),
            description=stat.description,
            date_generation=stat.date_generation,
            value=stat.value,
            average_score=stat.average_score,
            matches_completed=stat.matches_completed,
            record_score=stat.record_score,
            total_parties=stat.total_parties,
            id_competition=str(stat.id_competition) if stat.id_competition else None,
        )

    async def get_statistic_competence_by_competition(self, competition_id: str) -> StatisticCompetenceResponse:
        """
        Obtiene las estadísticas de una competencia específica por el ID de la competencia.

        Args:
            competition_id (str): ID de la competencia.
        Returns:
            StatisticCompetenceResponse: Estadísticas de la competencia encontrada.
        Raises:
            HTTPException: Si no se encuentran estadísticas para la competencia.
        """
        logger.info(f"Searching statistics for competition_id: {competition_id}")
        
        # Buscar estadísticas por ID de competencia como string (así es como están guardados)
        stat = await self.repo.find_one({"id_competition": competition_id})
        logger.info(f"Search with string - Found statistics: {stat}")
        
        # Si no se encuentra con string, intentar con ObjectId
        if not stat:
            try:
                competition_obj_id = ObjectId(competition_id)
                stat = await self.repo.find_one({"id_competition": competition_obj_id})
                logger.info(f"Search with ObjectId - Found statistics: {stat}")
            except Exception as e:
                logger.warning(f"Invalid ObjectId format: {competition_id}, error: {e}")
        
        logger.info(f"Final result - Found statistics: {stat}")
        
        if not stat:
            logger.warning(f"No statistics found for competition {competition_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"No statistics found for competition {competition_id}"
            )
        
        return StatisticCompetenceResponse(
            _id=str(stat.id),
            description=stat.description,
            date_generation=stat.date_generation,
            value=stat.value,
            average_score=stat.average_score,
            matches_completed=stat.matches_completed,
            record_score=stat.record_score,
            total_parties=stat.total_parties,
            id_competition=str(stat.id_competition) if stat.id_competition else None,
        )

    async def update_statistic_competence(self, stat_id: PydanticObjectId, stat: StatisticCompetenceUpdate) -> StatisticCompetenceResponse:
        """
        Actualiza los datos de una estadística de competencia existente.

        Args:
            stat_id (PydanticObjectId): ID de la estadística a actualizar.
            stat (StatisticCompetenceUpdate): Datos a actualizar.
        Returns:
            StatisticCompetenceResponse: Estadística de competencia actualizada.
        Raises:
            HTTPException: Si la estadística no existe.
        """
        db_stat = await self.repo.get_by_id(stat_id)
        if not db_stat:
            raise HTTPException(status_code=404, detail="StatisticCompetence not found")

        update_data = stat.model_dump(exclude_unset=True)
        if "id_competition" in update_data and update_data["id_competition"]:
            update_data["id_competition"] = ObjectId(update_data["id_competition"])

        updated = await self.repo.update(stat_id, update_data)
        return StatisticCompetenceResponse(
            id=str(updated.id),
            description=updated.description,
            date_generation=updated.date_generation,
            value=updated.value,
            average_score=updated.average_score,
            matches_completed=updated.matches_completed,
            record_score=updated.record_score,
            total_parties=updated.total_parties,
            id_competition=str(updated.id_competition) if updated.id_competition else None,
        )

    async def delete_statistic_competence(self, stat_id: PydanticObjectId) -> None:
        """
        Elimina una estadística de competencia por su ID.

        Args:
            stat_id (PydanticObjectId): ID de la estadística a eliminar.
        Raises:
            HTTPException: Si la estadística no existe.
        """
        deleted = await self.repo.delete(stat_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="StatisticCompetence not found")

    async def create_statistic_competence_for_competition(self, competition_id: str) -> StatisticCompetenceResponse:
        """
        Crea automáticamente una estadística de competencia a partir de los equipos de la competición y sus datos relacionados.

        Args:
            competition_id (str): ID de la competición.
        Returns:
            StatisticCompetenceResponse: Estadística de competencia generada.
        Raises:
            HTTPException: Si la competición no existe.
        """
        competition = await Competition.get(ObjectId(competition_id))
        if not competition:
            raise HTTPException(status_code=404, detail="Competition not found")
        team_ids = competition.id_team if hasattr(competition, 'id_team') else []
        
        # Buscar partidos donde participen los equipos de la competición
        matches = await Match.find({
            "$or": [
                {"local_team_id": {"$in": team_ids}},
                {"visitor_team_id": {"$in": team_ids}}
            ]
        }).to_list()
        match_ids = [m.id for m in matches]
        
        # Buscar resultados de esos partidos
        results = await Result.find({"scoreboard_id": {"$exists": True}}).to_list()
        # Filtrar resultados por partidos de la competición
        results = [r for r in results if hasattr(r, 'scoreboard_id') and r.scoreboard_id]
        
        # Calcular valores
        total_parties = len(matches)
        matches_completed = len([r for r in results if r.score_local is not None and r.score_visitor is not None])
        average_score = None
        record_score = None
        value = None
        if results:
            scores = [r.score_local + r.score_visitor for r in results if r.score_local is not None and r.score_visitor is not None]
            if scores:
                average_score = sum(scores) / len(scores)
                record_score = max(scores)
                value = sum(scores)
        
        stat_data = {
            "description": f"Estadística de competencia para {competition.name}",
            "date_generation": datetime.utcnow(),
            "value": value,
            "average_score": average_score,
            "matches_completed": matches_completed,
            "record_score": record_score,
            "total_parties": total_parties,
            "id_competition": ObjectId(competition_id)
        }
        doc = await self.repo.create(stat_data)
        return StatisticCompetenceResponse(
            id=str(doc.id),
            description=doc.description,
            date_generation=doc.date_generation,
            value=doc.value,
            average_score=doc.average_score,
            matches_completed=doc.matches_completed,
            record_score=doc.record_score,
            total_parties=doc.total_parties,
            id_competition=str(doc.id_competition) if doc.id_competition else None,
        )

    async def update_statistic_competence_for_competition(self, stat_id: PydanticObjectId, competition_id: str) -> StatisticCompetenceResponse:
        """
        Actualiza la estadística de competencia a partir de los equipos de la competición y sus datos relacionados.
        Calcula average_score (suma de goles de todos los partidos / total de partidos de la competencia) y record_score (mayor número de goles en un partido).

        Args:
            stat_id (PydanticObjectId): ID de la estadística a actualizar.
            competition_id (str): ID de la competición.
        Returns:
            StatisticCompetenceResponse: Estadística de competencia actualizada.
        Raises:
            HTTPException: Si la competición no existe.
        """
        competition = await Competition.get(ObjectId(competition_id))
        if not competition:
            raise HTTPException(status_code=404, detail="Competition not found")
        team_ids = competition.id_team if hasattr(competition, 'id_team') else []
        
        # Buscar partidos donde participen los equipos de la competición
        matches = await Match.find({
            "$or": [
                {"local_team_id": {"$in": team_ids}},
                {"visitor_team_id": {"$in": team_ids}}
            ]
        }).to_list()
        match_ids = [m.id for m in matches]
        total_parties = len(matches)
        
        # Buscar resultados de esos partidos
        results = await Result.find({"scoreboard_id": {"$exists": True}}).to_list()
        # Filtrar resultados por partidos de la competición
        results = [r for r in results if hasattr(r, 'scoreboard_id') and r.scoreboard_id]
        
        # Calcular average_score y record_score correctamente
        scores = [r.score_local + r.score_visitor for r in results if r.score_local is not None and r.score_visitor is not None]
        sum_goles = sum(scores) if scores else 0
        average_score = (sum_goles / total_parties) if total_parties > 0 else None
        record_score = max(scores) if scores else None
        matches_completed = len(scores)
        value = sum_goles if scores else None
        
        stat_data = {
            "description": f"Estadística de competencia para {competition.name}",
            "date_generation": datetime.utcnow(),
            "value": value,
            "average_score": average_score,
            "matches_completed": matches_completed,
            "record_score": record_score,
            "total_parties": total_parties,
            "id_competition": ObjectId(competition_id)
        }
        updated = await self.repo.update(stat_id, stat_data)
        return StatisticCompetenceResponse(
            id=str(updated.id),
            description=updated.description,
            date_generation=updated.date_generation,
            value=updated.value,
            average_score=updated.average_score,
            matches_completed=updated.matches_completed,
            record_score=updated.record_score,
            total_parties=updated.total_parties,
            id_competition=str(updated.id_competition) if updated.id_competition else None,
        )

statistic_competence_service = StatisticCompetenceService()

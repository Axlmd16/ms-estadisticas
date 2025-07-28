"""
Servicio para la gestión de estadísticas individuales en el sistema de estadísticas deportivas.

Incluye la lógica para crear, listar, obtener, actualizar y eliminar estadísticas individuales de atletas, así como la conversión de identificadores de atleta a ObjectId para integridad con MongoDB.
"""

import logging
from beanie import PydanticObjectId
from fastapi import HTTPException, status
from bson import ObjectId

from app.repositories.statistic_individual_repository import StatisticIndividualRepository
from app.repositories.player_repository import PlayerRepository
from app.schemas.statistic_individual_schema import (
    StatisticIndividualCreate,
    StatisticIndividualUpdate,
    StatisticIndividualResponse,
    StatisticIndividualWithAthleteResponse,
    AthleteInfo,
)

logger = logging.getLogger(__name__)

class StatisticIndividualService:
    """
    Servicio que encapsula la lógica de negocio para la gestión de estadísticas individuales.
    """
    def __init__(self):
        """
        Inicializa el servicio con instancias de los repositorios necesarios.
        """
        self.repo = StatisticIndividualRepository()
        self.player_repo = PlayerRepository()

    async def create_statistic(self, data: StatisticIndividualCreate) -> StatisticIndividualResponse:
        """
        Crea una nueva estadística individual en la base de datos.

        Args:
            data (StatisticIndividualCreate): Datos de la estadística a crear.
        Returns:
            StatisticIndividualResponse: Estadística individual creada.
        Raises:
            HTTPException: Si ocurre un error durante la creación.
        """
        try:
            stat_data = data.model_dump(exclude_unset=True)

            # Manejar tanto athlete_id como id_athlete para compatibilidad
            if "athlete_id" in stat_data and stat_data["athlete_id"]:
                stat_data["athlete_id"] = ObjectId(stat_data["athlete_id"])
            elif "id_athlete" in stat_data and stat_data["id_athlete"]:
                stat_data["athlete_id"] = ObjectId(stat_data["id_athlete"])
                # Remover id_athlete ya que usamos athlete_id internamente
                stat_data.pop("id_athlete", None)

            doc = await self.repo.create(stat_data)
            return StatisticIndividualResponse(
                id=str(doc.id),
                description=doc.description,
                date_generation=doc.date_generation,
                value=doc.value,
                goal=getattr(doc, 'goal', None),
                own_goal=getattr(doc, 'own_goal', None),
                foul=getattr(doc, 'foul', None),
                red_card=getattr(doc, 'red_card', None),
                yellow_card=getattr(doc, 'yellow_card', None),
                athlete_id=str(doc.athlete_id) if hasattr(doc, 'athlete_id') and doc.athlete_id else None,
                goals=getattr(doc, 'goals', None),
                assists=getattr(doc, 'assists', None),
                yellow_cards=getattr(doc, 'yellow_cards', None),
                red_cards=getattr(doc, 'red_cards', None),
                games_played=getattr(doc, 'games_played', None),
                fouls_committed=getattr(doc, 'fouls_committed', None),
                fouls_received=getattr(doc, 'fouls_received', None),
                offsides=getattr(doc, 'offsides', None),
                saves=getattr(doc, 'saves', None),
                passes_completed=getattr(doc, 'passes_completed', None),
                passes_attempted=getattr(doc, 'passes_attempted', None),
                shots_on_target=getattr(doc, 'shots_on_target', None),
                shots_off_target=getattr(doc, 'shots_off_target', None),
                distance_covered=getattr(doc, 'distance_covered', None),
                top_speed=getattr(doc, 'top_speed', None),
                average_speed=getattr(doc, 'average_speed', None),
                time_played=getattr(doc, 'time_played', None),
            )
        except Exception as e:
            logger.error(f"Error creating statistic individual: {str(e)}")
            raise HTTPException(status_code=500, detail="Error creating statistic individual")

    async def list_statistics(self) -> list[StatisticIndividualResponse]:
        """
        Obtiene la lista de todas las estadísticas individuales registradas.

        Returns:
            list[StatisticIndividualResponse]: Lista de estadísticas individuales.
        Raises:
            HTTPException: Si ocurre un error al obtener las estadísticas.
        """
        try:
            records = await self.repo.list()
            return [
                StatisticIndividualResponse(
                    id=str(r.id),
                    description=r.description,
                    date_generation=r.date_generation,
                    value=r.value,
                    goal=r.goal,
                    own_goal=r.own_goal,
                    foul=r.foul,
                    red_card=r.red_card,
                    yellow_card=r.yellow_card,
                    athlete_id=str(r.athlete_id) if r.athlete_id else None,
                ) for r in records
            ]
        except Exception as e:
            logger.error(f"Error listing statistics: {str(e)}")
            raise HTTPException(status_code=500, detail="Error listing statistic individual")

    async def get_statistic(self, stat_id: PydanticObjectId) -> StatisticIndividualResponse:
        """
        Obtiene una estadística individual por su ID.

        Args:
            stat_id (PydanticObjectId): ID de la estadística individual.
        Returns:
            StatisticIndividualResponse: Estadística individual encontrada.
        Raises:
            HTTPException: Si la estadística no existe.
        """
        stat = await self.repo.get_by_id(stat_id)
        if not stat:
            raise HTTPException(status_code=404, detail="Statistic not found")

        return StatisticIndividualResponse(
            id=str(stat.id),
            description=stat.description,
            date_generation=stat.date_generation,
            value=stat.value,
            goal=stat.goal,
            own_goal=stat.own_goal,
            foul=stat.foul,
            red_card=stat.red_card,
            yellow_card=stat.yellow_card,
            athlete_id=str(stat.athlete_id) if stat.athlete_id else None,
        )

    async def update_statistic(self, stat_id: PydanticObjectId, data: StatisticIndividualUpdate) -> StatisticIndividualResponse:
        """
        Actualiza los datos de una estadística individual existente.

        Args:
            stat_id (PydanticObjectId): ID de la estadística a actualizar.
            data (StatisticIndividualUpdate): Datos a actualizar.
        Returns:
            StatisticIndividualResponse: Estadística individual actualizada.
        Raises:
            HTTPException: Si la estadística no existe.
        """
        db_stat = await self.repo.get_by_id(stat_id)
        if not db_stat:
            raise HTTPException(status_code=404, detail="Statistic not found")

        update_data = data.model_dump(exclude_unset=True)

        if "athlete_id" in update_data and update_data["athlete_id"]:
            update_data["athlete_id"] = ObjectId(update_data["athlete_id"])

        updated = await self.repo.update(stat_id, update_data)
        return StatisticIndividualResponse(
            id=str(updated.id),
            description=updated.description,
            date_generation=updated.date_generation,
            value=updated.value,
            goal=updated.goal,
            own_goal=updated.own_goal,
            foul=updated.foul,
            red_card=updated.red_card,
            yellow_card=updated.yellow_card,
            athlete_id=str(updated.athlete_id) if updated.athlete_id else None,
        )

    async def delete_statistic(self, stat_id: PydanticObjectId) -> None:
        """
        Elimina una estadística individual por su ID.

        Args:
            stat_id (PydanticObjectId): ID de la estadística a eliminar.
        Raises:
            HTTPException: Si la estadística no existe.
        """
        deleted = await self.repo.delete(stat_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Statistic not found")

    async def get_statistic_by_athlete_id(self, athlete_id: str) -> StatisticIndividualWithAthleteResponse:
        """
        Obtiene las estadísticas individuales de un atleta específico incluyendo información completa del atleta.

        Args:
            athlete_id (str): ID del atleta.
        Returns:
            StatisticIndividualWithAthleteResponse: Estadísticas del atleta con información completa.
        Raises:
            HTTPException: Si no se encuentran estadísticas para el atleta.
        """
        try:
            logger.info(f"Searching statistics for athlete_id: {athlete_id}")
            
            # Buscar estadísticas por ID de atleta - búsqueda dual (string y ObjectId)
            stat = await self.repo.find_one({"athlete_id": athlete_id})
            logger.info(f"Search with string - Found statistics: {stat}")
            
            if not stat:
                try:
                    athlete_object_id = ObjectId(athlete_id)
                    stat = await self.repo.find_one({"athlete_id": athlete_object_id})
                    logger.info(f"Search with ObjectId - Found statistics: {stat}")
                except Exception as e:
                    logger.error(f"Error converting athlete_id to ObjectId: {e}")
            
            if not stat:
                logger.warning(f"No statistics found for athlete {athlete_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No statistics found for athlete {athlete_id}"
                )
            
            # Obtener información del atleta
            athlete = await self.player_repo.get_by_id(athlete_id)
            logger.info(f"Found athlete: {athlete}")
            
            if not athlete:
                logger.warning(f"Athlete {athlete_id} not found")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Athlete {athlete_id} not found"
                )
            
            # Crear objeto de información del atleta
            athlete_info = AthleteInfo(
                id=str(athlete.id),
                name=athlete.name,
                position=athlete.position,
                team_id=str(athlete.team_id) if athlete.team_id else None
            )
            
            # Retornar estadísticas con información del atleta
            return StatisticIndividualWithAthleteResponse(
                id=str(stat.id),
                description=stat.description,
                date_generation=stat.date_generation,
                value=stat.value,
                goals=getattr(stat, 'goals', None),
                assists=getattr(stat, 'assists', None),
                yellow_cards=getattr(stat, 'yellow_cards', None),
                red_cards=getattr(stat, 'red_cards', None),
                games_played=getattr(stat, 'games_played', None),
                fouls_committed=getattr(stat, 'fouls_committed', None),
                fouls_received=getattr(stat, 'fouls_received', None),
                offsides=getattr(stat, 'offsides', None),
                saves=getattr(stat, 'saves', None),
                passes_completed=getattr(stat, 'passes_completed', None),
                passes_attempted=getattr(stat, 'passes_attempted', None),
                shots_on_target=getattr(stat, 'shots_on_target', None),
                shots_off_target=getattr(stat, 'shots_off_target', None),
                distance_covered=getattr(stat, 'distance_covered', None),
                top_speed=getattr(stat, 'top_speed', None),
                average_speed=getattr(stat, 'average_speed', None),
                time_played=getattr(stat, 'time_played', None),
                # Campos de compatibilidad
                goal=getattr(stat, 'goal', None),
                own_goal=getattr(stat, 'own_goal', None),
                foul=getattr(stat, 'foul', None),
                red_card=getattr(stat, 'red_card', None),
                yellow_card=getattr(stat, 'yellow_card', None),
                athlete_id=str(stat.athlete_id) if hasattr(stat, 'athlete_id') and stat.athlete_id else None,
                id_athlete=str(stat.athlete_id) if hasattr(stat, 'athlete_id') and stat.athlete_id else None,
                athlete=athlete_info
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting statistics for athlete {athlete_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving statistics for athlete {athlete_id}"
            )

statistic_individual_service = StatisticIndividualService()

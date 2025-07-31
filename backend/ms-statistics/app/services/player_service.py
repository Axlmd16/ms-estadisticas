"""
Servicio para la gestión de jugadores (atletas) en el sistema de estadísticas deportivas.

Incluye la lógica para crear, listar, obtener, actualizar y eliminar jugadores, así como la conversión de identificadores de equipo a ObjectId para integridad con MongoDB.
"""

# Servicio de jugadores
import logging
from datetime import datetime
from beanie import PydanticObjectId
from fastapi import HTTPException, status
from bson import ObjectId

from app.repositories.player_repository import PlayerRepository
from app.repositories.statistic_individual_repository import StatisticIndividualRepository
from app.schemas.athlete_schema import AthleteCreate, AthleteUpdate, AthleteResponse
from app.schemas.statistic_individual_schema import StatisticIndividualCreate

logger = logging.getLogger(__name__)

class PlayerService:
    """
    Servicio que encapsula la lógica de negocio para la gestión de jugadores.
    """
    def __init__(self):
        """
        Inicializa el servicio con una instancia del repositorio de jugadores y estadísticas.
        """
        self.repo = PlayerRepository()
        self.stats_repo = StatisticIndividualRepository()

    async def create_athlete(self, athlete: AthleteCreate) -> AthleteResponse:
        """
        Crea un nuevo jugador (atleta) en la base de datos y automáticamente 
        crea un registro de estadísticas individuales con valores en cero.

        Args:
            athlete (AthleteCreate): Datos del jugador a crear.
        Returns:
            AthleteResponse: Jugador creado.
        Raises:
            HTTPException: Si ocurre un error durante la creación.
        """
        try:
            athlete_data = athlete.model_dump(exclude_unset=True)

            if "team_id" in athlete_data and athlete_data["team_id"]:
                athlete_data["team_id"] = ObjectId(athlete_data["team_id"])

            # Crear el atleta
            doc = await self.repo.create(athlete_data)
            
            # Auto-crear estadísticas individuales con valores en cero - solo eventos del juego
            stats_data = StatisticIndividualCreate(
                description=f"Estadísticas iniciales para {doc.name}",
                date_generation=datetime.now(),
                athlete_id=str(doc.id),  # Usar athlete_id en lugar de id_athlete
                value=0.0,  # Valor inicial
                # Campos legacy
                goal=0,
                own_goal=0,
                foul=0,
                red_card=0,
                yellow_card=0,
                # Campos nuevos - solo eventos del juego
                goals=0,
                assists=0,
                yellow_cards=0,
                red_cards=0,
                fouls_committed=0,
                fouls_received=0,
                offsides=0,
                shots_on_target=0,
                shots_off_target=0
            )
            
            # Convertir athlete_id a ObjectId antes de crear
            stats_dict = stats_data.model_dump(exclude_unset=True)
            if "athlete_id" in stats_dict:
                stats_dict["athlete_id"] = ObjectId(stats_dict["athlete_id"])
            
            await self.stats_repo.create(stats_dict)
            logger.info(f"Auto-created statistics for athlete {doc.name} (ID: {doc.id})")
            
            return AthleteResponse(
                id=str(doc.id),
                name=doc.name,
                position=doc.position,
                team_id=str(doc.team_id) if doc.team_id else None
            )
        except Exception as e:
            logger.error(f"Error creating athlete: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating athlete: {str(e)}"
            )

    async def list_athletes(self) -> list[AthleteResponse]:
        """
        Obtiene la lista de todos los jugadores registrados.

        Returns:
            list[AthleteResponse]: Lista de jugadores.
        Raises:
            HTTPException: Si ocurre un error al obtener los jugadores.
        """
        try:
            athletes = await self.repo.list()
            return [
                AthleteResponse(
                    id=str(a.id),
                    name=a.name,
                    position=a.position,
                    team_id=str(a.team_id) if a.team_id else None
                ) for a in athletes
            ]
        except Exception as e:
            logger.error(f"Error listing athletes: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving athletes"
            )

    async def get_athlete(self, athlete_id: PydanticObjectId) -> AthleteResponse:
        """
        Obtiene un jugador por su ID.

        Args:
            athlete_id (PydanticObjectId): ID del jugador.
        Returns:
            AthleteResponse: Jugador encontrado.
        Raises:
            HTTPException: Si el jugador no existe.
        """
        athlete = await self.repo.get_by_id(athlete_id)
        if not athlete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Athlete not found"
            )

        return AthleteResponse(
            id=str(athlete.id),
            name=athlete.name,
            position=athlete.position,
            team_id=str(athlete.team_id) if athlete.team_id else None
        )

    async def update_athlete(self, athlete_id: PydanticObjectId, athlete: AthleteUpdate) -> AthleteResponse:
        """
        Actualiza los datos de un jugador existente.

        Args:
            athlete_id (PydanticObjectId): ID del jugador a actualizar.
            athlete (AthleteUpdate): Datos a actualizar.
        Returns:
            AthleteResponse: Jugador actualizado.
        Raises:
            HTTPException: Si el jugador no existe.
        """
        db_athlete = await self.repo.get_by_id(athlete_id)
        if not db_athlete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Athlete not found"
            )

        update_data = athlete.model_dump(exclude_unset=True)
        updated = await self.repo.update(athlete_id, update_data)

        return AthleteResponse(
            id=str(updated.id),
            name=updated.name,
            position=updated.position,
            team_id=str(updated.team_id) if updated.team_id else None
        )

    async def get_athletes_by_team(self, team_id: PydanticObjectId) -> list[AthleteResponse]:
        """
        Obtiene todos los atletas (jugadores) de un equipo específico.

        Args:
            team_id (PydanticObjectId): ID del equipo.
        Returns:
            list[AthleteResponse]: Lista de atletas del equipo.
        Raises:
            HTTPException: Si ocurre un error al obtener los atletas.
        """
        try:
            # Buscar atletas por team_id
            athletes = await self.repo.model.find({"team_id": ObjectId(team_id)}).to_list()
            return [
                AthleteResponse(
                    id=str(athlete.id),
                    name=athlete.name,
                    position=athlete.position,
                    team_id=str(athlete.team_id) if athlete.team_id else None
                ) for athlete in athletes
            ]
        except Exception as e:
            logger.error(f"Error getting athletes by team {team_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving athletes for team"
            )

    async def delete_athlete(self, athlete_id: PydanticObjectId) -> None:
        """
        Elimina un jugador por su ID.

        Args:
            athlete_id (PydanticObjectId): ID del jugador a eliminar.
        Raises:
            HTTPException: Si el jugador no existe.
        """
        deleted = await self.repo.delete(athlete_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Athlete not found"
            )

player_service = PlayerService()

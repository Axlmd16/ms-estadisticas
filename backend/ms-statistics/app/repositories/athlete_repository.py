"""
Repositorio para la gestión de atletas en el sistema de estadísticas deportivas.
"""

import logging
from typing import List, Optional
from beanie import PydanticObjectId
from bson import ObjectId

from app.models.athlete import Athlete

logger = logging.getLogger(__name__)

class AthleteRepository:
    """
    Repositorio para operaciones CRUD de atletas.
    """

    async def find_by_team_id(self, team_id: str) -> List[Athlete]:
        """
        Busca todos los atletas que pertenecen a un equipo específico.

        Args:
            team_id (str): ID del equipo.
        Returns:
            List[Athlete]: Lista de atletas del equipo.
        """
        logger.info(f"Searching athletes for team_id: {team_id}")
        
        # Búsqueda dual: primero como string, luego como ObjectId
        athletes = await Athlete.find({"team_id": team_id}).to_list()
        logger.info(f"Search with string - Found {len(athletes)} athletes")
        
        if not athletes:
            try:
                team_object_id = ObjectId(team_id)
                athletes = await Athlete.find({"team_id": team_object_id}).to_list()
                logger.info(f"Search with ObjectId - Found {len(athletes)} athletes")
            except Exception as e:
                logger.error(f"Error converting team_id to ObjectId: {e}")
                athletes = []
        
        return athletes

    async def get_by_id(self, athlete_id: PydanticObjectId) -> Optional[Athlete]:
        """
        Obtiene un atleta por su ID.

        Args:
            athlete_id (PydanticObjectId): ID del atleta.
        Returns:
            Optional[Athlete]: Atleta encontrado o None.
        """
        return await Athlete.get(athlete_id)

    async def find_all(self) -> List[Athlete]:
        """
        Obtiene todos los atletas.

        Returns:
            List[Athlete]: Lista de todos los atletas.
        """
        return await Athlete.find_all().to_list()

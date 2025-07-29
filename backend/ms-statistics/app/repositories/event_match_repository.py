"""
Repositorio para la entidad EventMatch. Hereda operaciones CRUD del repositorio base.
"""

from .base_repository import BaseRepository
from app.models.event_match import EventMatch
from bson import ObjectId
from typing import List

class EventMatchRepository(BaseRepository):
    """
    Repositorio específico para la entidad EventMatch.
    """
    def __init__(self):
        """
        Inicializa el repositorio con el modelo EventMatch.
        """
        super().__init__(EventMatch)
    
    async def find_by_athlete_id(self, athlete_id: ObjectId) -> List[EventMatch]:
        """
        Busca todos los eventos de un atleta específico.
        
        Args:
            athlete_id (ObjectId): ID del atleta.
        Returns:
            List[EventMatch]: Lista de eventos del atleta.
        """
        return await self.model.find({"athlete_id": athlete_id}).to_list()

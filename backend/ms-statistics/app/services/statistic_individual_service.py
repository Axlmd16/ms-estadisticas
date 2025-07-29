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
from app.repositories.event_match_repository import EventMatchRepository
from app.repositories.catalog_item_repository import CatalogItemRepository
from app.schemas.statistic_individual_schema import (
    StatisticIndividualCreate,
    StatisticIndividualUpdate,
    StatisticIndividualResponse,
    StatisticIndividualWithAthleteResponse,
    AthleteInfo,
)
from datetime import datetime

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
        self.event_repo = EventMatchRepository()
        self.catalog_repo = CatalogItemRepository()

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
            
            # Solo devolver campos esenciales con valores reales
            response_data = {
                "id": str(doc.id),
                "description": doc.description,
                "date_generation": doc.date_generation,
                "athlete_id": str(doc.athlete_id) if hasattr(doc, 'athlete_id') and doc.athlete_id else None,
                # Campos legacy esenciales
                "goal": getattr(doc, 'goal', 0),
                "yellow_card": getattr(doc, 'yellow_card', 0),
                "red_card": getattr(doc, 'red_card', 0),
            }
            
            # Solo agregar campos con valores > 0 - solo eventos del juego
            fields_to_check = ['goals', 'assists', 'yellow_cards', 'red_cards', 
                             'fouls_committed', 'fouls_received', 'offsides', 'shots_on_target', 'shots_off_target']
            
            for field in fields_to_check:
                value = getattr(doc, field, 0)
                if value and value > 0:
                    response_data[field] = value
            
            return StatisticIndividualResponse(**response_data)
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

        # Solo devolver campos esenciales con valores reales
        response_data = {
            "id": str(stat.id),
            "description": stat.description,
            "date_generation": stat.date_generation,
            "athlete_id": str(stat.athlete_id) if stat.athlete_id else None,
            # Campos legacy esenciales
            "goal": getattr(stat, 'goal', 0),
            "yellow_card": getattr(stat, 'yellow_card', 0),
            "red_card": getattr(stat, 'red_card', 0),
        }
        
        # Solo agregar campos con valores > 0 - solo eventos del juego
        fields_to_check = ['goals', 'assists', 'yellow_cards', 'red_cards', 
                         'fouls_committed', 'fouls_received', 'offsides', 'shots_on_target', 'shots_off_target']
        
        for field in fields_to_check:
            value = getattr(stat, field, 0)
            if value and value > 0:
                response_data[field] = value
        
        return StatisticIndividualResponse(**response_data)

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
        
        # Solo devolver campos esenciales con valores reales
        response_data = {
            "id": str(updated.id),
            "description": updated.description,
            "date_generation": updated.date_generation,
            "athlete_id": str(updated.athlete_id) if updated.athlete_id else None,
            # Campos legacy esenciales
            "goal": getattr(updated, 'goal', 0),
            "yellow_card": getattr(updated, 'yellow_card', 0),
            "red_card": getattr(updated, 'red_card', 0),
        }
        
        # Solo agregar campos con valores > 0 - solo eventos del juego
        fields_to_check = ['goals', 'assists', 'yellow_cards', 'red_cards', 
                         'fouls_committed', 'fouls_received', 'offsides', 'shots_on_target', 'shots_off_target']
        
        for field in fields_to_check:
            value = getattr(updated, field, 0)
            if value and value > 0:
                response_data[field] = value
        
        return StatisticIndividualResponse(**response_data)

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
        Obtiene las estadísticas individuales de un atleta específico calculadas desde eventos
        incluyendo información completa del atleta.

        Args:
            athlete_id (str): ID del atleta.
        Returns:
            StatisticIndividualWithAthleteResponse: Estadísticas del atleta calculadas desde eventos con información completa.
        Raises:
            HTTPException: Si no se encuentra el atleta.
        """
        try:
            logger.info(f"Getting calculated statistics for athlete_id: {athlete_id}")
            
            # Obtener información del atleta
            athlete = await self.player_repo.get_by_id(athlete_id)
            logger.info(f"Found athlete: {athlete}")
            
            if not athlete:
                logger.warning(f"Athlete {athlete_id} not found")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Athlete {athlete_id} not found"
                )
            
            # Calcular estadísticas desde eventos
            calculated_stats = await self.calculate_statistics_from_events(athlete_id)
            
            # Crear objeto de información del atleta
            athlete_info = AthleteInfo(
                id=str(athlete.id),
                name=athlete.name,
                position=athlete.position,
                team_id=str(athlete.team_id) if athlete.team_id else None
            )
            
            # Preparar datos de respuesta con estadísticas calculadas
            response_data = calculated_stats.model_dump()
            response_data["athlete"] = athlete_info
            # Usar el ID del atleta como ID temporal para la respuesta
            response_data["_id"] = athlete_id
            
            # Retornar estadísticas calculadas con información del atleta
            return StatisticIndividualWithAthleteResponse(**response_data)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting calculated statistics for athlete {athlete_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving calculated statistics for athlete {athlete_id}"
            )

    async def calculate_statistics_from_events(self, athlete_id: str) -> StatisticIndividualResponse:
        """
        Calcula las estadísticas de un atleta basándose en todos sus eventos de match.
        
        Args:
            athlete_id (str): ID del atleta.
        Returns:
            StatisticIndividualResponse: Estadísticas calculadas del atleta.
        Raises:
            HTTPException: Si ocurre un error al calcular las estadísticas.
        """
        try:
            logger.info(f"Calculando estadísticas para el atleta: {athlete_id}")
            
            # Convertir athlete_id a ObjectId
            athlete_object_id = ObjectId(athlete_id)
            
            # Obtener todos los eventos del atleta
            events = await self.event_repo.find_by_athlete_id(athlete_object_id)
            logger.info(f"Encontrados {len(events)} eventos para el atleta {athlete_id}")
            
            # Obtener todos los catalog items para mapear types
            catalog_items = await self.catalog_repo.list()
            catalog_map = {str(item.id): item.code for item in catalog_items}
            
            # Inicializar contadores solo para eventos del juego
            stats = {
                # Campos legacy
                'goal': 0,
                'own_goal': 0,
                'foul': 0,
                'red_card': 0,
                'yellow_card': 0,
                # Campos nuevos - solo eventos del juego
                'goals': 0,
                'assists': 0,
                'yellow_cards': 0,
                'red_cards': 0,
                'fouls_committed': 0,
                'fouls_received': 0,
                'offsides': 0,
                'shots_on_target': 0,
                'shots_off_target': 0,
            }
            
            # Procesar cada evento
            for event in events:
                if event.type_event and str(event.type_event) in catalog_map:
                    event_code = catalog_map[str(event.type_event)]
                    
                    # Mapear códigos a estadísticas
                    if event_code == 'GOL':
                        stats['goal'] += 1
                        stats['goals'] += 1
                    elif event_code == 'AUTOGOL':
                        stats['own_goal'] += 1
                    elif event_code == 'GOL_PENAL':
                        stats['goal'] += 1
                        stats['goals'] += 1
                    elif event_code == 'GOL_TIRO_LIBRE':
                        stats['goal'] += 1
                        stats['goals'] += 1
                    elif event_code == 'TARJETA_AMARILLA':
                        stats['yellow_card'] += 1
                        stats['yellow_cards'] += 1
                    elif event_code == 'TARJETA_ROJA':
                        stats['red_card'] += 1
                        stats['red_cards'] += 1
                    elif event_code == 'DOBLE_AMARILLA':
                        stats['red_card'] += 1
                        stats['red_cards'] += 1
                    elif event_code in ['FALTA_COMUN', 'FALTA_TECNICA', 'FALTA_GRAVE', 'MANO']:
                        stats['foul'] += 1
                        stats['fouls_committed'] += 1
                    elif event_code == 'FUERA_JUEGO':
                        stats['offsides'] += 1
                    # Eliminamos los eventos de portería ya que no son eventos del juego jugador
                    # sino métricas de rendimiento (atajadas, pases, etc.)
            
            # Crear respuesta con las estadísticas calculadas - solo campos con valores
            response_data = {
                "id": None,  # No se almacena, solo se calcula
                "description": f"Estadísticas calculadas para atleta {athlete_id}",
                "date_generation": datetime.now(),
                "athlete_id": athlete_id,
                # Solo campos legacy esenciales con valores
                "goal": stats['goal'],
                "yellow_card": stats['yellow_card'],
                "red_card": stats['red_card'],
                "foul": stats['foul'],
                "own_goal": stats['own_goal'],
            }
            
            # Solo agregar campos nuevos si tienen valores > 0
            if stats['goals'] > 0:
                response_data['goals'] = stats['goals']
            if stats['assists'] > 0:
                response_data['assists'] = stats['assists']
            if stats['yellow_cards'] > 0:
                response_data['yellow_cards'] = stats['yellow_cards']
            if stats['red_cards'] > 0:
                response_data['red_cards'] = stats['red_cards']
            if stats['fouls_committed'] > 0:
                response_data['fouls_committed'] = stats['fouls_committed']
            if stats['fouls_received'] > 0:
                response_data['fouls_received'] = stats['fouls_received']
            if stats['offsides'] > 0:
                response_data['offsides'] = stats['offsides']
            if stats['shots_on_target'] > 0:
                response_data['shots_on_target'] = stats['shots_on_target']
            if stats['shots_off_target'] > 0:
                response_data['shots_off_target'] = stats['shots_off_target']
            
            return StatisticIndividualResponse(**response_data)
            
        except Exception as e:
            logger.error(f"Error calculating statistics for athlete {athlete_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error calculating statistics for athlete {athlete_id}"
            )

statistic_individual_service = StatisticIndividualService()

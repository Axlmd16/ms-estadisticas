"""
Esquemas Pydantic para la validación y serialización de estadísticas de equipos.
Incluye modelos base, de creación y actualización para la entidad StatisticTeam.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from app.schemas.team_schema import TeamResponse
from app.schemas.athlete_schema import AthleteResponse

class StatisticTeamBase(BaseModel):
    """
    Modelo base para una estadística de equipo, utilizado para heredar atributos comunes.
    """
    description: Optional[str] = None
    date_generation: Optional[datetime] = None
    value: Optional[float] = None
    games_played: Optional[int] = None
    matches_drawn: Optional[int] = None  #
    matches_lost: Optional[int] = None
    matches_won: Optional[int] = None
    points: Optional[int] = None
    id_team: Optional[str] = None  

class StatisticTeamCreate(StatisticTeamBase):
    """
    Modelo para la creación de una nueva estadística de equipo.
    Hereda todos los campos de StatisticTeamBase.
    """
    pass

class StatisticTeamUpdate(StatisticTeamBase):
    """
    Modelo para la actualización parcial de una estadística de equipo.
    Todos los campos son opcionales para permitir actualizaciones parciales.
    """
    description: Optional[str] = None
    date_generation: Optional[datetime] = None
    value: Optional[float] = None
    games_played: Optional[int] = None
    matches_drawn: Optional[int] = None
    matches_lost: Optional[int] = None
    matches_won: Optional[int] = None
    points: Optional[int] = None
    id_team: Optional[str] = None

class StatisticTeamResponse(StatisticTeamBase):
    """
    Modelo de respuesta para representar una estadística de equipo con su ID.
    Convierte ObjectId a string y usa el alias '_id'.
    """
    id: str = Field(alias="_id") 

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, v):
        """
        Valida y transforma el ObjectId en un string antes de la serialización.
        """
        if isinstance(v, ObjectId):
            return str(v)
        return str(v) if v else None

    @field_validator("id_team", mode="before")
    @classmethod
    def validate_id_team(cls, v):
        """
        Valida y transforma el ObjectId del campo id_team en string antes de la serialización.
        """
        if isinstance(v, ObjectId):
            return str(v)
        return str(v) if v else None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class StatisticTeamWithTeamResponse(StatisticTeamBase):
    """
    Modelo de respuesta para representar una estadística de equipo con información completa del equipo y atletas.
    """
    id: str = Field(alias="_id")
    team: Optional[TeamResponse] = None
    athletes: Optional[List[AthleteResponse]] = []

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, v):
        """
        Valida y transforma el ObjectId en un string antes de la serialización.
        """
        if isinstance(v, ObjectId):
            return str(v)
        return str(v) if v else None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }
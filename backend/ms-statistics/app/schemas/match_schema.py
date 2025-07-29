"""
Esquemas Pydantic para la validación y serialización de datos relacionados con partidos.
Incluye modelos base, de creación, actualización y respuesta para la entidad Match.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

class MatchBase(BaseModel):
    """
    Modelo base para un partido, utilizado para heredar atributos comunes.
    """
    season_id: Optional[str] = None
    local_team_id: str
    visitor_team_id: str
    date: Optional[datetime] = None

class MatchCreate(MatchBase):
    """
    Modelo para la creación de un nuevo partido.
    Hereda todos los campos de MatchBase.
    """
    pass

class MatchUpdate(MatchBase):
    """
    Modelo para la actualización parcial de un partido.
    Todos los campos son opcionales para permitir actualizaciones parciales.
    """
    season_id: Optional[str] = None
    local_team_id: Optional[str] = None
    visitor_team_id: Optional[str] = None
    date: Optional[datetime] = None

class MatchResponse(MatchBase):
    """
    Modelo de respuesta para representar un partido con su ID.
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
    
    @field_validator("season_id", "local_team_id", "visitor_team_id", mode="before")
    @classmethod
    def validate_objectid(cls, v):
        """
        Valida y transforma los ObjectId de los campos relacionados en string antes de la serialización.
        """
        if isinstance(v, ObjectId):
            return str(v)
        return str(v) if v else None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class TeamInfo(BaseModel):
    """
    Información básica de un equipo para incluir en el match.
    """
    id: str
    name: str
    description: Optional[str] = None
    founded: Optional[int] = None

class MatchWithTeamsResponse(BaseModel):
    """
    Modelo de respuesta para representar un partido con información completa de los equipos.
    """
    id: str = Field(alias="_id")
    season_id: Optional[str] = None
    local_team: Optional[TeamInfo] = None
    visitor_team: Optional[TeamInfo] = None
    date: Optional[datetime] = None

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
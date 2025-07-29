"""
Esquemas Pydantic para la validación y serialización de marcadores de partidos.
Incluye modelos base, de creación y actualización para la entidad Scoreboard.
"""

# app/schemas/scoreboard_schema.py - VERSIÓN CORREGIDA
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from bson import ObjectId
from datetime import datetime

class ScoreboardBase(BaseModel):
    """
    Modelo base para un marcador de partido, utilizado para heredar atributos comunes.
    """
    status_game: Optional[str] = None  
    score_local: Optional[int] = None
    score_visitor: Optional[int] = None
    time_restant: Optional[int] = None
    is_final: Optional[bool] = None
    match_id: Optional[str] = None  
    last_update: Optional[datetime] = None
    timer_started: Optional[bool] = False

class ScoreboardCreate(ScoreboardBase):
    """
    Modelo para la creación de un nuevo marcador de partido.
    Hereda todos los campos de ScoreboardBase.
    """
    pass

class ScoreboardUpdate(ScoreboardBase):
    """
    Modelo para la actualización parcial de un marcador de partido.
    Todos los campos son opcionales para permitir actualizaciones parciales.
    """
    pass

class ScoreboardResponse(ScoreboardBase):
    """
    Modelo de respuesta para representar un marcador de partido con su ID.
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

    @field_validator("status_game", mode="before")
    @classmethod
    def validate_status_game(cls, v):
        """
        Valida y transforma el ObjectId del campo status_game en string antes de la serialización.
        """
        if isinstance(v, ObjectId):
            return str(v)
        return str(v) if v else None

    @field_validator("match_id", mode="before")
    @classmethod
    def validate_match_id(cls, v):
        """
        Valida y transforma el ObjectId del campo match_id en string antes de la serialización.
        """
        if isinstance(v, ObjectId):
            return str(v)
        return str(v) if v else None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }
"""
Esquemas Pydantic para la validación y serialización de eventos de partidos.
Incluye modelos base, de creación y actualización para la entidad EventMatch.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from bson import ObjectId
from datetime import datetime

class EventMatchBase(BaseModel):
    """
    Modelo base para un evento de partido, utilizado para heredar atributos comunes.
    """
    description: Optional[str] = None
    date_registration: Optional[datetime] = None
    minute: Optional[float] = None
    type_event: Optional[str] = None  # ID del CatalogItem del evento
    athlete_id: Optional[str] = None  
    match_id: Optional[str] = None  # ID del match donde ocurrió el evento  

class EventMatchCreate(EventMatchBase):
    """
    Modelo para la creación de un nuevo evento de partido.
    Hereda todos los campos de EventMatchBase.
    """
    pass

class EventMatchUpdate(EventMatchBase):
    """
    Modelo para la actualización parcial de un evento de partido.
    Todos los campos son opcionales para permitir actualizaciones parciales.
    """
    description: Optional[str] = None
    date_registration: Optional[datetime] = None
    minute: Optional[float] = None
    type_event: Optional[str] = None
    athlete_id: Optional[str] = None
    match_id: Optional[str] = None

class EventMatchResponse(EventMatchBase):
    """
    Modelo de respuesta para representar un evento de partido con su ID.
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

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

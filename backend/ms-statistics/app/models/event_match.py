from beanie import Document
from pydantic import Field
from typing import Optional
from bson import ObjectId
from datetime import datetime

class EventMatch(Document):
    description: Optional[str] = None
    date_registration: Optional[datetime] = None
    minute: Optional[float] = None
    type_event: Optional[ObjectId] = None  # ID del CatalogItem del evento
    athlete_id: Optional[ObjectId] = None 
    match_id: Optional[ObjectId] = None  # ID del match donde ocurrió el evento

    class Settings:
        name = "event_match"

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }

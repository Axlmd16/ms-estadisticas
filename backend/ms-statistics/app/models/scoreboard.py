from beanie import Document
from pydantic import Field
from typing import Optional
from bson import ObjectId
from datetime import datetime

class Scoreboard(Document):
    last_update: Optional[datetime] = Field(default_factory=datetime.utcnow)
    status_game: Optional[ObjectId] = None
    score_local: Optional[int] = None
    score_visitor: Optional[int] = None
    time_restant: Optional[int] = None
    match_id: Optional[ObjectId] = None
    is_final: bool = False
    timer_started: bool = False  # Indica si el temporizador fue iniciado manualmente  

    async def save(self, *args, **kwargs):
        self.last_update = datetime.utcnow()
        return await super().save(*args, **kwargs)

    async def update(self, *args, **kwargs):
        self.last_update = datetime.utcnow()
        return await super().update(*args, **kwargs)

    class Settings:
        name = "scoreboards"
        use_revision = True
        validate_on_save = True

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }
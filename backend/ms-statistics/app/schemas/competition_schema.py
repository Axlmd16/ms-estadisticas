from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.schemas.team_schema import TeamResponse

# Schemas de competencia

class CompetitionBase(BaseModel):
    name: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    # id_team eliminado de CompetitionBase para que no aparezca en CompetitionCreate

class CompetitionCreate(CompetitionBase):
    pass

class CompetitionUpdate(CompetitionBase):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    id_team: Optional[List[str]] = None  # Solo en update

class CompetitionResponse(CompetitionBase):
    id: str = Field(alias="_id")
    id_team: Optional[List[str]] = Field(default_factory=list)

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, v):
        return str(v) if v else None

    @field_validator("id_team", mode="before")
    @classmethod
    def validate_id_team(cls, v):
        if isinstance(v, list):
            return [str(item) for item in v]
        return []

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }


class CompetitionWithTeamsResponse(CompetitionBase):
    """
    Schema de respuesta para competición que incluye información completa de los equipos
    """
    id: str = Field(alias="_id")
    teams: List[TeamResponse] = Field(default_factory=list)

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, v):
        return str(v) if v else None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

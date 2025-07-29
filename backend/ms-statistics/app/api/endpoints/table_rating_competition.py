
from fastapi import APIRouter, HTTPException
from typing import Any
from bson import ObjectId
from bson.objectid import ObjectId as BsonObjectId
from app.models.table_rating import TableRating
from app.models.position_table import PositionTable
from app.models.team import Team
from app.schemas.table_rating_schema import TableRatingResponse
from app.schemas.position_table_schema import PositionTableResponse
from app.schemas.team_schema import TeamResponse

# Función recursiva para convertir todos los ObjectId a str
def convert_objectids(obj):
    if isinstance(obj, dict):
        return {k: convert_objectids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectids(i) for i in obj]
    elif isinstance(obj, (ObjectId, BsonObjectId)):
        return str(obj)
    else:
        return obj

router = APIRouter(prefix="/api/v1/table_ratings", tags=["TableRatings"])

@router.get("/competition/{competition_id}")
async def get_table_rating_with_positions_and_teams(competition_id: str) -> Any:
    # Buscar la tabla de posiciones por competition_id
    try:
        comp_obj_id = ObjectId(competition_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid competition_id format")
    table_rating = await TableRating.find_one({"competition_id": comp_obj_id}).project(TableRating)
    if not table_rating:
        raise HTTPException(status_code=404, detail="TableRating not found for competition_id")

    # Serializar el TableRating
    table_rating_dict = table_rating.dict()

    # Buscar todas las posiciones referenciadas
    positions = []
    for pos_id in table_rating.positions:
        pos = await PositionTable.get(pos_id)
        if pos:
            pos_dict = pos.dict()
            # Buscar el equipo asociado a la posición
            team = await Team.get(pos.team_id)
            if team:
                team_dict = team.dict()
                pos_dict["team"] = team_dict
            else:
                pos_dict["team"] = None
            positions.append(pos_dict)

    # Responder con la tabla, posiciones y equipos, asegurando que todos los ObjectId sean str
    return convert_objectids({
        "table_rating": table_rating_dict,
        "positions": positions
    })

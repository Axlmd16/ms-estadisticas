from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.competition import Competition
from app.models.team import Team
from app.schemas.competition_schema import CompetitionCreate, CompetitionUpdate, CompetitionResponse, CompetitionWithTeamsResponse
from app.schemas.team_schema import TeamResponse
from beanie import PydanticObjectId
from app.services.table_rating_service import table_rating_service
from app.schemas.table_rating_schema import TableRatingCreate
from bson import ObjectId
from app.services.statistics_competence_service import statistic_competence_service

router = APIRouter(prefix="/api/v1/competitions", tags=["Competitions"])

@router.post("/", response_model=CompetitionResponse, status_code=status.HTTP_201_CREATED)
async def create_competition(competition: CompetitionCreate):
    """
    Crea una nueva competición, su tabla de posiciones asociada y la estadística de competencia.

    Nota: No se requiere el id de los equipos al crear la competición. Los equipos se agregan posteriormente usando el endpoint correspondiente.

    Args:
        competition (CompetitionCreate): Datos de la competición a crear (sin equipos).
    Returns:
        CompetitionResponse: Competición creada con su información.
    """
    # Crear la competición sin equipos
    competition_data = competition.dict()
    competition_data["id_team"] = []  # Asegura que se cree vacía
    competition_doc = Competition(**competition_data)
    await competition_doc.insert()
    await table_rating_service.create_table_rating(
        TableRatingCreate(
            competition_id=str(competition_doc.id),  
            last_update=None,
            positions=[]
        )
    )
    # Crear estadística de competencia automáticamente
    await statistic_competence_service.create_statistic_competence_for_competition(str(competition_doc.id))
    return CompetitionResponse(**competition_doc.dict())

@router.get("/", response_model=List[CompetitionResponse])
async def list_competitions():
    """
    Obtiene la lista de todas las competiciones registradas.

    Returns:
        List[CompetitionResponse]: Lista de competiciones.
    """
    competitions = await Competition.find_all().to_list()
    return [CompetitionResponse(**c.dict()) for c in competitions]

@router.get("/{competition_id}", response_model=CompetitionResponse)
async def get_competition(competition_id: PydanticObjectId):
    """
    Obtiene la información de una competición específica por su ID.

    Args:
        competition_id (PydanticObjectId): ID de la competición.
    Returns:
        CompetitionResponse: Información de la competición solicitada.
    """
    competition = await Competition.get(competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    return CompetitionResponse(**competition.dict())

@router.get("/{competition_id}/with-teams", response_model=CompetitionWithTeamsResponse)
async def get_competition_with_teams(competition_id: PydanticObjectId):
    """
    Obtiene la información de una competición específica con información completa de los equipos.

    Args:
        competition_id (PydanticObjectId): ID de la competición.
    Returns:
        CompetitionWithTeamsResponse: Información de la competición con datos completos de equipos.
    """
    competition = await Competition.get(competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    # Obtener información completa de los equipos
    teams_data = []
    for team_id in competition.id_team:
        team = await Team.get(team_id)
        if team:
            team_response = TeamResponse(
                id=str(team.id),
                name=team.name,
                description=team.description,
                founded=team.founded,
                athletes=[str(athlete_id) for athlete_id in team.athletes]
            )
            teams_data.append(team_response)
    
    return CompetitionWithTeamsResponse(
        id=str(competition.id),
        name=competition.name,
        start_date=competition.start_date,
        end_date=competition.end_date,
        teams=teams_data
    )

@router.put("/{competition_id}", response_model=CompetitionResponse)
async def update_competition(competition_id: PydanticObjectId, competition: CompetitionUpdate):
    """
    Actualiza la información de una competición existente.

    Args:
        competition_id (PydanticObjectId): ID de la competición a actualizar.
        competition (CompetitionUpdate): Datos nuevos de la competición.
    Returns:
        CompetitionResponse: Competición actualizada.
    """
    db_competition = await Competition.get(competition_id)
    if not db_competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    await db_competition.set({k: v for k, v in competition.dict(exclude_unset=True).items()})
    return CompetitionResponse(**db_competition.dict())

@router.delete("/{competition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_competition(competition_id: PydanticObjectId):
    """
    Elimina una competición del sistema por su ID.

    Args:
        competition_id (PydanticObjectId): ID de la competición a eliminar.
    Returns:
        None
    """
    competition = await Competition.get(competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    await competition.delete()
    return None

@router.post("/{competition_id}/add_team/{team_id}", response_model=CompetitionResponse)
async def add_team_to_competition(competition_id: PydanticObjectId, team_id: str):
    """
    Agrega un equipo a la competición indicada por su ID.

    Args:
        competition_id (PydanticObjectId): ID de la competición.
        team_id (str): ID del equipo a agregar.
    Returns:
        CompetitionResponse: Competición actualizada con el nuevo equipo.
    """
    # Convertir ambos IDs a ObjectId correctamente
    from bson import ObjectId
    try:
        comp_obj_id = ObjectId(str(competition_id))
        team_obj_id = ObjectId(str(team_id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido para competición o equipo")
    competition = await Competition.get(comp_obj_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    competition.add_team(team_obj_id)
    await competition.save()
    return CompetitionResponse(**competition.dict())

@router.post("/recalculate/{competition_id}", response_model=CompetitionResponse)
async def recalculate_statistic_competence(competition_id: PydanticObjectId):
    """
    Recalcula y actualiza la estadística de competencia para una competición específica.
    Args:
        competition_id (PydanticObjectId): ID de la competición.
    Returns:
        CompetitionResponse: Competición con estadística recalculada.
    """
    # Recalcula la estadística de competencia usando el servicio
    await statistic_competence_service.create_statistic_competence_for_competition(str(competition_id))
    competition = await Competition.get(competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    return CompetitionResponse(**competition.dict())

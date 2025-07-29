from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.catalog_item import CatalogItem
from app.schemas.catalog_item_schema import CatalogItemBase, CatalogItemResponse
from beanie import PydanticObjectId

router = APIRouter(prefix="/api/v1/catalog_items", tags=["CatalogItems"])

@router.post("/", response_model=CatalogItemResponse, status_code=status.HTTP_201_CREATED)
async def create_catalog_item(item: CatalogItemBase):
    """
    Crea un nuevo ítem de catálogo.

    Args:
        item (CatalogItemBase): Datos del ítem a crear.
    Returns:
        CatalogItemBase: Ítem de catálogo creado.
    """
    item_doc = CatalogItem(**item.dict())
    await item_doc.insert()
    return CatalogItemResponse(**item_doc.dict())

@router.get("/", response_model=List[CatalogItemResponse])
async def list_catalog_items():
    """
    Obtiene la lista de todos los ítems de catálogo.

    Returns:
        List[CatalogItemBase]: Lista de ítems de catálogo.
    """
    items = await CatalogItem.find_all().to_list()
    return [CatalogItemResponse(**i.dict()) for i in items]

@router.get("/{item_id}", response_model=CatalogItemResponse)
async def get_catalog_item(item_id: PydanticObjectId):
    """
    Obtiene un ítem de catálogo por su ID.

    Args:
        item_id (PydanticObjectId): ID del ítem de catálogo.
    Returns:
        CatalogItemBase: Ítem de catálogo solicitado.
    """
    item = await CatalogItem.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="CatalogItem not found")
    return CatalogItemResponse(**item.dict())

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_catalog_item(item_id: PydanticObjectId):
    """
    Elimina un ítem de catálogo por su ID.

    Args:
        item_id (PydanticObjectId): ID del ítem de catálogo a eliminar.
    Returns:
        None
    """
    item = await CatalogItem.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="CatalogItem not found")
    await item.delete()
    return None

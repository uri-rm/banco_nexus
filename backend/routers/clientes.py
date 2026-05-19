from fastapi import APIRouter

from backend.db import get_db
from .utils import serialize_document

router = APIRouter()


@router.get("/clientes")
def obtener_clientes():
    db = get_db()
    clientes = list(db["clientes"].find())
    return [serialize_document(cliente) for cliente in clientes]

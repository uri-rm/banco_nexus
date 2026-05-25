from fastapi import APIRouter, HTTPException

from backend.db import get_db
from backend.models.schemas import CuentaResponse, Transaccion
from .utils import serialize_document

router = APIRouter(prefix="/api")


@router.get("/cuenta/{cuenta}", response_model=CuentaResponse)
def obtener_cuenta(cuenta: str):
    db = get_db()
    cuenta_doc = db["cuentas"].find_one({"cuenta": cuenta})
    if cuenta_doc is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    cliente = db["clientes"].find_one({"curp": cuenta_doc["cliente"]})
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    transacciones = [
        serialize_document(transaccion)
        for transaccion in db["transacciones"].find({"cuenta": cuenta_doc["cuenta"]}).sort("fecha")
    ]

    return {
        "cuenta": cuenta_doc.get("cuenta"),
        "saldo": cuenta_doc.get("saldo"),
        "tipo": cuenta_doc.get("tipo"),
        "moneda": cuenta_doc.get("moneda"),
        "cliente": {
            "nombre": cliente.get("nombre"),
            "curp": cliente.get("curp"),
        },
        "transacciones": transacciones,
    }


@router.post("/deposito")
def realizar_deposito(transaccion: Transaccion):
    db = get_db()
    cuenta_doc = db["cuentas"].find_one({"cuenta": transaccion.cuenta})
    if cuenta_doc is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    resultado = db["cuentas"].find_one_and_update(
        {"cuenta": transaccion.cuenta},
        {"$inc": {"saldo": transaccion.monto}},
        return_document=True,
    )

    t = transaccion.dict()
    t["saldo"] = resultado["saldo"]
    db["transacciones"].insert_one(t)
    return {"message": "Depósito realizado exitosamente", "nuevo_saldo": resultado["saldo"]}


@router.post("/retiro")
def realizar_retiro(transaccion: Transaccion):
    db = get_db()
    cuenta_doc = db["cuentas"].find_one({"cuenta": transaccion.cuenta})
    if cuenta_doc is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    if cuenta_doc["saldo"] < transaccion.monto:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")

    resultado = db["cuentas"].find_one_and_update(
        {"cuenta": transaccion.cuenta, "saldo": {"$gte": transaccion.monto}},
        {"$inc": {"saldo": -transaccion.monto}},
        return_document=True,
    )

    if resultado is None:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")

    t = transaccion.dict()
    t["saldo"] = resultado["saldo"]
    db["transacciones"].insert_one(t)
    return {"message": "Retiro realizado exitosamente", "nuevo_saldo": resultado["saldo"]}


@router.get("/sucursales")
def listar_sucursales():
    db = get_db()
    docs = list(db["sucursal"].find({}, {"_id": 0}))
    return docs

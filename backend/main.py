from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import get_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)


class Cliente(BaseModel):
    nombre: str
    curp: str


class Transaccion(BaseModel):
    cuenta: str
    fecha: datetime
    tipo: str
    monto: float
    descripcion: str
    sucursal: dict
    saldo: float | None = None


class CuentaResponse(BaseModel):
    cuenta: str
    saldo: float
    tipo: str | None = None
    moneda: str | None = None
    cliente: Cliente
    transacciones: list[Transaccion]


def serialize_document(doc: dict) -> dict:
    if doc is None:
        return None

    serialized = {}
    for key, value in doc.items():
        if key == "_id":
            continue
        if isinstance(value, datetime):
            serialized[key] = value.isoformat().replace("+00:00", "Z")
        else:
            serialized[key] = value
    return serialized


@app.get("/clientes")
def obtener_clientes():
    db = get_db()
    clientes = list(db["clientes"].find())
    return [serialize_document(cliente) for cliente in clientes]


@app.get("/api/cuenta/{cuenta}", response_model=CuentaResponse)
def obtener_cuenta(cuenta: str):
    db = get_db()
    cuenta_doc = db["cuentas"].find_one({"cuenta": cuenta})
    if cuenta_doc is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    cliente = db["clientes"].find_one({"curp": cuenta_doc["cliente"]})
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Obtener todas las transacciones de esta cuenta, ordenadas por fecha ascendente
    transacciones = list(
        db["transacciones"].find({"cuenta": cuenta_doc["cuenta"]}).sort("fecha")
    )

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
    
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import get_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)


class Cliente(BaseModel):
    nombre: str
    curp: str


class Transaccion(BaseModel):
    cuenta: str
    fecha: datetime
    tipo: str
    monto: float
    descripcion: str
    sucursal: dict
    saldo: float | None = None


class CuentaResponse(BaseModel):
    cuenta: str
    saldo: float
    tipo: str | None = None
    moneda: str | None = None
    cliente: Cliente
    transacciones: list[Transaccion]


def serialize_document(doc: dict) -> dict:
    if doc is None:
        return None

    serialized = {}
    for key, value in doc.items():
        if key == "_id":
            continue
        if isinstance(value, datetime):
            serialized[key] = value.isoformat().replace("+00:00", "Z")
        else:
            serialized[key] = value
    return serialized


@app.get("/clientes")
def obtener_clientes():
    db = get_db()
    clientes = list(db["clientes"].find())
    return [serialize_document(cliente) for cliente in clientes]


@app.get("/api/cuenta/{cuenta}", response_model=CuentaResponse)
def obtener_cuenta(cuenta: str):
    db = get_db()
    cuenta_doc = db["cuentas"].find_one({"cuenta": cuenta})
    if cuenta_doc is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    cliente = db["clientes"].find_one({"curp": cuenta_doc["cliente"]})
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Obtener todas las transacciones de esta cuenta, ordenadas por fecha ascendente
    transacciones = list(
        db["transacciones"].find({"cuenta": cuenta_doc["cuenta"]}).sort("fecha")
    )

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
    
@app.post("/api/deposito")
def realizar_deposito(transaccion: Transaccion):
    db = get_db()
    cuenta_doc = db["cuentas"].find_one({"cuenta": transaccion.cuenta})
    if cuenta_doc is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    # Atómico: MongoDB suma directamente, sin race condition
    resultado = db["cuentas"].find_one_and_update(
        {"cuenta": transaccion.cuenta},
        {"$inc": {"saldo": transaccion.monto}},
        return_document=True  # devuelve el documento ya actualizado
    )

    t = transaccion.dict()
    t["saldo"] = resultado["saldo"]
    db["transacciones"].insert_one(t)
    return {"message": "Depósito realizado exitosamente", "nuevo_saldo": resultado["saldo"]}


@app.post("/api/retiro")
def realizar_retiro(transaccion: Transaccion):
    db = get_db()
    cuenta_doc = db["cuentas"].find_one({"cuenta": transaccion.cuenta})
    if cuenta_doc is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    if cuenta_doc["saldo"] < transaccion.monto:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")

    # Atómico + condición: solo resta si hay saldo suficiente
    resultado = db["cuentas"].find_one_and_update(
        {"cuenta": transaccion.cuenta, "saldo": {"$gte": transaccion.monto}},
        {"$inc": {"saldo": -transaccion.monto}},
        return_document=True
    )

    if resultado is None:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")

    t = transaccion.dict()
    t["saldo"] = resultado["saldo"]
    db["transacciones"].insert_one(t)
    return {"message": "Retiro realizado exitosamente", "nuevo_saldo": resultado["saldo"]}
from datetime import datetime

from pydantic import BaseModel


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

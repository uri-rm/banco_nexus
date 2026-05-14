from datetime import datetime, timezone

from db import get_db


def _utc(date_str: str) -> datetime:
    return datetime.fromisoformat(date_str).astimezone(timezone.utc)


def seed_data() -> None:
    db = get_db()

    clientes = db["clientes"]
    cuentas = db["cuentas"]
    transacciones = db["transacciones"]
    sucursal = db["sucursal"]

    clientes.delete_many({})
    cuentas.delete_many({})
    transacciones.delete_many({})
    sucursal.delete_many({})

    clientes.insert_many([
        {"nombre": "Ana Ruiz",        "curp": "RUAA900101MDFXXX01"},
        {"nombre": "Luis Pérez",       "curp": "RELU850203HDFXXX02"},
        {"nombre": "María González",   "curp": "GOMM920415MDFXXX03"},
        {"nombre": "Carlos Hernández", "curp": "HECC880720HDFXXX04"},
        {"nombre": "Sofía Torres",     "curp": "TOSS950312MDFXXX05"},
        {"nombre": "Jorge Ramírez",    "curp": "RAJJ910630HDFXXX06"},
        {"nombre": "Valeria López",    "curp": "LOVV001118MDFXXX07"},
        {"nombre": "Diego Morales",    "curp": "MODD870914HDFXXX08"},
        {"nombre": "Fernanda Castro",  "curp": "CAFF930225MDFXXX09"},
        {"nombre": "Andrés Jiménez",   "curp": "JIAA960507HDFXXX10"},
        {"nombre": "Lucía Mendoza",    "curp": "MELL780811MDFXXX11"},
        {"nombre": "Roberto Vargas",   "curp": "VARR830429HDFXXX12"},
    ])

    cuentas_data = [
        {"cuenta": "001", "cliente": "RUAA900101MDFXXX01", "saldo": 5000},
        {"cuenta": "002", "cliente": "RELU850203HDFXXX02", "saldo": 8000},
        {"cuenta": "003", "cliente": "GOMM920415MDFXXX03", "saldo": 12000},
        {"cuenta": "004", "cliente": "HECC880720HDFXXX04", "saldo": 3500},
        {"cuenta": "005", "cliente": "TOSS950312MDFXXX05", "saldo": 7200},
        {"cuenta": "006", "cliente": "RAJJ910630HDFXXX06", "saldo": 15000},
        {"cuenta": "007", "cliente": "LOVV001118MDFXXX07", "saldo":  900},
        {"cuenta": "008", "cliente": "MODD870914HDFXXX08", "saldo": 4300},
        {"cuenta": "009", "cliente": "CAFF930225MDFXXX09", "saldo": 6750},
        {"cuenta": "010", "cliente": "JIAA960507HDFXXX10", "saldo": 2100},
        {"cuenta": "011", "cliente": "MELL780811MDFXXX11", "saldo": 9800},
        {"cuenta": "012", "cliente": "VARR830429HDFXXX12", "saldo": 5500},
    ]
    cuentas.insert_many(cuentas_data)

    transacciones_data = [
        # --- Cuenta 001 (Ana Ruiz) saldo inicial: 3020 ---
        {"cuenta": "001", "fecha": _utc("2026-05-01T10:15:00+00:00"), "tipo": "deposito", "monto": 2500, "saldo": 5520, "descripcion": "Depósito nómina",        "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},
        {"cuenta": "001", "fecha": _utc("2026-05-03T14:30:00+00:00"), "tipo": "retiro",   "monto":  400, "saldo": 5120, "descripcion": "Pago de servicios",       "sucursal": {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"}},
        {"cuenta": "001", "fecha": _utc("2026-05-05T09:00:00+00:00"), "tipo": "retiro",   "monto":  120, "saldo": 5000, "descripcion": "Compra en supermercado",  "sucursal": {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"}},

        # --- Cuenta 002 (Luis Pérez) saldo inicial: 5870 ---
        {"cuenta": "002", "fecha": _utc("2026-05-02T11:45:00+00:00"), "tipo": "deposito", "monto": 3000, "saldo": 8870, "descripcion": "Transferencia recibida", "sucursal": {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"}},
        {"cuenta": "002", "fecha": _utc("2026-05-04T16:20:00+00:00"), "tipo": "retiro",   "monto":  650, "saldo": 8220, "descripcion": "Compra en tienda",        "sucursal": {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"}},
        {"cuenta": "002", "fecha": _utc("2026-05-06T08:30:00+00:00"), "tipo": "retiro",   "monto":  220, "saldo": 8000, "descripcion": "Pago de gasolina",        "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},

        # --- Cuenta 003 (María González) saldo inicial: 8100 ---
        {"cuenta": "003", "fecha": _utc("2026-05-01T08:00:00+00:00"), "tipo": "deposito", "monto": 5000, "saldo": 13100, "descripcion": "Depósito nómina",       "sucursal": {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"}},
        {"cuenta": "003", "fecha": _utc("2026-05-02T13:00:00+00:00"), "tipo": "retiro",   "monto":  800, "saldo": 12300, "descripcion": "Pago renta",             "sucursal": {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"}},
        {"cuenta": "003", "fecha": _utc("2026-05-05T17:45:00+00:00"), "tipo": "retiro",   "monto":  300, "saldo": 12000, "descripcion": "Restaurante",            "sucursal": {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"}},

        # --- Cuenta 004 (Carlos Hernández) saldo inicial: 2650 ---
        {"cuenta": "004", "fecha": _utc("2026-05-01T09:30:00+00:00"), "tipo": "deposito", "monto": 1500, "saldo": 4150, "descripcion": "Depósito en ventanilla", "sucursal": {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"}},
        {"cuenta": "004", "fecha": _utc("2026-05-03T11:00:00+00:00"), "tipo": "retiro",   "monto":  200, "saldo": 3950, "descripcion": "Retiro en cajero",        "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},
        {"cuenta": "004", "fecha": _utc("2026-05-06T15:00:00+00:00"), "tipo": "retiro",   "monto":  450, "saldo": 3500, "descripcion": "Pago de luz",             "sucursal": {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"}},

        # --- Cuenta 005 (Sofía Torres) saldo inicial: 4500 ---
        {"cuenta": "005", "fecha": _utc("2026-05-02T10:00:00+00:00"), "tipo": "deposito", "monto": 2200, "saldo": 6700, "descripcion": "Transferencia recibida", "sucursal": {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"}},
        {"cuenta": "005", "fecha": _utc("2026-05-04T12:30:00+00:00"), "tipo": "retiro",   "monto":  500, "saldo": 6200, "descripcion": "Compra en línea",         "sucursal": {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"}},
        {"cuenta": "005", "fecha": _utc("2026-05-07T08:00:00+00:00"), "tipo": "deposito", "monto": 1000, "saldo": 7200, "descripcion": "Depósito nómina",        "sucursal": {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"}},

        # --- Cuenta 006 (Jorge Ramírez) saldo inicial: 8800 ---
        {"cuenta": "006", "fecha": _utc("2026-05-01T07:45:00+00:00"), "tipo": "deposito", "monto": 8000, "saldo": 16800, "descripcion": "Depósito nómina",       "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},
        {"cuenta": "006", "fecha": _utc("2026-05-03T10:15:00+00:00"), "tipo": "retiro",   "monto": 1200, "saldo": 15600, "descripcion": "Pago hipoteca",          "sucursal": {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"}},
        {"cuenta": "006", "fecha": _utc("2026-05-05T14:00:00+00:00"), "tipo": "retiro",   "monto":  600, "saldo": 15000, "descripcion": "Compra supermercado",    "sucursal": {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"}},

        # --- Cuenta 007 (Valeria López) saldo inicial: 630 ---
        {"cuenta": "007", "fecha": _utc("2026-05-03T09:00:00+00:00"), "tipo": "deposito", "monto":  500, "saldo": 1130, "descripcion": "Depósito en efectivo",   "sucursal": {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"}},
        {"cuenta": "007", "fecha": _utc("2026-05-05T16:00:00+00:00"), "tipo": "retiro",   "monto":  150, "saldo":  980, "descripcion": "Pago de internet",        "sucursal": {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"}},
        {"cuenta": "007", "fecha": _utc("2026-05-07T11:30:00+00:00"), "tipo": "retiro",   "monto":   80, "saldo":  900, "descripcion": "Compra farmacia",         "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},

        # --- Cuenta 008 (Diego Morales) saldo inicial: 3125 ---
        {"cuenta": "008", "fecha": _utc("2026-05-01T08:30:00+00:00"), "tipo": "deposito", "monto": 1800, "saldo": 4925, "descripcion": "Depósito nómina",        "sucursal": {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"}},
        {"cuenta": "008", "fecha": _utc("2026-05-04T13:45:00+00:00"), "tipo": "retiro",   "monto":  350, "saldo": 4575, "descripcion": "Pago de agua",            "sucursal": {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"}},
        {"cuenta": "008", "fecha": _utc("2026-05-06T10:00:00+00:00"), "tipo": "retiro",   "monto":  275, "saldo": 4300, "descripcion": "Gasolina",               "sucursal": {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"}},

        # --- Cuenta 009 (Fernanda Castro) saldo inicial: 4440 ---
        {"cuenta": "009", "fecha": _utc("2026-05-02T09:15:00+00:00"), "tipo": "deposito", "monto": 3200, "saldo": 7640, "descripcion": "Transferencia recibida", "sucursal": {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"}},
        {"cuenta": "009", "fecha": _utc("2026-05-04T14:00:00+00:00"), "tipo": "retiro",   "monto":  700, "saldo": 6940, "descripcion": "Pago tarjeta crédito",   "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},
        {"cuenta": "009", "fecha": _utc("2026-05-06T17:00:00+00:00"), "tipo": "retiro",   "monto":  190, "saldo": 6750, "descripcion": "Suscripciones",          "sucursal": {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"}},

        # --- Cuenta 010 (Andrés Jiménez) saldo inicial: 1550 ---
        {"cuenta": "010", "fecha": _utc("2026-05-01T11:00:00+00:00"), "tipo": "deposito", "monto":  900, "saldo": 2450, "descripcion": "Depósito en ventanilla", "sucursal": {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"}},
        {"cuenta": "010", "fecha": _utc("2026-05-03T15:30:00+00:00"), "tipo": "retiro",   "monto":  250, "saldo": 2200, "descripcion": "Retiro cajero",           "sucursal": {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"}},
        {"cuenta": "010", "fecha": _utc("2026-05-07T09:45:00+00:00"), "tipo": "retiro",   "monto":  100, "saldo": 2100, "descripcion": "Pago de transporte",      "sucursal": {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"}},

        # --- Cuenta 011 (Lucía Mendoza) saldo inicial: 6720 ---
        {"cuenta": "011", "fecha": _utc("2026-05-01T07:00:00+00:00"), "tipo": "deposito", "monto": 4500, "saldo": 11220, "descripcion": "Depósito nómina",       "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},
        {"cuenta": "011", "fecha": _utc("2026-05-03T12:00:00+00:00"), "tipo": "retiro",   "monto": 1000, "saldo": 10220, "descripcion": "Pago renta",             "sucursal": {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"}},
        {"cuenta": "011", "fecha": _utc("2026-05-05T16:30:00+00:00"), "tipo": "retiro",   "monto":  420, "saldo":  9800, "descripcion": "Compra en línea",        "sucursal": {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"}},

        # --- Cuenta 012 (Roberto Vargas) saldo inicial: 4360 ---
        {"cuenta": "012", "fecha": _utc("2026-05-02T08:45:00+00:00"), "tipo": "deposito", "monto": 2000, "saldo": 6360, "descripcion": "Transferencia recibida", "sucursal": {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"}},
        {"cuenta": "012", "fecha": _utc("2026-05-04T11:30:00+00:00"), "tipo": "retiro",   "monto":  550, "saldo": 5810, "descripcion": "Compra supermercado",    "sucursal": {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"}},
        {"cuenta": "012", "fecha": _utc("2026-05-06T14:15:00+00:00"), "tipo": "retiro",   "monto":  310, "saldo": 5500, "descripcion": "Pago servicios",         "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}},
    ]

    transacciones.insert_many(transacciones_data)

    final_saldos_por_cuenta = {}
    for transaccion in transacciones_data:
        cuenta = transaccion["cuenta"]
        if cuenta not in final_saldos_por_cuenta or transaccion["fecha"] > final_saldos_por_cuenta[cuenta]["fecha"]:
            final_saldos_por_cuenta[cuenta] = {"fecha": transaccion["fecha"], "saldo": transaccion["saldo"]}

    for cuenta, datos in final_saldos_por_cuenta.items():
        cuentas.update_one({"cuenta": cuenta}, {"$set": {"saldo": datos["saldo"]}})

    sucursal.insert_many([
        {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"},
        {"sucursal": "Norte",   "direccion": "Calle Norte 456, Ciudad"},
        {"sucursal": "Sur",     "direccion": "Calle Sur 789, Ciudad"},
        {"sucursal": "Este",    "direccion": "Calle Este 321, Ciudad"},
        {"sucursal": "Oeste",   "direccion": "Calle Oeste 654, Ciudad"},
    ])

    print("Base de datos inicial creada con éxito.")


if __name__ == "__main__":
    seed_data()

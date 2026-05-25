import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import pytest

MONGO_URI = (
    "mongodb://localhost:27017,localhost:27018,localhost:27019/"
    "?replicaSet=rsBanco"
)

@pytest.mark.asyncio

async def test_failover():
    client = AsyncIOMotorClient(MONGO_URI)

    try:
        # Estado del Replica Set
        status = await client.admin.command("replSetGetStatus")
        print("Estado del Replica Set:")
        for member in status["members"]:
            print(f"  - {member['name']} | Estado: {member['stateStr']}")

        # Nodo actual
        is_master = await client.admin.command("isMaster")
        print(f"\nNodo actual: {is_master['me']}")
        print(f"¿Es primario? {is_master['ismaster']}")

        # Insertar transacción de prueba
        db = client["bancoNexus"]
        resultado = await db["transacciones"].insert_one({
            "cuenta": "12345678",
            "tipo": "deposito",
            "monto": 1000,
            "fecha": datetime.now()
        })
        print(f"\nTransacción insertada: {resultado.inserted_id}")
        print("\nAhora puedes apagar el nodo primario y volver a ejecutar.")

    except Exception as e:
        print(f"Error en prueba de failover: {e}")

    finally:
        client.close()

asyncio.run(test_failover())
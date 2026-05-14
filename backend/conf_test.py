from fastapi.testclient import TestClient
import pytest

from main import app
from seed import seed_data

client = TestClient(app)


@pytest.fixture(autouse=True)
def initialize_database():
    seed_data()
    yield
    

def test_obtener_clientes_devuelve_lista():
    response = client.get("/clientes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1
    primera = response.json()[0]
    assert "nombre" in primera
    assert "curp" in primera
    

def test_obtener_cuenta_devuelve_datos_correctos():
    response = client.get("/api/cuenta/001")
    assert response.status_code == 200

    data = response.json()
    assert data["cuenta"] == "001"
    assert data["saldo"] == 5000
    assert data["cliente"]["curp"] == "RUAA900101MDFXXX01"
    assert isinstance(data["transacciones"], list)


def test_obtener_cuenta_existente():
    response = client.get("/api/cuenta/001")
    assert response.status_code == 200

    data = response.json()
    assert data["cuenta"] == "001"
    assert data["saldo"] == 5000
    assert data["cliente"]["curp"] == "RUAA900101MDFXXX01"
    assert isinstance(data["transacciones"], list)


def test_obtener_cuenta_inexistente():
    response = client.get("/api/cuenta/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Cuenta no encontrada"


def test_realizar_deposito_actualiza_saldo():
    payload = {
        "cuenta": "001",
        "fecha": "2026-05-10T12:00:00Z",
        "tipo": "deposito",
        "monto": 1000,
        "descripcion": "Prueba depósito",
        "sucursal": {"sucursal": "Central", "direccion": "Av. Principal 123, Ciudad"}
    }

    response = client.post("/api/deposito", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Depósito realizado exitosamente"
    assert body["nuevo_saldo"] == 6000

    consulta = client.get("/api/cuenta/001").json()
    assert consulta["saldo"] == 6000


def test_realizar_retiro_con_saldo_suficiente():
    payload = {
        "cuenta": "001",
        "fecha": "2026-05-10T13:00:00Z",
        "tipo": "retiro",
        "monto": 1000,
        "descripcion": "Prueba retiro",
        "sucursal": {"sucursal": "Norte", "direccion": "Calle Norte 456, Ciudad"}
    }

    response = client.post("/api/retiro", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Retiro realizado exitosamente"
    assert body["nuevo_saldo"] == 4000

    consulta = client.get("/api/cuenta/001").json()
    assert consulta["saldo"] == 4000


def test_realizar_retiro_saldo_insuficiente():
    payload = {
        "cuenta": "001",
        "fecha": "2026-05-10T14:00:00Z",
        "tipo": "retiro",
        "monto": 999999,
        "sucursal": {"sucursal": "Sur", "direccion": "Calle Sur 789, Ciudad"},
        "descripcion": "Prueba retiro insuficiente"
    }

    response = client.post("/api/retiro", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Saldo insuficiente"

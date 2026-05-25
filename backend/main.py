from xmlrpc import client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import clientes_router, cuentas_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)

# Evento de inicio para verificar la conexión a MongoDB
@app.on_event("startup")
async def startup():
    try:
        # Verifica que la conexión es válida
        await client.admin.command("ping")
        print("Conectado al Replica Set rsBanco")
    except Exception as e:
        print(f"Error de conexión: {e}")

@app.on_event("shutdown")
async def shutdown():
    client.close()

app.include_router(clientes_router)
app.include_router(cuentas_router)

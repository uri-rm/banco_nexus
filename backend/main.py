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

app.include_router(clientes_router)
app.include_router(cuentas_router)

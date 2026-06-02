from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import URL
from dotenv import load_dotenv
import os

load_dotenv()

DB_USER     = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST     = os.getenv("DB_HOST")
DB_PORT     = int(os.getenv("DB_PORT", "3306"))
DB_NAME     = os.getenv("DB_NAME")
DB_SSL_CA   = os.getenv("DB_SSL_CA")   # ruta al ca.pem; vacío = conexión local sin SSL

# URL.create escapa solo los caracteres especiales de la contraseña
DB_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
)

# El SSL solo se activa si hay un CA (Aiven lo exige; en local lo dejan vacío)
connect_args = {}
if DB_SSL_CA:
    connect_args = {"ssl": {"ca": DB_SSL_CA}}

engine = create_engine(
    DB_URL,
    echo=True,
    connect_args=connect_args,
    pool_pre_ping=True,   # evita errores de "conexión muerta" cuando Aiven cierra idle
)

def create_db():
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session
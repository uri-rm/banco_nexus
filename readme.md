# Banco Nexus

## Setup

### Backend

Asegúrate de crear la base de datos antes de iniciar y configurar tu `.env` con los datos de conexión. Puedes usar `.env.example` como referencia.

```bash
pip install -r requirements.txt
fastapi dev main.py
```

### Frontend

Configura la URL del backend en el archivo `.env` del frontend antes de iniciar.

```bash
npm install
npm run dev
```
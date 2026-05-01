# SW1 Proyecto Grupal — Sistema de Detección de Fraudes

Monorepo con frontend React + Vite + TypeScript y backend Django REST Framework + MongoDB.

## Requisitos

- Node.js 18+
- Python 3.11+
- MongoDB 6+ corriendo en localhost:27017

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Disponible en http://localhost:5173

## Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Disponible en http://localhost:8000

## Variables de entorno

### Frontend (`frontend/.env`)
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API Django |

### Backend (`backend/.env`)
| Variable | Descripción |
|---|---|
| `SECRET_KEY` | Clave secreta Django |
| `DEBUG` | Modo debug (True/False) |
| `MONGO_URI` | URI de conexión MongoDB |
| `JWT_SECRET` | Secreto para JWT |

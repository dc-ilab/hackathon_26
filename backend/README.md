# Backend API

This backend serves client data for the React dashboard.

## Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

If you are inside the `backend/` directory:

```bash
uvicorn main:app --reload --port 8000
```

If you are in the project root (`hackathon_26/`):

```bash
uvicorn backend.main:app --reload --port 8000
```

## API

- `GET /api/clients` - list all clients
- `GET /api/clients/{client_id}` - get a single client by id

## Frontend proxy

The frontend Vite config proxies `/api` to `http://127.0.0.1:8000`.

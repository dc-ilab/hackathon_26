# Backend API

This backend serves client data for the React dashboard.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Run

Inside the `backend/` directory:

```bash
uvicorn main:app --reload --port 8000
```

## API

- `GET /api/clients` - list all clients
- `GET /api/clients/{client_id}` - get a single client by id

## Frontend proxy

The frontend Vite config proxies `/api` to `http://127.0.0.1:8000`.

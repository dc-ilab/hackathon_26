from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .data import clients

app = FastAPI(title="Branch Banker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/clients")
def get_clients():
    return clients

@app.get("/api/clients/{client_id}")
def get_client(client_id: str):
    for client in clients:
        if client["id"] == client_id:
            return client
    raise HTTPException(status_code=404, detail="Client not found")

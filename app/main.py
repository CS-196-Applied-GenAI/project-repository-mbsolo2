from fastapi import FastAPI

from app.api.routers.inventory import router as inventory_router

from app.db.models import init_db

app = FastAPI()

@app.on_event("startup")
def on_startup() -> None:
    init_db()

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(inventory_router)


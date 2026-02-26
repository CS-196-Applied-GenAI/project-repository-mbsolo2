import logging
import uuid

from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.api.routers.inventory import router as inventory_router
from app.api.routers.mealplan import router as mealplan_router
from app.db.models import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = request_id
        logger.info("request_id=%s method=%s path=%s", request_id, request.method, request.scope.get("path", ""))
        return await call_next(request)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.add_middleware(RequestLoggingMiddleware)
app.include_router(inventory_router)
app.include_router(mealplan_router)


import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.profile import router as profile_router
from app.api.v1.market import router as market_router
from app.api.v1.goals import router as goals_router
from app.api.v1.agent import router as agent_router
from app.api.v1.me import router as me_router
from app.api.v1.tutor import router as tutor_router

app = FastAPI(
    title="FinSync API",
    version="0.1.0",
    description="Backend API for the FinSync wealth intelligence platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router, prefix="/api/v1")
app.include_router(market_router, prefix="/api/v1")
app.include_router(goals_router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")
app.include_router(me_router, prefix="/api/v1")
app.include_router(tutor_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "name": "FinSync API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "finsync-backend",
    }

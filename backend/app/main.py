"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings, get_cors_origins
from app.api.auth import router as auth_router
from app.api.prompts import router as prompts_router
from app.api.export import router as export_router

app = FastAPI(
    title="AI Prompt Library API",
    description="Internal product adoption tracking – prompts, votes, export",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(prompts_router, prefix="/api")
app.include_router(export_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "AI Prompt Library API", "docs": "/docs"}

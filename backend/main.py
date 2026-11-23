from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, scan

app = FastAPI(
    title="WebGuard API",
    description="A beginner-friendly web vulnerability scanner",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(scan.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "WebGuard API is running!"}

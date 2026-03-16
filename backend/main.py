from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 — ensure models are registered

from routers import auth, stores, shifts, applications, schedules, wages

# 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Daeta API",
    description="알바 대타 관리 앱 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(shifts.router)
app.include_router(applications.router)
app.include_router(schedules.router)
app.include_router(wages.router)


@app.get("/", tags=["root"])
def root():
    return {"message": "Daeta API is running 🚀"}

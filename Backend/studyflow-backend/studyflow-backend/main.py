from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine

# Import all models so SQLAlchemy knows about them before create_all
import app.models.user      # noqa: F401
import app.models.models    # noqa: F401

from app.routers import auth, users, courses, tasks, notes, quizzes, analytics
from app.routers.quiz_questions import router as quiz_questions_router

settings = get_settings()

# ── Create tables (dev convenience; use Alembic for production) ──
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyFlow API",
    description="Backend for the StudyFlow smart learning platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(quizzes.router)
app.include_router(analytics.router)
app.include_router(quiz_questions_router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "StudyFlow API is running 🎓"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import (
    users,
    auth,
    notes,
    notebooks,
    subjects,
    flashcards,
    quizzes,
    attachments,
    ai,
    berichtsheft,
)

from routers.dashboard import router as dashboard_router

app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# STATIC FILES
# =========================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "Welcome to Azubi Backend"
    }


# =========================
# ROUTERS
# =========================

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(notebooks.router)
app.include_router(subjects.router)
app.include_router(flashcards.router)
app.include_router(quizzes.router)
app.include_router(attachments.router)
app.include_router(ai.router)
app.include_router(dashboard_router)
app.include_router(berichtsheft.router)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from dependencies import get_current_user
from models import Notebook, User
from schemas import NotebookCreate, NotebookResponse

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/notebooks", response_model=NotebookResponse)
def create_notebook(
    notebook: NotebookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_notebook = Notebook(
        user_id=current_user.user_id,
        title=notebook.title
    )

    db.add(new_notebook)
    db.commit()
    db.refresh(new_notebook)

    return new_notebook


@router.get("/notebooks", response_model=list[NotebookResponse])
def get_notebooks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notebooks = db.query(Notebook).filter(
        Notebook.user_id == current_user.user_id
    ).all()

    return notebooks
from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Note, Notebook, User
from dependencies import get_current_user
from schemas import NoteCreate, NoteResponse


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/notes", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notebook = db.query(Notebook).filter(
        Notebook.notebook_id == note.notebook_id,
        Notebook.user_id == current_user.user_id
    ).first()

    if not notebook:
        raise HTTPException(
            status_code=404,
            detail="Notebook not found"
        )

    new_note = Note(
        notebook_id=note.notebook_id,
        title=note.title,
        content=note.content
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@router.get("/notes", response_model=list[NoteResponse])
def get_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notes = db.query(Note).join(
        Notebook
    ).filter(
        Notebook.user_id == current_user.user_id
    ).all()

    return notes

@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_note = db.query(Note).join(
    Notebook
).filter(
    Note.note_id == note_id,
    Notebook.user_id == current_user.user_id
).first()

    if not existing_note:
        raise HTTPException(status_code=404,detail="Note not found")

    existing_note.title = note.title
    existing_note.content = note.content

    db.commit()
    db.refresh(existing_note)

    return existing_note

@router.delete("/notes/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    note = db.query(Note).join(
    Notebook
).filter(
    Note.note_id == note_id,
    Notebook.user_id == current_user.user_id
).first()

    if not note:
        return {"error": "Note not found"}

    db.delete(note)
    db.commit()

    return {
        "message": "Note deleted successfully"
    }
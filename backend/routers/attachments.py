from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid

from database import SessionLocal
from models import Attachment, Note, Notebook, User
from schemas import AttachmentResponse
from dependencies import get_current_user


router = APIRouter()

print("ATTACHMENTS ROUTER LOADED")


# ================= DATABASE =================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ================= UPLOAD FOLDER =================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ================= UPLOAD ATTACHMENT =================

@router.post(
    "/notes/{note_id}/attachments",
    response_model=AttachmentResponse
)
def upload_attachment(
    note_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check that the note belongs to the logged-in user
    note = (
        db.query(Note)
        .join(Notebook)
        .filter(
            Note.note_id == note_id,
            Notebook.user_id == current_user.user_id
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )


    # Get file extension
    extension = Path(file.filename).suffix


    # Generate unique filename
    unique_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )


    file_path = UPLOAD_DIR / unique_filename


    # Save file
    try:

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}"
        )


    # Create database record
    new_attachment = Attachment(
        note_id=note_id,
        file_name=file.filename,
        file_type=file.content_type or "application/octet-stream",
        file_url=f"/uploads/{unique_filename}"
    )


    db.add(new_attachment)
    db.commit()
    db.refresh(new_attachment)


    return new_attachment


# ================= GET NOTE ATTACHMENTS =================

@router.get(
    "/notes/{note_id}/attachments",
    response_model=list[AttachmentResponse]
)
def get_note_attachments(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check note ownership
    note = (
        db.query(Note)
        .join(Notebook)
        .filter(
            Note.note_id == note_id,
            Notebook.user_id == current_user.user_id
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )


    attachments = (
        db.query(Attachment)
        .filter(
            Attachment.note_id == note_id
        )
        .all()
    )


    return attachments


# ================= DELETE ATTACHMENT =================

@router.delete(
    "/attachments/{attachment_id}"
)
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    attachment = (
        db.query(Attachment)
        .join(Note)
        .join(Notebook)
        .filter(
            Attachment.attachment_id == attachment_id,
            Notebook.user_id == current_user.user_id
        )
        .first()
    )


    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found"
        )


    # Delete physical file
    if attachment.file_url:

        filename = Path(
            attachment.file_url
        ).name

        file_path = UPLOAD_DIR / filename

        if file_path.exists():
            file_path.unlink()


    # Delete database record
    db.delete(attachment)
    db.commit()


    return {
        "message": "Attachment deleted successfully"
    }
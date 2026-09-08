from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from dependencies import get_current_user

from models import (
    User,
    Berichtsheft,
    BerichtsheftEntry
)

from schemas import (
    BerichtsheftCreate,
    BerichtsheftResponse,
    BerichtsheftEntryCreate,
    BerichtsheftEntryResponse
)


router = APIRouter(
    prefix="/berichtsheft",
    tags=["Berichtsheft"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE BERICHTSHEFT
# =========================

@router.post(
    "",
    response_model=BerichtsheftResponse
)
def create_berichtsheft(
    data: BerichtsheftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_berichtsheft = Berichtsheft(
        user_id=current_user.user_id,
        start_date=data.start_date,
        end_date=data.end_date,
        status="Entwurf"
    )

    db.add(new_berichtsheft)
    db.commit()
    db.refresh(new_berichtsheft)

    return new_berichtsheft


# =========================
# GET ALL BERICHTSHEFTE
# =========================

@router.get(
    "",
    response_model=list[BerichtsheftResponse]
)
def get_berichtshefte(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return db.query(
        Berichtsheft
    ).filter(
        Berichtsheft.user_id == current_user.user_id
    ).order_by(
        Berichtsheft.start_date.desc()
    ).all()


# =========================
# GET ONE BERICHTSHEFT
# =========================

@router.get(
    "/{berichtsheft_id}"
)
def get_berichtsheft(
    berichtsheft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    berichtsheft = db.query(
        Berichtsheft
    ).filter(
        Berichtsheft.berichtsheft_id == berichtsheft_id,
        Berichtsheft.user_id == current_user.user_id
    ).first()

    if not berichtsheft:
        raise HTTPException(
            status_code=404,
            detail="Berichtsheft not found"
        )

    entries = db.query(
        BerichtsheftEntry
    ).filter(
        BerichtsheftEntry.berichtsheft_id == berichtsheft_id
    ).order_by(
        BerichtsheftEntry.entry_date
    ).all()

    return {
        "berichtsheft": berichtsheft,
        "entries": entries
    }


# =========================
# ADD DAILY ENTRY
# =========================

@router.post(
    "/{berichtsheft_id}/entries",
    response_model=BerichtsheftEntryResponse
)
def create_entry(
    berichtsheft_id: int,
    data: BerichtsheftEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    berichtsheft = db.query(
        Berichtsheft
    ).filter(
        Berichtsheft.berichtsheft_id == berichtsheft_id,
        Berichtsheft.user_id == current_user.user_id
    ).first()

    if not berichtsheft:
        raise HTTPException(
            status_code=404,
            detail="Berichtsheft not found"
        )

    entry = BerichtsheftEntry(
        berichtsheft_id=berichtsheft_id,
        entry_date=data.entry_date,
        day_type=data.day_type,
        activity=data.activity
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


# =========================
# UPDATE DAILY ENTRY
# =========================

@router.put(
    "/entries/{entry_id}",
    response_model=BerichtsheftEntryResponse
)
def update_entry(
    entry_id: int,
    data: BerichtsheftEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    entry = db.query(
        BerichtsheftEntry
    ).join(
        Berichtsheft
    ).filter(
        BerichtsheftEntry.entry_id == entry_id,
        Berichtsheft.user_id == current_user.user_id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )

    entry.entry_date = data.entry_date
    entry.day_type = data.day_type
    entry.activity = data.activity

    db.commit()
    db.refresh(entry)

    return entry


# =========================
# DELETE DAILY ENTRY
# =========================

@router.delete(
    "/entries/{entry_id}"
)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    entry = db.query(
        BerichtsheftEntry
    ).join(
        Berichtsheft
    ).filter(
        BerichtsheftEntry.entry_id == entry_id,
        Berichtsheft.user_id == current_user.user_id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )

    db.delete(entry)
    db.commit()

    return {
        "message": "Entry deleted successfully"
    }


# =========================
# DELETE BERICHTSHEFT
# =========================

@router.delete(
    "/{berichtsheft_id}"
)
def delete_berichtsheft(
    berichtsheft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    berichtsheft = db.query(
        Berichtsheft
    ).filter(
        Berichtsheft.berichtsheft_id == berichtsheft_id,
        Berichtsheft.user_id == current_user.user_id
    ).first()

    if not berichtsheft:
        raise HTTPException(
            status_code=404,
            detail="Berichtsheft not found"
        )

    db.query(
        BerichtsheftEntry
    ).filter(
        BerichtsheftEntry.berichtsheft_id == berichtsheft_id
    ).delete()

    db.delete(berichtsheft)
    db.commit()

    return {
        "message": "Berichtsheft deleted successfully"
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Flashcard, User
from schemas import FlashcardCreate, FlashcardResponse
from dependencies import get_current_user


router = APIRouter()

print("FLASHCARDS ROUTER LOADED")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= CREATE =================

@router.post("/flashcards", response_model=FlashcardResponse)
def create_flashcard(
    flashcard: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_flashcard = Flashcard(
        user_id=current_user.user_id,
        question=flashcard.question,
        answer=flashcard.answer,
        review_count=flashcard.review_count,
        mastery_level=flashcard.mastery_level,
        last_review=flashcard.last_review
    )

    db.add(new_flashcard)
    db.commit()
    db.refresh(new_flashcard)

    return new_flashcard


# ================= GET =================

@router.get("/flashcards", response_model=list[FlashcardResponse])
def get_flashcards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    flashcards = db.query(Flashcard).filter(
        Flashcard.user_id == current_user.user_id
    ).all()

    return flashcards


# ================= UPDATE =================

@router.put(
    "/flashcards/{flashcard_id}",
    response_model=FlashcardResponse
)
def update_flashcard(
    flashcard_id: int,
    flashcard: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_flashcard = db.query(Flashcard).filter(
        Flashcard.flashcard_id == flashcard_id,
        Flashcard.user_id == current_user.user_id
    ).first()

    if not existing_flashcard:
        raise HTTPException(
            status_code=404,
            detail="Flashcard not found"
        )

    existing_flashcard.question = flashcard.question
    existing_flashcard.answer = flashcard.answer
    existing_flashcard.review_count = flashcard.review_count
    existing_flashcard.mastery_level = flashcard.mastery_level
    existing_flashcard.last_review = flashcard.last_review

    db.commit()
    db.refresh(existing_flashcard)

    return existing_flashcard


# ================= DELETE =================

@router.delete("/flashcards/{flashcard_id}")
def delete_flashcard(
    flashcard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    flashcard = db.query(Flashcard).filter(
        Flashcard.flashcard_id == flashcard_id,
        Flashcard.user_id == current_user.user_id
    ).first()

    if not flashcard:
        raise HTTPException(
            status_code=404,
            detail="Flashcard not found"
        )

    db.delete(flashcard)
    db.commit()

    return {
        "message": "Flashcard deleted successfully"
    }
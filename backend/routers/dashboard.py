from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from dependencies import get_current_user

from models import (
    User,
    Quiz,
    Flashcard,
    Notebook,
    Note,
    Ausbildungsberuf,
    Company,
    School,
    Berichtsheft
)

from datetime import date


router = APIRouter()

print("DASHBOARD ROUTER LOADED")


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =========================
    # STATISTICS
    # =========================

    quiz_count = db.query(Quiz).filter(
        Quiz.user_id == current_user.user_id
    ).count()

    flashcard_count = db.query(Flashcard).filter(
        Flashcard.user_id == current_user.user_id
    ).count()

    notebook_count = db.query(Notebook).filter(
        Notebook.user_id == current_user.user_id
    ).count()

    note_count = db.query(Note).join(
        Notebook
    ).filter(
        Notebook.user_id == current_user.user_id
    ).count()

    berichtsheft_count = db.query(
        Berichtsheft
    ).filter(
        Berichtsheft.user_id == current_user.user_id
    ).count()


    # =========================
    # USER INFORMATION
    # =========================

    user_name = current_user.first_name or "Student"


    # =========================
    # PROFESSION
    # =========================

    profession = None

    if current_user.profession_id:

        profession = db.query(Ausbildungsberuf).filter(
            Ausbildungsberuf.profession_id ==
            current_user.profession_id
        ).first()


    # =========================
    # COMPANY
    # =========================

    company = None

    if current_user.company_id:

        company = db.query(Company).filter(
            Company.company_id ==
            current_user.company_id
        ).first()


    # =========================
    # SCHOOL
    # =========================

    school = None

    if current_user.school_id:

        school = db.query(School).filter(
            School.school_id ==
            current_user.school_id
        ).first()


    # =========================
    # AUSBILDUNG PROGRESS
    # =========================

    progress = 0
    days_remaining = None

    if (
        current_user.start_date
        and current_user.expected_end_date
    ):

        today = date.today()

        total_days = (
            current_user.expected_end_date
            - current_user.start_date
        ).days

        elapsed_days = (
            today
            - current_user.start_date
        ).days

        if total_days > 0:

            progress = (
                elapsed_days / total_days
            ) * 100

            progress = max(
                0,
                min(100, progress)
            )

        days_remaining = (
            current_user.expected_end_date
            - today
        ).days

        days_remaining = max(
            0,
            days_remaining
        )


    # =========================
    # RECENT NOTES
    # =========================

    recent_notes = db.query(Note).join(
        Notebook
    ).filter(
        Notebook.user_id == current_user.user_id
    ).order_by(
        Note.created_at.desc()
    ).limit(5).all()


    # =========================
    # RECENT FLASHCARDS
    # =========================

    recent_flashcards = db.query(
        Flashcard
    ).filter(
        Flashcard.user_id == current_user.user_id
    ).order_by(
        Flashcard.flashcard_id.desc()
    ).limit(5).all()


    # =========================
    # RECENT QUIZZES
    # =========================

    recent_quizzes = db.query(
        Quiz
    ).filter(
        Quiz.user_id == current_user.user_id
    ).order_by(
        Quiz.created_at.desc()
    ).limit(5).all()


    # =========================
    # RETURN DASHBOARD
    # =========================

    return {

        "user": {

            "user_id": current_user.user_id,

            "first_name": current_user.first_name,

            "last_name": current_user.last_name,

            "email": current_user.email

        },


        "ausbildung": {

            "profession_id": current_user.profession_id,

            "profession_name": (
                profession.profession_name
                if profession
                else None
            ),

            "company_id": current_user.company_id,

            "company_name": (
                company.company_name
                if company
                else None
            ),

            "school_id": current_user.school_id,

            "school_name": (
                school.school_name
                if school
                else None
            ),

            "bundesland": current_user.bundesland,

            "training_year": current_user.training_year,

            "start_date": current_user.start_date,

            "expected_end_date":
                current_user.expected_end_date

        },


        "statistics": {

            "quizzes": quiz_count,

            "flashcards": flashcard_count,

            "notebooks": notebook_count,

            "notes": note_count,

            "training_reports": berichtsheft_count

        },


        "progress": {

            "percentage": round(
                progress,
                1
            ),

            "days_remaining": days_remaining

        },


        "recent_activity": {

            "notes": [

                {
                    "note_id": note.note_id,

                    "title": note.title,

                    "created_at": note.created_at

                }

                for note in recent_notes

            ],


            "flashcards": [

                {
                    "flashcard_id":
                        card.flashcard_id,

                    "question":
                        card.question

                }

                for card in recent_flashcards

            ],


            "quizzes": [

                {
                    "quiz_id":
                        quiz.quiz_id,

                    "title":
                        quiz.title,

                    "created_at":
                        quiz.created_at

                }

                for quiz in recent_quizzes

            ]

        }

    }
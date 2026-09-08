from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Subject
from schemas import SubjectCreate, SubjectResponse


router = APIRouter()
print("SUBJECTS ROUTER LOADED")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/subjects", response_model=SubjectResponse)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db)
):

    new_subject = Subject(
        profession_id=subject.profession_id,
        year=subject.year,
        subject_name=subject.subject_name,
        description=subject.description
    )

    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)

    return new_subject


@router.get("/subjects", response_model=list[SubjectResponse])
def get_subjects(
    db: Session = Depends(get_db)
):

    subjects = db.query(Subject).all()

    return subjects
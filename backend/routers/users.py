from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from dependencies import get_current_user
from models import User, Ausbildungsberuf, Company, School
from schemas import UserCreate, UserResponse, UserUpdate

from security import hash_password


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Get all users
@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()
    return users


# Create user
@router.post("/users", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=hash_password(user.password),

        language=user.language,
        country=user.country,
        bundesland=user.bundesland,

        profession_id=user.profession_id,
        company_id=user.company_id,
        school_id=user.school_id,

        training_year=user.training_year,

        start_date=user.start_date,
        expected_end_date=user.expected_end_date
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# Get current user's profile
@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profession = None
    company = None
    school = None

    if current_user.profession_id:
        profession = db.query(Ausbildungsberuf).filter(
            Ausbildungsberuf.profession_id == current_user.profession_id
        ).first()

    if current_user.company_id:
        company = db.query(Company).filter(
            Company.company_id == current_user.company_id
        ).first()

    if current_user.school_id:
        school = db.query(School).filter(
            School.school_id == current_user.school_id
        ).first()

    return {
        "user_id": current_user.user_id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,

        "language": current_user.language,
        "country": current_user.country,
        "bundesland": current_user.bundesland,

        "profession_id": current_user.profession_id,
        "profession_name": (
            profession.profession_name
            if profession else None
        ),

        "company_id": current_user.company_id,
        "company_name": (
            company.company_name
            if company else None
        ),

        "school_id": current_user.school_id,
        "school_name": (
            school.school_name
            if school else None
        ),

        "training_year": current_user.training_year,
        "start_date": current_user.start_date,
        "expected_end_date": current_user.expected_end_date,

        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }


# Update current user's profile
@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(
        User.user_id == current_user.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.first_name = user_data.first_name
    user.last_name = user_data.last_name
    user.email = user_data.email
    user.language = user_data.language
    user.country = user_data.country
    user.bundesland = user_data.bundesland
    user.profession_id = user_data.profession_id
    user.company_id = user_data.company_id
    user.school_id = user_data.school_id
    user.training_year = user_data.training_year
    user.start_date = user_data.start_date
    user.expected_end_date = user_data.expected_end_date

    if user_data.password:
        user.password_hash = hash_password(
            user_data.password
        )

    db.commit()
    db.refresh(user)

    return user
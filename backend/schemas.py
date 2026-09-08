from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel


class UserBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    language: Optional[str] = None
    country: Optional[str] = None
    bundesland: Optional[str] = None

    profession_id: Optional[int] = None
    company_id: Optional[int] = None
    school_id: Optional[int] = None

    training_year: Optional[int] = None

    start_date: Optional[date] = None
    expected_end_date: Optional[date] = None


class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    language: Optional[str] = None
    country: Optional[str] = None
    bundesland: Optional[str] = None
    profession_id: Optional[int] = None
    company_id: Optional[int] = None
    school_id: Optional[int] = None
    training_year: Optional[int] = None
    start_date: Optional[date] = None
    expected_end_date: Optional[date] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    user_id: int
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotebookCreate(BaseModel):
    title: str


class NotebookResponse(BaseModel):
    notebook_id: int
    user_id: int
    title: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    notebook_id: int
    title: str
    content: Optional[str] = None


class NoteResponse(BaseModel):
    note_id: int
    notebook_id: int
    title: str
    content: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SubjectCreate(BaseModel):
    profession_id: int
    year: int
    subject_name: str
    description: Optional[str] = None


class SubjectResponse(BaseModel):
    subject_id: int
    profession_id: int
    year: int
    subject_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
        
class FlashcardCreate(BaseModel):
    user_id: int
    question: str
    answer: str
    review_count: Optional[int] = 0
    mastery_level: Optional[str] = None
    last_review: Optional[date] = None


class FlashcardResponse(BaseModel):
    flashcard_id: int
    user_id: int
    question: str
    answer: str
    review_count: int
    mastery_level: Optional[str] = None
    last_review: Optional[date] = None

    class Config:
        from_attributes = True
        
class QuizCreate(BaseModel):
    user_id: int
    title: str


class QuizResponse(BaseModel):
    quiz_id: int
    user_id: int
    title: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuizQuestionCreate(BaseModel):
    quiz_id: int
    question_text: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str
    difficulty: Optional[str] = None


class QuizQuestionResponse(BaseModel):
    question_id: int
    quiz_id: int
    question_text: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    correct_answer: str
    difficulty: Optional[str] = None

    class Config:
        from_attributes = True
        
class AttachmentCreate(BaseModel):
    note_id: int
    file_name: str
    file_type: str
    file_url: str


class AttachmentResponse(BaseModel):
    attachment_id: int
    note_id: int
    file_name: str
    file_type: str
    file_url: str
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
    class AIConversationCreate(BaseModel):
        user_message: str
        
    class AIChatRequest(BaseModel):
        question: str


    class AIChatResponse(BaseModel):
        answer: str
        
    class QuizTakeQuestion(BaseModel):
        question_id: int
        quiz_id: int
        question_text: str
        option_a: str
        option_b: str
        option_c: str
        option_d: str
        difficulty: Optional[str] = None

        class Config:
            from_attributes = True
            
# =========================
# BERICHTSHEFT
# =========================

class BerichtsheftCreate(BaseModel):
    start_date: date
    end_date: date


class BerichtsheftResponse(BaseModel):
    berichtsheft_id: int
    user_id: int
    start_date: date
    end_date: date
    status: str

    class Config:
        from_attributes = True


class BerichtsheftEntryCreate(BaseModel):
    entry_date: date
    day_type: str = "Betrieb"
    activity: Optional[str] = None


class BerichtsheftEntryResponse(BaseModel):
    entry_id: int
    berichtsheft_id: int
    entry_date: date
    day_type: str
    activity: Optional[str] = None

    class Config:
        from_attributes = True
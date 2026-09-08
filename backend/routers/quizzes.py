from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ai_service import ask_groq
import json

from database import SessionLocal
from models import Quiz, QuizQuestion, User
from schemas import (
    QuizCreate,
    QuizResponse,
    QuizQuestionCreate,
    QuizQuestionResponse
)
from dependencies import get_current_user


router = APIRouter()

print("QUIZZES ROUTER LOADED")


# =====================================================
# TAKE QUIZ RESPONSE
# =====================================================

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


# =====================================================
# QUIZ ANSWER
# =====================================================

class QuizAnswer(BaseModel):
    question_id: int
    answer: str


class QuizSubmitRequest(BaseModel):
    answers: list[QuizAnswer]


# =====================================================
# DATABASE
# =====================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =====================================================
# CREATE QUIZ
# =====================================================

@router.post(
    "/quizzes",
    response_model=QuizResponse
)
def create_quiz(
    quiz: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_quiz = Quiz(
        user_id=current_user.user_id,
        title=quiz.title
    )

    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    return new_quiz


# =====================================================
# GET MY QUIZZES
# =====================================================

@router.get(
    "/quizzes",
    response_model=list[QuizResponse]
)
def get_quizzes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    quizzes = db.query(Quiz).filter(
        Quiz.user_id == current_user.user_id
    ).all()

    return quizzes


# =====================================================
# CREATE QUIZ QUESTION
# =====================================================

@router.post(
    "/quiz-questions",
    response_model=QuizQuestionResponse
)
def create_question(
    question: QuizQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Make sure quiz belongs to current user

    quiz = db.query(Quiz).filter(
        Quiz.quiz_id == question.quiz_id,
        Quiz.user_id == current_user.user_id
    ).first()

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found"
        )


    new_question = QuizQuestion(
        quiz_id=question.quiz_id,
        question_text=question.question_text,

        option_a=question.option_a,
        option_b=question.option_b,
        option_c=question.option_c,
        option_d=question.option_d,

        correct_answer=question.correct_answer,
        difficulty=question.difficulty
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return new_question


# =====================================================
# GET MY QUIZ QUESTIONS
# =====================================================

@router.get(
    "/quiz-questions",
    response_model=list[QuizQuestionResponse]
)
def get_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    questions = db.query(
        QuizQuestion
    ).join(
        Quiz
    ).filter(
        Quiz.user_id == current_user.user_id
    ).all()

    return questions


# =====================================================
# TAKE A QUIZ
# =====================================================

@router.get(
    "/quizzes/{quiz_id}/take",
    response_model=list[QuizTakeQuestion]
)
def take_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Make sure quiz belongs to current user

    quiz = db.query(Quiz).filter(
        Quiz.quiz_id == quiz_id,
        Quiz.user_id == current_user.user_id
    ).first()

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found"
        )


    questions = db.query(
        QuizQuestion
    ).filter(
        QuizQuestion.quiz_id == quiz_id
    ).all()


    return questions


# =====================================================
# SUBMIT QUIZ
# =====================================================

@router.post(
    "/quizzes/{quiz_id}/submit"
)
def submit_quiz(
    quiz_id: int,
    submission: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # -------------------------------------------------
    # Check quiz ownership
    # -------------------------------------------------

    quiz = db.query(Quiz).filter(
        Quiz.quiz_id == quiz_id,
        Quiz.user_id == current_user.user_id
    ).first()

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found"
        )


    # -------------------------------------------------
    # Get quiz questions
    # -------------------------------------------------

    questions = db.query(
        QuizQuestion
    ).filter(
        QuizQuestion.quiz_id == quiz_id
    ).all()


    if not questions:

        raise HTTPException(
            status_code=400,
            detail="This quiz has no questions"
        )


    # -------------------------------------------------
    # Convert submitted answers to dictionary
    # -------------------------------------------------

    submitted_answers = {
        answer.question_id: answer.answer
        for answer in submission.answers
    }


    # -------------------------------------------------
    # Calculate score
    # -------------------------------------------------

    score = 0
    results = []


    for question in questions:

        user_answer = submitted_answers.get(
            question.question_id
        )

        correct_answer = question.correct_answer


        is_correct = (
            user_answer is not None
            and user_answer.upper() == correct_answer.upper()
        )


        if is_correct:
            score += 1


        results.append({
            "question_id": question.question_id,
            "question": question.question_text,
            "selected_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct
        })


    # -------------------------------------------------
    # Calculate percentage
    # -------------------------------------------------

    total = len(questions)

    percentage = round(
        (score / total) * 100
    )


    # -------------------------------------------------
    # Return result
    # -------------------------------------------------

    return {
        "quiz_id": quiz_id,
        "quiz_title": quiz.title,
        "score": score,
        "total": total,
        "percentage": percentage,
        "results": results
    }
    
    # =====================================================
# AI GENERATE QUIZ
# =====================================================

class AIGenerateQuizRequest(BaseModel):
    topic: str
    number_of_questions: int = 10
    difficulty: str = "Medium"


@router.post("/quizzes/ai-generate")
def generate_quiz_with_ai(
    request: AIGenerateQuizRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    prompt = f"""
Create a multiple-choice quiz.

Topic: {request.topic}
Number of questions: {request.number_of_questions}
Difficulty: {request.difficulty}

Return ONLY valid JSON.

The JSON must be a list of objects with exactly these fields:

question_text
option_a
option_b
option_c
option_d
correct_answer
difficulty

correct_answer must be only:
A, B, C, or D.

Example:

[
  {{
    "question_text": "What is Python?",
    "option_a": "A programming language",
    "option_b": "A database",
    "option_c": "An operating system",
    "option_d": "A web browser",
    "correct_answer": "A",
    "difficulty": "Easy"
  }}
]
"""

    try:

        ai_response = ask_groq(prompt)

        questions_data = json.loads(ai_response)

        quiz = Quiz(
            user_id=current_user.user_id,
            title=f"AI Quiz - {request.topic}"
        )

        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        created_questions = []

        for item in questions_data:

            question = QuizQuestion(
                quiz_id=quiz.quiz_id,
                question_text=item["question_text"],
                option_a=item["option_a"],
                option_b=item["option_b"],
                option_c=item["option_c"],
                option_d=item["option_d"],
                correct_answer=item["correct_answer"],
                difficulty=item["difficulty"]
            )

            db.add(question)
            created_questions.append(question)

        db.commit()

        return {
            "message": "AI quiz generated successfully",
            "quiz_id": quiz.quiz_id,
            "title": quiz.title,
            "number_of_questions": len(created_questions)
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"AI quiz generation failed: {str(e)}"
        )
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ai_service import ask_groq
from database import get_db
from models import AIConversation, User
from dependencies import get_current_user


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


class Question(BaseModel):
    message: str


@router.post("/chat")
def chat_with_ai(
    question: Question,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Get the most recent 5 conversations
    previous_conversations = (
        db.query(AIConversation)
        .filter(AIConversation.user_id == current_user.user_id)
        .order_by(AIConversation.created_at.desc())
        .limit(5)
        .all()
    )

    # Put them back in chronological order
    previous_conversations.reverse()

    messages = []

    for conversation in previous_conversations:

        messages.append({
            "role": "user",
            "content": conversation.question
        })

        messages.append({
            "role": "assistant",
            "content": conversation.answer
        })

    # Add the current question
    messages.append({
        "role": "user",
        "content": question.message
    })

    # Ask AI
    answer = ask_groq(messages)

    # Save conversation
    conversation = AIConversation(
        user_id=current_user.user_id,
        question=question.message,
        answer=answer
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return {
        "question": question.message,
        "answer": answer
    }
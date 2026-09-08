from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, text, Date, func
from database import Base
from sqlalchemy.orm import relationship
class School(Base):
    __tablename__ = "Schools"

    school_id = Column(Integer, primary_key=True)
    school_name = Column(String(100))
    location = Column(String(100))


class Company(Base):
    __tablename__ = "Companies"

    company_id = Column(Integer, primary_key=True)
    company_name = Column(String(100))
    location = Column(String(100))


class Ausbildungsberuf(Base):
    __tablename__ = "Ausbildungsberufe"

    profession_id = Column(Integer, primary_key=True)
    profession_name = Column(String(100))
    
class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(50))
    last_name = Column(String(50))

    email = Column(String(100), unique=True)

    password_hash = Column(Text)

    profile_picture = Column(Text)

    language = Column(String(20))
    country = Column(String(50))
    bundesland = Column(String(50))

    profession_id = Column(Integer, ForeignKey("Ausbildungsberufe.profession_id"))
    company_id = Column(Integer, ForeignKey("Companies.company_id"))
    school_id = Column(Integer, ForeignKey("Schools.school_id"))

    training_year = Column(Integer)

    start_date = Column(Date)
    expected_end_date = Column(Date)

    created_at = Column(TIMESTAMP)
    last_login = Column(TIMESTAMP)
    
class Note(Base):
    __tablename__ = "Notes"

    note_id = Column(Integer, primary_key=True, index=True)

    notebook_id = Column(Integer, ForeignKey("Notebooks.notebook_id"))

    title = Column(String(100))

    content = Column(Text)

    created_at = Column(
        TIMESTAMP,
        server_default="CURRENT_TIMESTAMP"
    )

    updated_at = Column(
    TIMESTAMP,
    server_default=func.current_timestamp(),
    onupdate=func.current_timestamp()
)
    
class Notebook(Base):
    __tablename__ = "Notebooks"

    notebook_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("Users.user_id"))

    title = Column(String(100))

    created_at = Column(
        TIMESTAMP,
        server_default="CURRENT_TIMESTAMP"
    )
    
class Subject(Base):
    __tablename__ = "Subjects"

    subject_id = Column(Integer, primary_key=True, index=True)
    profession_id = Column(Integer, ForeignKey("Ausbildungsberufe.profession_id"))

    year = Column(Integer)
    subject_name = Column(String(100))
    description = Column(Text)
    
class Flashcard(Base):
    __tablename__ = "Flashcards"

    flashcard_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("Users.user_id")
    )

    question = Column(Text)

    answer = Column(Text)

    review_count = Column(Integer, default=0)

    mastery_level = Column(String(50))

    last_review = Column(Date)
    
class Quiz(Base):
    __tablename__ = "Quizzes"

    quiz_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("Users.user_id")
    )

    title = Column(String(100))

    created_at = Column(
        TIMESTAMP,
        server_default="CURRENT_TIMESTAMP"
    )


class QuizQuestion(Base):
    __tablename__ = "Quiz_Questions"

    question_id = Column(Integer, primary_key=True, index=True)

    quiz_id = Column(
        Integer,
        ForeignKey("Quizzes.quiz_id")
    )

    question_text = Column(Text)

    option_a = Column(String(255))
    option_b = Column(String(255))
    option_c = Column(String(255))
    option_d = Column(String(255))

    correct_answer = Column(String(255))

    difficulty = Column(String(50))
    
class Attachment(Base):
    __tablename__ = "Attachments"

    attachment_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    note_id = Column(
        Integer,
        ForeignKey("Notes.note_id")
    )

    file_name = Column(String(255))

    file_type = Column(String(50))

    file_url = Column(Text)

    uploaded_at = Column(
        TIMESTAMP,
        server_default="CURRENT_TIMESTAMP"
    )
    
class AIConversation(Base):
    __tablename__ = "AI_Conversations"

    conversation_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"))
    question = Column(Text)
    answer = Column(Text)
    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    user = relationship("User")
class Berichtsheft(Base):
    __tablename__ = "Berichtshefte"

    berichtsheft_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("Users.user_id")
    )

    start_date = Column(Date)
    end_date = Column(Date)

    status = Column(
        String(20),
        default="Entwurf"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    user = relationship("User") 
    
class BerichtsheftEntry(Base):
    __tablename__ = "Berichtsheft_Entries"

    entry_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    berichtsheft_id = Column(
        Integer,
        ForeignKey("Berichtshefte.berichtsheft_id")
    )

    entry_date = Column(Date)

    day_type = Column(
        String(30),
        default="Betrieb"
    )

    activity = Column(Text)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    updated_at = Column(
        TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    berichtsheft = relationship("Berichtsheft")
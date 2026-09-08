import { useEffect, useState } from 'react'

function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState(null)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [masteryLevel, setMasteryLevel] = useState('New')

  const [showAnswer, setShowAnswer] = useState({})

  const token = localStorage.getItem('access_token')

  // ================= LOAD =================

  useEffect(() => {
    loadFlashcards()
  }, [])

  const loadFlashcards = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/flashcards',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load flashcards'
        )
      }

      setFlashcards(data)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ================= CREATE =================

  const createFlashcard = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/flashcards',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: 0,
            question,
            answer,
            review_count: 0,
            mastery_level: masteryLevel,
            last_review: null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to create flashcard'
        )
      }

      setFlashcards((prev) => [...prev, data])

      resetForm()

    } catch (err) {
      setError(err.message)
    }
  }

  // ================= UPDATE =================

  const updateFlashcard = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/flashcards/${editingCard.flashcard_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: editingCard.user_id,
            question,
            answer,
            review_count: editingCard.review_count,
            mastery_level: masteryLevel,
            last_review: editingCard.last_review,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to update flashcard'
        )
      }

      setFlashcards((prev) =>
        prev.map((card) =>
          card.flashcard_id === data.flashcard_id
            ? data
            : card
        )
      )

      resetForm()

    } catch (err) {
      setError(err.message)
    }
  }

  // ================= DELETE =================

  const deleteFlashcard = async (id) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this flashcard?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/flashcards/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to delete flashcard'
        )
      }

      setFlashcards((prev) =>
        prev.filter(
          (card) => card.flashcard_id !== id
        )
      )

    } catch (err) {
      setError(err.message)
    }
  }

  // ================= FORM =================

  const resetForm = () => {
    setShowForm(false)
    setEditingCard(null)
    setQuestion('')
    setAnswer('')
    setMasteryLevel('New')
  }

  const startEditing = (card) => {
    setEditingCard(card)
    setQuestion(card.question)
    setAnswer(card.answer)
    setMasteryLevel(card.mastery_level || 'New')
    setShowForm(true)
  }

  // ================= REVEAL =================

  const toggleAnswer = (id) => {
    setShowAnswer((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flashcards-page">

        <div className="page-header">
          <h1>🧠 Flashcards</h1>
          <p>Loading your flashcards...</p>
        </div>

        <div className="loading-box">
          Loading...
        </div>

      </div>
    )
  }

  return (
    <div className="flashcards-page">

      {/* HEADER */}

      <div className="page-header flashcards-header">

        <div>

          <h1>
            🧠 Flashcards
          </h1>

          <p>
            Review concepts and strengthen your knowledge.
          </p>

        </div>

        <button
          className="new-flashcard-button"
          onClick={() => {
            setEditingCard(null)
            setQuestion('')
            setAnswer('')
            setMasteryLevel('New')
            setShowForm(true)
          }}
        >
          + New Flashcard
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-box">
          ❌ {error}
        </div>
      )}

      {/* FORM */}

      {showForm && (

        <div className="flashcard-form-card">

          <div className="form-header">

            <h2>
              {editingCard
                ? '✏️ Edit Flashcard'
                : '✨ Create Flashcard'}
            </h2>

            <button
              className="close-form"
              onClick={resetForm}
            >
              ✕
            </button>

          </div>

          <form
            onSubmit={
              editingCard
                ? updateFlashcard
                : createFlashcard
            }
          >

            <label>
              Question
            </label>

            <textarea
              className="flashcard-input"
              placeholder="Enter your question..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              required
            />

            <label>
              Answer
            </label>

            <textarea
              className="flashcard-input"
              placeholder="Enter the answer..."
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              required
            />

            <label>
              Mastery Level
            </label>

            <select
              className="mastery-select"
              value={masteryLevel}
              onChange={(e) =>
                setMasteryLevel(e.target.value)
              }
            >
              <option value="New">
                New
              </option>

              <option value="Learning">
                Learning
              </option>

              <option value="Mastered">
                Mastered
              </option>
            </select>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button type="submit">
                {editingCard
                  ? 'Save Changes'
                  : 'Create Flashcard'}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* EMPTY */}

      {flashcards.length === 0 ? (

        <div className="empty-box">

          <div className="empty-icon">
            🧠
          </div>

          <h2>
            No flashcards yet
          </h2>

          <p>
            Create your first flashcard and start learning.
          </p>

          <button
            onClick={() => setShowForm(true)}
          >
            + Create Flashcard
          </button>

        </div>

      ) : (

        <div className="flashcards-grid">

          {flashcards.map((card) => (

            <div
              className="flashcard"
              key={card.flashcard_id}
            >

              <div className="flashcard-top">

                <span className="mastery-badge">
                  {card.mastery_level || 'New'}
                </span>

                <div className="flashcard-actions">

                  <button
                    onClick={() =>
                      startEditing(card)
                    }
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() =>
                      deleteFlashcard(
                        card.flashcard_id
                      )
                    }
                  >
                    🗑
                  </button>

                </div>

              </div>

              <div className="flashcard-question">

                <span>
                  QUESTION
                </span>

                <h2>
                  {card.question}
                </h2>

              </div>

              {showAnswer[card.flashcard_id] && (

                <div className="flashcard-answer">

                  <span>
                    ANSWER
                  </span>

                  <p>
                    {card.answer}
                  </p>

                </div>

              )}

              <button
                className="reveal-button"
                onClick={() =>
                  toggleAnswer(card.flashcard_id)
                }
              >
                {showAnswer[card.flashcard_id]
                  ? 'Hide Answer ↑'
                  : 'Reveal Answer ↓'}
              </button>

              <div className="review-info">
                🔄 Reviewed {card.review_count} times
              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default FlashcardsPage
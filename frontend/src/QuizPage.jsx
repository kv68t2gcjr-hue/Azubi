import { useEffect, useState } from 'react'

function QuizPage() {

  // =========================
  // STATE
  // =========================

  const [quizzes, setQuizzes] = useState([])
  const [questions, setQuestions] = useState([])

  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})

  const [quizStarted, setQuizStarted] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)

  const [result, setResult] = useState(null)

  const [showQuizForm, setShowQuizForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showAIForm, setShowAIForm] = useState(false)

  const [quizTitle, setQuizTitle] = useState('')

  const [questionText, setQuestionText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('A')
  const [difficulty, setDifficulty] = useState('Easy')

  // AI Quiz
  const [aiTopic, setAiTopic] = useState('')
  const [aiNumber, setAiNumber] = useState(10)
  const [aiDifficulty, setAiDifficulty] = useState('Medium')
  const [aiLoading, setAiLoading] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('access_token')


  // =========================
  // LOAD QUIZZES
  // =========================

  useEffect(() => {
    loadQuizzes()
  }, [])


  const loadQuizzes = async () => {

    try {

      const response = await fetch(
        'http://127.0.0.1:8000/quizzes',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load quizzes'
        )
      }

      setQuizzes(data)

    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)

    }
  }


  // =========================
  // CREATE QUIZ
  // =========================

  const createQuiz = async (e) => {

    e.preventDefault()

    setError('')

    try {

      const response = await fetch(
        'http://127.0.0.1:8000/quizzes',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            user_id: 0,
            title: quizTitle,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail || 'Failed to create quiz'
        )

      }

      setQuizzes((prev) => [
        ...prev,
        data
      ])

      setQuizTitle('')
      setShowQuizForm(false)
      setSelectedQuiz(data)

    } catch (err) {

      setError(err.message)

    }
  }


  // =========================
  // CREATE QUESTION
  // =========================

  const createQuestion = async (e) => {

    e.preventDefault()

    if (!selectedQuiz) {

      setError(
        'Please select a quiz first.'
      )

      return
    }

    setError('')

    try {

      const response = await fetch(
        'http://127.0.0.1:8000/quiz-questions',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({

            quiz_id:
              selectedQuiz.quiz_id,

            question_text:
              questionText,

            option_a:
              optionA,

            option_b:
              optionB,

            option_c:
              optionC,

            option_d:
              optionD,

            correct_answer:
              correctAnswer,

            difficulty:
              difficulty,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Failed to create question'
        )

      }

      setQuestionText('')
      setOptionA('')
      setOptionB('')
      setOptionC('')
      setOptionD('')
      setCorrectAnswer('A')
      setDifficulty('Easy')

      setShowQuestionForm(false)

      setError('')

    } catch (err) {

      setError(err.message)

    }
  }


  // =========================
  // AI GENERATE QUIZ
  // =========================

  const generateAIQuiz = async (e) => {

    e.preventDefault()

    if (!aiTopic.trim()) {

      setError(
        'Please enter a topic.'
      )

      return
    }

    setError('')
    setAiLoading(true)

    try {

      const response = await fetch(
        'http://127.0.0.1:8000/quizzes/ai-generate',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({

            topic:
              aiTopic,

            number_of_questions:
              Number(aiNumber),

            difficulty:
              aiDifficulty,

          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Failed to generate quiz'
        )

      }

      // Clear form

      setAiTopic('')
      setAiNumber(10)
      setAiDifficulty('Medium')

      setShowAIForm(false)

      // Reload quizzes

      await loadQuizzes()

      // Select generated quiz

      const newQuiz = {
        quiz_id: data.quiz_id,
        title: data.title,
      }

      setSelectedQuiz(newQuiz)

      setError('')

    } catch (err) {

      setError(err.message)

    } finally {

      setAiLoading(false)

    }
  }


  // =========================
  // START QUIZ
  // =========================

  const startQuiz = async (quiz = selectedQuiz) => {

    if (!quiz) {

      setError(
        'Please select a quiz first.'
      )

      return
    }

    setError('')

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/quizzes/${quiz.quiz_id}/take`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Failed to start quiz'
        )

      }

      if (data.length === 0) {

        setError(
          'This quiz does not have any questions yet.'
        )

        return
      }

      setSelectedQuiz(quiz)

      setQuestions(data)

      setAnswers({})

      setCurrentQuestion(0)

      setQuizStarted(true)

      setQuizFinished(false)

      setResult(null)

    } catch (err) {

      setError(err.message)

    }
  }


  // =========================
  // SELECT ANSWER
  // =========================

  const selectAnswer = (answer) => {

    const question =
      questions[currentQuestion]

    setAnswers((prev) => ({

      ...prev,

      [question.question_id]:
        answer,

    }))
  }


  // =========================
  // NEXT QUESTION
  // =========================

  const nextQuestion = () => {

    if (
      currentQuestion <
      questions.length - 1
    ) {

      setCurrentQuestion(
        currentQuestion + 1
      )

    } else {

      submitQuiz()

    }
  }


  // =========================
  // PREVIOUS QUESTION
  // =========================

  const previousQuestion = () => {

    if (currentQuestion > 0) {

      setCurrentQuestion(
        currentQuestion - 1
      )

    }
  }


  // =========================
  // SUBMIT QUIZ
  // =========================

  const submitQuiz = async () => {

    setError('')

    try {

      const formattedAnswers =
        Object.entries(answers).map(
          ([question_id, answer]) => ({

            question_id:
              Number(question_id),

            answer:
              answer,

          })
        )


      const response = await fetch(
        `http://127.0.0.1:8000/quizzes/${selectedQuiz.quiz_id}/submit`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({

            answers:
              formattedAnswers,

          }),
        }
      )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Failed to submit quiz'
        )

      }


      setResult(data)

      setQuizFinished(true)

      setQuizStarted(false)

    } catch (err) {

      setError(err.message)

    }
  }


  // =========================
  // RETRY QUIZ
  // =========================

  const retryQuiz = () => {

    setAnswers({})

    setCurrentQuestion(0)

    setQuizFinished(false)

    setQuizStarted(false)

    setResult(null)

    setError('')

    if (selectedQuiz) {
      startQuiz(selectedQuiz)
    }
  }


  // =========================
  // BACK TO QUIZZES
  // =========================

  const backToQuizzes = () => {

    setQuizStarted(false)

    setQuizFinished(false)

    setSelectedQuiz(null)

    setQuestions([])

    setAnswers({})

    setResult(null)

    setError('')

  }


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="page">

        <h1>📝 Quizzes</h1>

        <p>
          Loading quizzes...
        </p>

      </div>

    )
  }


  // =====================================================
  // QUIZ RESULT
  // =====================================================

  if (
    quizFinished &&
    result
  ) {

    return (

      <div className="page">

        <div className="quiz-result">

          <h1>
            🎉 Quiz Completed!
          </h1>

          <h2>
            {result.quiz_title}
          </h2>

          <div className="score">

            <strong>
              {result.score}/
              {result.total}
            </strong>

            <span>
              {result.percentage}%
            </span>

          </div>


          <p>

            {result.percentage >= 80

              ? 'Excellent work! 🌟'

              : result.percentage >= 60

              ? 'Good job! Keep practicing! 💪'

              : 'Keep studying and try again! 📚'

            }

          </p>


          <div className="result-actions">

            <button
              onClick={retryQuiz}
            >
              🔄 Retry Quiz
            </button>


            <button
              onClick={backToQuizzes}
            >
              ← Back to Quizzes
            </button>

          </div>

        </div>


        {/* REVIEW */}

        <div className="review-section">

          <h2>
            Review Answers
          </h2>


          {result.results.map(
            (item, index) => (

              <div
                key={
                  item.question_id
                }

                className={`review-card ${
                  item.is_correct
                    ? 'correct'
                    : 'wrong'
                }`}
              >

                <div className="review-header">

                  <span>
                    Question {index + 1}
                  </span>


                  <strong>

                    {item.is_correct

                      ? '✅ Correct'

                      : '❌ Wrong'

                    }

                  </strong>

                </div>


                <h3>
                  {item.question}
                </h3>


                <p>

                  <strong>
                    Your answer:
                  </strong>{' '}

                  {item.selected_answer ||
                    'Not answered'}

                </p>


                <p>

                  <strong>
                    Correct answer:
                  </strong>{' '}

                  {item.correct_answer}

                </p>

              </div>

            )
          )}

        </div>

      </div>

    )
  }


  // =====================================================
  // QUIZ IN PROGRESS
  // =====================================================

  if (
    quizStarted &&
    questions.length > 0
  ) {

    const question =
      questions[currentQuestion]


    const selectedAnswer =
      answers[
        question.question_id
      ]


    const progress =
      ((currentQuestion + 1) /
        questions.length) *
      100


    return (

      <div className="page quiz-page">

        <div className="quiz-top">

          <button
            onClick={backToQuizzes}
          >
            ← Exit Quiz
          </button>


          <span>

            {currentQuestion + 1}
            {' '}of{' '}
            {questions.length}

          </span>

        </div>


        {/* PROGRESS */}

        <div className="progress-container">

          <div
            className="progress-bar"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>


        {/* QUESTION */}

        <div className="question-container">

          <div className="question-number">

            Question{' '}
            {currentQuestion + 1}

          </div>


          <h1>
            {question.question_text}
          </h1>


          {question.difficulty && (

            <span className="difficulty">

              {question.difficulty}

            </span>

          )}


          {/* OPTIONS */}

          <div className="quiz-options">

            {[

              ['A', question.option_a],

              ['B', question.option_b],

              ['C', question.option_c],

              ['D', question.option_d],

            ].map(
              ([letter, text]) => (

                <label
                  key={letter}

                  className={`quiz-option ${
                    selectedAnswer === letter
                      ? 'selected'
                      : ''
                  }`}
                >

                  <input
                    type="radio"

                    name={
                      `question-${question.question_id}`
                    }

                    value={letter}

                    checked={
                      selectedAnswer === letter
                    }

                    onChange={() =>
                      selectAnswer(letter)
                    }
                  />


                  <span className="option-letter">
                    {letter}
                  </span>


                  <span>
                    {text}
                  </span>

                </label>

              )
            )}

          </div>


          {/* NAVIGATION */}

          <div className="quiz-navigation">

            <button
              onClick={
                previousQuestion
              }

              disabled={
                currentQuestion === 0
              }
            >
              ← Previous
            </button>


            <button
              onClick={
                nextQuestion
              }
            >

              {currentQuestion ===
              questions.length - 1

                ? 'Submit Quiz ✓'

                : 'Next →'

              }

            </button>

          </div>

        </div>

      </div>

    )
  }


  // =====================================================
  // MAIN QUIZ PAGE
  // =====================================================

  return (

    <div className="page quiz-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            📝 Quizzes
          </h1>

          <p>
            Test your knowledge and practice your subjects.
          </p>

        </div>


        <div>

          {/* NEW QUIZ */}

          <button
            onClick={() =>
              setShowQuizForm(true)
            }
          >
            + New Quiz
          </button>


          {/* AI QUIZ */}

          <button
            onClick={() =>
              setShowAIForm(true)
            }
          >
            🤖 Generate with AI
          </button>


          {/* ADD QUESTION */}

          <button
            onClick={() =>
              setShowQuestionForm(true)
            }

            disabled={
              !selectedQuiz
            }
          >
            + Add Question
          </button>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="error-box">

          ❌ {error}

        </div>

      )}


      {/* =====================================================
          CREATE QUIZ FORM
      ===================================================== */}

      {showQuizForm && (

        <div className="form-card">

          <h2>
            Create Quiz
          </h2>


          <form
            onSubmit={
              createQuiz
            }
          >

            <input
              type="text"

              placeholder={
                "Quiz title..."
              }

              value={
                quizTitle
              }

              onChange={(e) =>
                setQuizTitle(
                  e.target.value
                )
              }

              required
            />


            <button
              type="submit"
            >
              Create Quiz
            </button>


            <button
              type="button"

              onClick={() =>
                setShowQuizForm(false)
              }
            >
              Cancel
            </button>

          </form>

        </div>

      )}


      {/* =====================================================
          AI QUIZ FORM
      ===================================================== */}

      {showAIForm && (

        <div className="form-card">

          <h2>
            🤖 Generate Quiz with AI
          </h2>

          <p>
            Let AI create a complete
            multiple-choice quiz for you.
          </p>


          <form
            onSubmit={
              generateAIQuiz
            }
          >

            {/* TOPIC */}

            <label>
              Topic
            </label>

            <input
              type="text"

              placeholder={
                "e.g. Python OOP"
              }

              value={
                aiTopic
              }

              onChange={(e) =>
                setAiTopic(
                  e.target.value
                )
              }

              required
            />


            {/* NUMBER */}

            <label>
              Number of Questions
            </label>

            <select
              value={
                aiNumber
              }

              onChange={(e) =>
                setAiNumber(
                  e.target.value
                )
              }
            >

              <option value="5">
                5 Questions
              </option>

              <option value="10">
                10 Questions
              </option>

              <option value="15">
                15 Questions
              </option>

              <option value="20">
                20 Questions
              </option>

            </select>


            {/* DIFFICULTY */}

            <label>
              Difficulty
            </label>

            <select
              value={
                aiDifficulty
              }

              onChange={(e) =>
                setAiDifficulty(
                  e.target.value
                )
              }
            >

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>

            </select>


            {/* BUTTON */}

            <button
              type="submit"

              disabled={
                aiLoading
              }
            >

              {aiLoading

                ? '🤖 Generating...'

                : '✨ Generate Quiz'

              }

            </button>


            <button
              type="button"

              onClick={() =>
                setShowAIForm(false)
              }

              disabled={
                aiLoading
              }
            >
              Cancel
            </button>

          </form>

        </div>

      )}


      {/* =====================================================
          ADD QUESTION
      ===================================================== */}

      {showQuestionForm &&
        selectedQuiz && (

          <div className="form-card">

            <h2>
              Add Question
            </h2>


            <p>

              Quiz:{' '}

              <strong>
                {selectedQuiz.title}
              </strong>

            </p>


            <form
              onSubmit={
                createQuestion
              }
            >

              <textarea
                placeholder={
                  "Question..."
                }

                value={
                  questionText
                }

                onChange={(e) =>
                  setQuestionText(
                    e.target.value
                  )
                }

                required
              />


              <input
                placeholder="Option A"

                value={
                  optionA
                }

                onChange={(e) =>
                  setOptionA(
                    e.target.value
                  )
                }

                required
              />


              <input
                placeholder="Option B"

                value={
                  optionB
                }

                onChange={(e) =>
                  setOptionB(
                    e.target.value
                  )
                }

                required
              />


              <input
                placeholder="Option C"

                value={
                  optionC
                }

                onChange={(e) =>
                  setOptionC(
                    e.target.value
                  )
                }

                required
              />


              <input
                placeholder="Option D"

                value={
                  optionD
                }

                onChange={(e) =>
                  setOptionD(
                    e.target.value
                  )
                }

                required
              />


              <label>
                Correct Answer
              </label>


              <select
                value={
                  correctAnswer
                }

                onChange={(e) =>
                  setCorrectAnswer(
                    e.target.value
                  )
                }
              >

                <option value="A">
                  A
                </option>

                <option value="B">
                  B
                </option>

                <option value="C">
                  C
                </option>

                <option value="D">
                  D
                </option>

              </select>


              <label>
                Difficulty
              </label>


              <select
                value={
                  difficulty
                }

                onChange={(e) =>
                  setDifficulty(
                    e.target.value
                  )
                }
              >

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>

              </select>


              <button
                type="submit"
              >
                Add Question
              </button>


              <button
                type="button"

                onClick={() =>
                  setShowQuestionForm(false)
                }
              >
                Cancel
              </button>

            </form>

          </div>

        )}


      {/* =====================================================
          QUIZ LIST
      ===================================================== */}

      <div className="quizzes-layout">

        <div className="quiz-list">

          <h2>
            My Quizzes
          </h2>


          {quizzes.length === 0 ? (

            <p>
              No quizzes yet.
            </p>

          ) : (

            quizzes.map(
              (quiz) => (

                <div
                  key={
                    quiz.quiz_id
                  }

                  className={`quiz-item ${
                    selectedQuiz?.quiz_id ===
                    quiz.quiz_id
                      ? 'selected'
                      : ''
                  }`}

                  onClick={() =>
                    setSelectedQuiz(
                      quiz
                    )
                  }
                >

                  <h3>
                    {quiz.title}
                  </h3>


                  {/* IMPORTANT:
                      Pass quiz directly to startQuiz
                      to avoid async state issue.
                  */}

                  <button
                    onClick={(e) => {

                      e.stopPropagation()

                      startQuiz(
                        quiz
                      )

                    }}
                  >
                    ▶ Start Quiz
                  </button>

                </div>

              )
            )

          )}

        </div>


        {/* =====================================================
            SELECTED QUIZ
        ===================================================== */}

        <div className="question-list">

          {selectedQuiz ? (

            <>

              <h2>
                {selectedQuiz.title}
              </h2>


              <button
                onClick={() =>
                  startQuiz(
                    selectedQuiz
                  )
                }
              >
                🚀 Start Quiz
              </button>


              <button
                onClick={() =>
                  setShowQuestionForm(
                    true
                  )
                }
              >
                + Add Question
              </button>

            </>

          ) : (

            <div>

              <h2>
                Select a quiz
              </h2>

              <p>
                Choose a quiz from the left to start practicing.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  )
}

export default QuizPage
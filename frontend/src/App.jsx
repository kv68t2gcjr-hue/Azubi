import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import NotesPage from './NotesPage'
import FlashcardsPage from './FlashcardsPage'
import QuizPage from './QuizPage'
import DashboardPage from './DashboardPage'
import ProfilePage from './ProfilePage'
import BerichtsheftPage from './BerichtsheftPage'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [registerMode, setRegisterMode] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem('access_token')
  )

  const [page, setPage] = useState('dashboard')

  // ================= AI CHAT =================

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [aiLoading, setAiLoading] = useState(false)

  // ================= SUBJECTS =================

  const [subjects, setSubjects] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState('')

  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const formData = new URLSearchParams()

      formData.append('username', email)
      formData.append('password', password)

      const response = await fetch(
        'http://127.0.0.1:8000/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed')
      }

      localStorage.setItem(
        'access_token',
        data.access_token
      )

      setLoggedIn(true)
      setPage('dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ================= REGISTER =================

  const handleRegister = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Registration failed'
        )
      }

      alert('Account created successfully! 🎉')

      setRegisterMode(false)
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem('access_token')

    setLoggedIn(false)
    setPage('home')
    setMessages([])
  }

  // ================= AI =================

  const askAI = async () => {
    if (!question.trim() || aiLoading) return

    const userQuestion = question.trim()

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userQuestion,
      },
    ])

    setQuestion('')
    setAiLoading(true)

    try {
      const token = localStorage.getItem(
        'access_token'
      )

      const response = await fetch(
        'http://127.0.0.1:8000/ai/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userQuestion,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'AI request failed'
        )
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: data.answer,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `Sorry, something went wrong: ${err.message}`,
        },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  // ================= SUBJECTS =================

  const loadSubjects = async () => {
    setSubjectsLoading(true)
    setSubjectsError('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/subjects'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load subjects'
        )
      }

      setSubjects(data)
    } catch (err) {
      setSubjectsError(err.message)
    } finally {
      setSubjectsLoading(false)
    }
  }

  const openSubjects = () => {
    setPage('subjects')
    loadSubjects()
  }

  // ================= LOGIN / REGISTER PAGE =================

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-left">

          <div className="brand">
            <div className="logo">A</div>
            <span>Azubi</span>
          </div>

          <div className="welcome">

            {!registerMode ? (
              <>
                <h1>
                  Welcome back 👋
                </h1>

                <p>
                  Continue your Ausbildung journey with Azubi.
                </p>

                <form onSubmit={handleLogin}>

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <div className="forgot">
                    <a href="#">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? 'Logging in...'
                      : 'Log in'}
                  </button>

                </form>

                {error && (
                  <p
                    style={{
                      color: 'red',
                      marginTop: '15px',
                    }}
                  >
                    {error}
                  </p>
                )}

                <p className="signup">
                  Don't have an account?

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setRegisterMode(true)
                      setError('')
                    }}
                  >
                    {' '}
                    Create account
                  </a>
                </p>
              </>
            ) : (
              <>
                <h1>
                  Create your account 🚀
                </h1>

                <p>
                  Start your Ausbildung journey with Azubi.
                </p>

                <form onSubmit={handleRegister}>

                  <label>
                    First name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    required
                  />

                  <label>
                    Last name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    required
                  />

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    minLength={6}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? 'Creating account...'
                      : 'Create account'}
                  </button>

                </form>

                {error && (
                  <p
                    style={{
                      color: 'red',
                      marginTop: '15px',
                    }}
                  >
                    {error}
                  </p>
                )}

                <p className="signup">
                  Already have an account?

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setRegisterMode(false)
                      setError('')
                    }}
                  >
                    {' '}
                    Log in
                  </a>
                </p>
              </>
            )}

          </div>

        </div>

        <div className="login-right">

          <div className="overlay">

            <h2>
              Build your future
              <br />
              in Germany 🇩🇪
            </h2>

            <p>
              Learn, practice, and stay organized
              throughout your Ausbildung journey.
            </p>

          </div>

        </div>

      </div>
    )
  }

  // ================= MAIN APP =================

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">
          <div className="logo">A</div>
          <span>Azubi</span>
        </div>

        <nav>

          <button
            className={`nav-item ${
              page === 'dashboard' ? 'active' : ''
            }`}
            onClick={() => setPage('dashboard')}
          >
            📊 Dashboard
          </button>

          <button
            className={`nav-item ${
              page === 'home' ? 'active' : ''
            }`}
            onClick={() => setPage('home')}
          >
            🏠 Home
          </button>

          <button
            className={`nav-item ${
              page === 'ai' ? 'active' : ''
            }`}
            onClick={() => setPage('ai')}
          >
            🧠 Azubi Coach
          </button>

          <button
            className={`nav-item ${
              page === 'subjects' ? 'active' : ''
            }`}
            onClick={openSubjects}
          >
            📚 Subjects
          </button>

          <button
            className={`nav-item ${
              page === 'notes' ? 'active' : ''
            }`}
            onClick={() => setPage('notes')}
          >
            📝 Notes
          </button>

          <button
            className={`nav-item ${
              page === 'flashcards' ? 'active' : ''
            }`}
            onClick={() => setPage('flashcards')}
          >
            🧠 Flashcards
          </button>

          <button
            className={`nav-item ${
              page === 'quizzes' ? 'active' : ''
            }`}
            onClick={() => setPage('quizzes')}
          >
            ❓ Quizzes
          </button>

          <button
            className={`nav-item ${
              page === 'berichtsheft' ? 'active' : ''
            }`}
            onClick={() => setPage('berichtsheft')}
          >
            📋 Training Report
          </button>

          <button
            className={`nav-item ${
              page === 'profile' ? 'active' : ''
            }`}
            onClick={() => setPage('profile')}
          >
            👤 Profile
          </button>

        </nav>

        <button
          className="logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="main-content">

        {/* ================= PROFILE ================= */}

        {page === 'profile' && (
          <ProfilePage />
        )}

        {/* ================= DASHBOARD ================= */}

        {page === 'dashboard' && (
          <DashboardPage setPage={setPage} />
        )}

        {/* ================= HOME ================= */}

        {page === 'home' && (
          <>
            <header className="topbar">

              <div>
                <h1>
                  Good morning, Lina! 👋
                </h1>

                <p>
                  Ready to continue your Ausbildung journey?
                </p>
              </div>

              <div className="profile">

                <div className="avatar">
                  L
                </div>

                <span>
                  Lina
                </span>

              </div>

            </header>

            <section className="welcome-card">

              <div>
                <h2>
                  Keep learning, keep growing 🚀
                </h2>

                <p>
                  Stay organized and make progress every day.
                </p>
              </div>

              <div className="progress">

                <span>
                  Overall Progress
                </span>

                <strong>
                  75%
                </strong>

                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>

              </div>

            </section>

            <h2 className="section-title">
              Quick Access
            </h2>

            <div className="cards">

              <div className="card">

                <div className="card-icon">
                  🧠
                </div>

                <h3>
                  Azubi Coach
                </h3>

                <p>
                  Ask questions and get help with your studies.
                </p>

                <button
                  onClick={() => setPage('ai')}
                >
                  Open Azubi Coach →
                </button>

              </div>

              <div className="card">

                <div className="card-icon">
                  📚
                </div>

                <h3>
                  Subjects
                </h3>

                <p>
                  Manage your subjects and learning materials.
                </p>

                <button onClick={openSubjects}>
                  View Subjects →
                </button>

              </div>

              <div className="card">

                <div className="card-icon">
                  🧠
                </div>

                <h3>
                  Flashcards
                </h3>

                <p>
                  Review important concepts and prepare for exams.
                </p>

                <button
                  onClick={() => setPage('flashcards')}
                >
                  Start Learning →
                </button>

              </div>

            </div>

            <section className="next-section">

              <h2>
                Today's Learning
              </h2>

              <div className="learning-item">

                <div>
                  <strong>
                    German Vocabulary
                  </strong>

                  <p>
                    15 flashcards remaining
                  </p>
                </div>

                <button>
                  Continue
                </button>

              </div>

              <div className="learning-item">

                <div>
                  <strong>
                    Software Engineering
                  </strong>

                  <p>
                    Complete your notes
                  </p>
                </div>

                <button>
                  Continue
                </button>

              </div>

            </section>

          </>
        )}

        {/* ================= AZUBI COACH ================= */}

        {page === 'ai' && (
          <div className="ai-page">

            <div className="ai-header">

              <div>

                <h1>
                  🧠 Azubi Coach
                </h1>

                <p>
                  Your personal learning companion for Ausbildung.
                </p>

              </div>

              <button
                className="clear-chat"
                onClick={() => setMessages([])}
              >
                🗑 Clear Chat
              </button>

            </div>

            <div className="chat-container">

              {messages.length === 0 && (
                <div className="empty-chat">

                  <div className="ai-big-icon">
                    🧠
                  </div>

                  <h2>
                    How can I help you today?
                  </h2>

                  <p>
                    Ask me about your subjects,
                    explain a concept, or prepare
                    for your exams.
                  </p>

                  <div className="suggestions">

                    <button
                      onClick={() =>
                        setQuestion(
                          'Explain software engineering in simple terms'
                        )
                      }
                    >
                      💻 Explain Software Engineering
                    </button>

                    <button
                      onClick={() =>
                        setQuestion(
                          'Help me prepare for my exam'
                        )
                      }
                    >
                      📚 Help me prepare for an exam
                    </button>

                    <button
                      onClick={() =>
                        setQuestion(
                          'Explain this concept in simple terms'
                        )
                      }
                    >
                      💡 Explain a concept
                    </button>

                  </div>

                </div>
              )}

              <div className="messages">

                {messages.map((message, index) => (

                  <div
                    key={index}
                    className={`message ${
                      message.role === 'user'
                        ? 'user-message'
                        : 'ai-message'
                    }`}
                  >

                    <div className="message-avatar">
                      {message.role === 'user'
                        ? 'L'
                        : '🧠'}
                    </div>

                    <div className="message-content">

                      <strong>
                        {message.role === 'user'
                          ? 'You'
                          : 'Azubi Coach'}
                      </strong>

                      <div className="message-content-text">

                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>

                      </div>

                    </div>

                  </div>

                ))}

                {aiLoading && (
                  <div className="message ai-message">

                    <div className="message-avatar">
                      🧠
                    </div>

                    <div className="message-content">

                      <strong>
                        Azubi Coach
                      </strong>

                      <p className="typing">
                        Thinking...
                      </p>

                    </div>

                  </div>
                )}

              </div>

            </div>

            <div className="chat-input-area">

              <textarea
                placeholder="Ask Azubi Coach anything..."
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={(e) => {

                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey
                  ) {
                    e.preventDefault()
                    askAI()
                  }

                }}
              />

              <button
                className="ask-button"
                onClick={askAI}
                disabled={
                  aiLoading ||
                  !question.trim()
                }
              >
                {aiLoading ? '...' : 'Send ↑'}
              </button>

            </div>

          </div>
        )}

        {/* ================= SUBJECTS ================= */}

        {page === 'subjects' && (
          <div className="subjects-page">

            <div className="page-header">

              <div>

                <h1>
                  📚 My Subjects
                </h1>

                <p>
                  Manage your Ausbildung subjects
                  and learning materials.
                </p>

              </div>

            </div>

            {subjectsLoading && (
              <div className="loading-box">
                Loading your subjects...
              </div>
            )}

            {subjectsError && (
              <div className="error-box">
                ❌ {subjectsError}
              </div>
            )}

            {!subjectsLoading &&
              !subjectsError && (
                <div className="subjects-grid">

                  {subjects.length === 0 ? (

                    <div className="empty-box">

                      <div>
                        📚
                      </div>

                      <h2>
                        No subjects yet
                      </h2>

                      <p>
                        Your subjects will appear here.
                      </p>

                    </div>

                  ) : (

                    subjects.map((subject) => (

                      <div
                        className="subject-card"
                        key={subject.subject_id}
                      >

                        <div className="subject-icon">
                          📖
                        </div>

                        <h2>
                          {subject.subject_name}
                        </h2>

                        <p>
                          {subject.description ||
                            'No description available.'}
                        </p>

                        <div className="subject-info">

                          <span>
                            🎓 Year {subject.year}
                          </span>

                        </div>

                        <button>
                          Open Subject →
                        </button>

                      </div>

                    ))

                  )}

                </div>
              )}

          </div>
        )}

        {/* ================= NOTES ================= */}

        {page === 'notes' && (
          <NotesPage />
        )}

        {/* ================= FLASHCARDS ================= */}

        {page === 'flashcards' && (
          <FlashcardsPage />
        )}

        {/* ================= QUIZZES ================= */}

        {page === 'quizzes' && (
          <QuizPage />
        )}

        {/* ================= TRAINING REPORT ================= */}

        {page === 'berichtsheft' && (
          <BerichtsheftPage />
        )}

      </main>

    </div>
  )
}

export default App
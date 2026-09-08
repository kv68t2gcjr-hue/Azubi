import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function DashboardPage({ setPage }) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('Please login first.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load dashboard'
        )
      }

      setDashboard(data)

    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          Loading your dashboard...
        </div>
      </div>
    )
  }


  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          ❌ {error}
        </div>
      </div>
    )
  }


  return (
    <div className="dashboard-page">

      {/* =========================
          WELCOME
      ========================= */}

      <div className="dashboard-header">

        <div>
          <h1>
            Welcome back, {dashboard.user.first_name} 👋
          </h1>

          <p>
            Keep learning and stay on track with your Ausbildung.
          </p>
        </div>

      </div>


      {/* =========================
          STATISTICS
      ========================= */}

      <div className="dashboard-stats">

        <StatCard
          icon="📝"
          title="Quizzes"
          value={dashboard.statistics.quizzes}
        />

        <StatCard
          icon="🧠"
          title="Flashcards"
          value={dashboard.statistics.flashcards}
        />

        <StatCard
          icon="📚"
          title="Notebooks"
          value={dashboard.statistics.notebooks}
        />

        <StatCard
          icon="📄"
          title="Notes"
          value={dashboard.statistics.notes}
        />

        <StatCard
          icon="📋"
          title="Training Reports"
          value={dashboard.statistics.training_reports}
        />

      </div>


      {/* =========================
          MAIN GRID
      ========================= */}

      <div className="dashboard-main-grid">


        {/* =========================
            AUSBILDUNG
        ========================= */}

        <div className="dashboard-card ausbildung-card">

          <div className="dashboard-card-header">

            <div>
              <h2>🎓 Ausbildung Overview</h2>
              <p>Your current training information</p>
            </div>

          </div>


          <div className="ausbildung-info-grid">

            <InfoItem
              icon="💻"
              label="Profession"
              value={
                dashboard.ausbildung.profession_name ||
                'Not provided'
              }
            />

            <InfoItem
              icon="🏢"
              label="Company"
              value={
                dashboard.ausbildung.company_name ||
                'Not provided'
              }
            />

            <InfoItem
              icon="🎓"
              label="School"
              value={
                dashboard.ausbildung.school_name ||
                'Not provided'
              }
            />

            <InfoItem
              icon="📚"
              label="Training Year"
              value={
                dashboard.ausbildung.training_year
                  ? `Year ${dashboard.ausbildung.training_year}`
                  : 'Not provided'
              }
            />

            <InfoItem
              icon="📍"
              label="Bundesland"
              value={
                dashboard.ausbildung.bundesland ||
                'Not provided'
              }
            />

          </div>

        </div>


        {/* =========================
            PROGRESS
        ========================= */}

        <div className="dashboard-card progress-card">

          <div className="dashboard-card-header">

            <div>
              <h2>📅 Ausbildung Progress</h2>
              <p>Keep moving forward!</p>
            </div>

          </div>


          <div className="progress-percentage">

            <strong>
              {dashboard.progress.percentage}%
            </strong>

            <span>completed</span>

          </div>


          <div className="progress-bar">

            <div
              className="progress-bar-fill"
              style={{
                width: `${dashboard.progress.percentage}%`
              }}
            />

          </div>


          <div className="progress-details">

            <span>
              📅 Started:{' '}
              {dashboard.ausbildung.start_date ||
                'Not provided'}
            </span>

            <span>
              🏁 Ends:{' '}
              {dashboard.ausbildung.expected_end_date ||
                'Not provided'}
            </span>

          </div>


          <div className="days-remaining">

            ⏳{' '}

            {dashboard.progress.days_remaining !== null
              ? `${dashboard.progress.days_remaining} days remaining`
              : 'Training dates not provided'}

          </div>

        </div>

      </div>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div className="dashboard-card quick-actions-card">

        <div className="dashboard-card-header">

          <div>
            <h2>⚡ Quick Actions</h2>
            <p>Jump straight into your learning</p>
          </div>

        </div>


        <div className="quick-actions">

          <button
            className="quick-action"
            onClick={() => setPage('notes')}
          >
            <span>📝</span>
            <strong>New Note</strong>
          </button>


          <button
            className="quick-action"
            onClick={() => setPage('flashcards')}
          >
            <span>🧠</span>
            <strong>New Flashcard</strong>
          </button>


          <button
            className="quick-action"
            onClick={() => setPage('quizzes')}
          >
            <span>🎯</span>
            <strong>Take Quiz</strong>
          </button>


          <button
            className="quick-action"
            onClick={() => setPage('ai')}
          >
            <span>🤖</span>
            <strong>Ask AI Tutor</strong>
          </button>


          <button
            className="quick-action"
            onClick={() => setPage('berichtsheft')}
          >
            <span>📋</span>
            <strong>Training Report</strong>
          </button>


          <button
            className="quick-action"
            onClick={() => setPage('subjects')}
          >
            <span>📚</span>
            <strong>Subjects</strong>
          </button>

        </div>

      </div>


      {/* =========================
          RECENT ACTIVITY
      ========================= */}

      <div className="dashboard-card">

        <div className="dashboard-card-header">

          <div>
            <h2>🕐 Recent Activity</h2>
            <p>Your latest learning content</p>
          </div>

        </div>


        <div className="recent-activity">


          {/* NOTES */}

          {dashboard.recent_activity.notes.length > 0 && (

            <div className="activity-section">

              <h3>📝 Recent Notes</h3>

              {dashboard.recent_activity.notes.map(
                (note) => (

                  <div
                    className="activity-item"
                    key={note.note_id}
                  >

                    <div className="activity-icon">
                      📝
                    </div>

                    <div>
                      <strong>
                        {note.title}
                      </strong>

                      <span>
                        {note.created_at
                          ? new Date(
                              note.created_at
                            ).toLocaleDateString()
                          : ''}
                      </span>
                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* FLASHCARDS */}

          {dashboard.recent_activity.flashcards.length > 0 && (

            <div className="activity-section">

              <h3>🧠 Recent Flashcards</h3>

              {dashboard.recent_activity.flashcards.map(
                (card) => (

                  <div
                    className="activity-item"
                    key={card.flashcard_id}
                  >

                    <div className="activity-icon">
                      🧠
                    </div>

                    <div>
                      <strong>
                        {card.question}
                      </strong>

                      <span>
                        Flashcard
                      </span>
                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* QUIZZES */}

          {dashboard.recent_activity.quizzes.length > 0 && (

            <div className="activity-section">

              <h3>🎯 Recent Quizzes</h3>

              {dashboard.recent_activity.quizzes.map(
                (quiz) => (

                  <div
                    className="activity-item"
                    key={quiz.quiz_id}
                  >

                    <div className="activity-icon">
                      🎯
                    </div>

                    <div>
                      <strong>
                        {quiz.title}
                      </strong>

                      <span>
                        {quiz.created_at
                          ? new Date(
                              quiz.created_at
                            ).toLocaleDateString()
                          : ''}
                      </span>
                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* EMPTY */}

          {dashboard.recent_activity.notes.length === 0 &&
            dashboard.recent_activity.flashcards.length === 0 &&
            dashboard.recent_activity.quizzes.length === 0 && (

              <div className="empty-activity">

                <div>📚</div>

                <h3>
                  Your learning journey starts here!
                </h3>

                <p>
                  Create your first note, flashcard,
                  or quiz to see your activity here.
                </p>

              </div>

            )}

        </div>

      </div>


      {/* =========================
          MOTIVATION
      ========================= */}

      <div className="dashboard-learning">

        <div>

          <h2>
            Keep going, {dashboard.user.first_name}! 🚀
          </h2>

          <p>
            Every note, flashcard, and quiz brings you
            one step closer to mastering your Ausbildung.
          </p>

        </div>

      </div>

    </div>
  )
}


/* =========================
   STAT CARD
========================= */

function StatCard({ icon, title, value }) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  )
}


/* =========================
   INFO ITEM
========================= */

function InfoItem({ icon, label, value }) {

  return (
    <div className="info-item">

      <div className="info-item-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  )
}


export default DashboardPage
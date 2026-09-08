import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setError('Please login first.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load profile'
        )
      }

      setProfile(data)

      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        language: data.language || '',
        country: data.country || '',
        bundesland: data.bundesland || '',
        profession_id: data.profession_id || '',
        company_id: data.company_id || '',
        school_id: data.school_id || '',
        training_year: data.training_year || '',
        start_date: data.start_date || '',
        expected_end_date: data.expected_end_date || '',
        password: '',
      })
    } catch (err) {
      console.error('Profile error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    const token = localStorage.getItem('access_token')

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const dataToSend = {
        ...formData,
        profession_id: formData.profession_id
          ? Number(formData.profession_id)
          : null,
        company_id: formData.company_id
          ? Number(formData.company_id)
          : null,
        school_id: formData.school_id
          ? Number(formData.school_id)
          : null,
        training_year: formData.training_year
          ? Number(formData.training_year)
          : null,
      }

      if (!dataToSend.password) {
        delete dataToSend.password
      }

      const response = await fetch(
        `${API_URL}/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to update profile'
        )
      }

      setSuccess('Profile updated successfully! 🎉')
      setEditing(false)

      await fetchProfile()
    } catch (err) {
      console.error('Update profile error:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setError('')
    setSuccess('')

    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      language: profile.language || '',
      country: profile.country || '',
      bundesland: profile.bundesland || '',
      profession_id: profile.profession_id || '',
      company_id: profile.company_id || '',
      school_id: profile.school_id || '',
      training_year: profile.training_year || '',
      start_date: profile.start_date || '',
      expected_end_date: profile.expected_end_date || '',
      password: '',
    })
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading your profile...
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          ❌ {error}
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">

      {/* Header */}

      <div className="profile-page-header">
        <div>
          <h1>👤 My Profile</h1>
          <p>
            Manage your personal and Ausbildung information.
          </p>
        </div>

        {!editing && (
          <button
            className="profile-edit-button"
            onClick={() => {
              setEditing(true)
              setSuccess('')
              setError('')
            }}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>


      {/* Success Message */}

      {success && (
        <div className="profile-success">
          ✅ {success}
        </div>
      )}


      {/* Error Message */}

      {error && (
        <div className="profile-error">
          ❌ {error}
        </div>
      )}


      {/* User Header Card */}

      <div className="profile-user-card">

        <div className="profile-avatar">
          {profile.first_name
            ? profile.first_name.charAt(0).toUpperCase()
            : 'U'}
        </div>

        <div className="profile-user-info">
          <h2>
            {profile.first_name} {profile.last_name}
          </h2>

          <p>
            ✉️ {profile.email}
          </p>

          <span className="profile-badge">
            🎓 Ausbildung Student
          </span>
        </div>

      </div>


      {/* Personal Information */}

      <div className="profile-section">

        <div className="profile-section-title">
          <span>👤</span>

          <div>
            <h2>Personal Information</h2>
            <p>Your basic personal details</p>
          </div>
        </div>

        <div className="profile-grid">

          <ProfileInput
            label="First Name"
            name="first_name"
            value={formData.first_name}
            editing={editing}
            onChange={handleChange}
          />

          <ProfileInput
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            editing={editing}
            onChange={handleChange}
          />

          <ProfileInput
            label="Email"
            name="email"
            value={formData.email}
            editing={editing}
            onChange={handleChange}
          />

          <ProfileInput
            label="Language"
            name="language"
            value={formData.language}
            editing={editing}
            onChange={handleChange}
          />

          <ProfileInput
            label="Country"
            name="country"
            value={formData.country}
            editing={editing}
            onChange={handleChange}
          />

          <ProfileInput
            label="Bundesland"
            name="bundesland"
            value={formData.bundesland}
            editing={editing}
            onChange={handleChange}
          />

        </div>
      </div>


      {/* Ausbildung Information */}

      <div className="profile-section">

        <div className="profile-section-title">
          <span>🎓</span>

          <div>
            <h2>Ausbildung Information</h2>
            <p>Your education and training details</p>
          </div>
        </div>

        <div className="profile-grid">

          <ProfileInput
            label="Profession ID"
            name="profession_id"
            value={formData.profession_id}
            editing={editing}
            onChange={handleChange}
            type="number"
            display={`💻 ${profile.profession_name || 'Not provided'}`}
          />

          <ProfileInput
            label="Company ID"
            name="company_id"
            value={formData.company_id}
            editing={editing}
            onChange={handleChange}
            type="number"
            display={`🏢 ${profile.company_name || 'Not provided'}`}
          />

          <ProfileInput
            label="School ID"
            name="school_id"
            value={formData.school_id}
            editing={editing}
            onChange={handleChange}
            type="number"
            display={`🎓 ${profile.school_name || 'Not provided'}`}
          />

          <ProfileInput
            label="Training Year"
            name="training_year"
            value={formData.training_year}
            editing={editing}
            onChange={handleChange}
            type="number"
            display={`📚 Year ${profile.training_year || '-'}`}
          />

          <ProfileInput
            label="Start Date"
            name="start_date"
            value={formData.start_date}
            editing={editing}
            onChange={handleChange}
            type="date"
          />

          <ProfileInput
            label="Expected End Date"
            name="expected_end_date"
            value={formData.expected_end_date}
            editing={editing}
            onChange={handleChange}
            type="date"
          />

        </div>
      </div>


      {/* Password */}

      {editing && (
        <div className="profile-section">

          <div className="profile-section-title">
            <span>🔐</span>

            <div>
              <h2>Security</h2>
              <p>Change your password if needed</p>
            </div>
          </div>

          <div className="profile-password-field">

            <label>New Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave empty to keep current password"
            />

          </div>

        </div>
      )}


      {/* Save / Cancel */}

      {editing && (
        <div className="profile-actions">

          <button
            className="profile-cancel-button"
            onClick={handleCancel}
            disabled={saving}
          >
            ❌ Cancel
          </button>

          <button
            className="profile-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : '💾 Save Changes'}
          </button>

        </div>
      )}

    </div>
  )
}


function ProfileInput({
  label,
  name,
  value,
  editing,
  onChange,
  type = 'text',
  display,
}) {
  return (
    <div className="profile-field">

      <span>{label}</span>

      {editing ? (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="profile-input"
        />
      ) : (
        <strong>
          {display || value || 'Not provided'}
        </strong>
      )}

    </div>
  )
}


export default ProfilePage
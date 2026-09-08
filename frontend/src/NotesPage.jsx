import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function NotesPage() {
  const [notebooks, setNotebooks] = useState([])
  const [notes, setNotes] = useState([])

  const [selectedNotebook, setSelectedNotebook] = useState(null)

  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(false)

  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [showNotebookForm, setShowNotebookForm] = useState(false)

  const [notebookTitle, setNotebookTitle] = useState('')
  const [notebookCreating, setNotebookCreating] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [editingNote, setEditingNote] = useState(null)

  // ================= ATTACHMENTS =================

  const [attachments, setAttachments] = useState({})
  const [uploadingNote, setUploadingNote] = useState(null)

  const token = localStorage.getItem('access_token')


  // ================= LOAD NOTEBOOKS =================

  useEffect(() => {
    loadNotebooks()
  }, [])


  const loadNotebooks = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/notebooks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load notebooks'
        )
      }

      setNotebooks(data)

      if (data.length > 0) {
        setSelectedNotebook(data[0].notebook_id)
        loadNotes()
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  // ================= LOAD NOTES =================

  const loadNotes = async () => {
    setNotesLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load notes'
        )
      }

      setNotes(data)

      // Load attachments for every note
      await loadAllAttachments(data)

    } catch (err) {
      setError(err.message)
    } finally {
      setNotesLoading(false)
    }
  }


  // ================= LOAD ALL ATTACHMENTS =================

  const loadAllAttachments = async (notesList) => {

    try {

      const attachmentResults = await Promise.all(
        notesList.map(async (note) => {

          const response = await fetch(
            `${API_URL}/notes/${note.note_id}/attachments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (!response.ok) {
            return {
              noteId: note.note_id,
              data: [],
            }
          }

          const data = await response.json()

          return {
            noteId: note.note_id,
            data,
          }

        })
      )

      const attachmentMap = {}

      attachmentResults.forEach((item) => {
        attachmentMap[item.noteId] = item.data
      })

      setAttachments(attachmentMap)

    } catch (err) {
      console.error(
        'Failed to load attachments:',
        err
      )
    }
  }


  // ================= LOAD NOTE ATTACHMENTS =================

  const loadAttachments = async (noteId) => {

    try {

      const response = await fetch(
        `${API_URL}/notes/${noteId}/attachments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()

      setAttachments((prev) => ({
        ...prev,
        [noteId]: data,
      }))

    } catch (err) {
      console.error(
        'Failed to load attachments:',
        err
      )
    }
  }


  // ================= UPLOAD ATTACHMENT =================

  const uploadAttachment = async (noteId, file) => {

    if (!file) return

    setUploadingNote(noteId)
    setError('')

    try {

      const formData = new FormData()

      formData.append('file', file)

      const response = await fetch(
        `${API_URL}/notes/${noteId}/attachments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to upload file'
        )
      }

      setAttachments((prev) => ({
        ...prev,
        [noteId]: [
          ...(prev[noteId] || []),
          data,
        ],
      }))

    } catch (err) {

      setError(err.message)

    } finally {
      setUploadingNote(null)
    }
  }


  // ================= DELETE ATTACHMENT =================

  const deleteAttachment = async (
    attachmentId,
    noteId
  ) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this file?'
    )

    if (!confirmed) return

    try {

      const response = await fetch(
        `${API_URL}/attachments/${attachmentId}`,
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
          data.detail || 'Failed to delete attachment'
        )
      }

      setAttachments((prev) => ({
        ...prev,
        [noteId]: (prev[noteId] || []).filter(
          (file) =>
            file.attachment_id !== attachmentId
        ),
      }))

    } catch (err) {
      setError(err.message)
    }
  }


  // ================= CREATE NOTEBOOK =================

  const createNotebook = async (e) => {
    e.preventDefault()

    if (!notebookTitle.trim()) return

    setNotebookCreating(true)
    setError('')

    try {

      const response = await fetch(
        `${API_URL}/notebooks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: notebookTitle.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to create notebook'
        )
      }

      setNotebooks((prev) => [
        ...prev,
        data,
      ])

      setSelectedNotebook(data.notebook_id)

      setNotebookTitle('')
      setShowNotebookForm(false)

    } catch (err) {

      setError(err.message)

    } finally {
      setNotebookCreating(false)
    }
  }


  // ================= CREATE NOTE =================

  const createNote = async (e) => {
    e.preventDefault()

    if (!selectedNotebook) {
      setError(
        'Please select a notebook first.'
      )
      return
    }

    try {

      const response = await fetch(
        `${API_URL}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notebook_id: selectedNotebook,
            title: title,
            content: content,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to create note'
        )
      }

      setNotes((prev) => [
        ...prev,
        data,
      ])

      setAttachments((prev) => ({
        ...prev,
        [data.note_id]: [],
      }))

      setTitle('')
      setContent('')
      setShowForm(false)

    } catch (err) {

      setError(err.message)

    }
  }


  // ================= UPDATE NOTE =================

  const updateNote = async (e) => {
    e.preventDefault()

    try {

      const response = await fetch(
        `${API_URL}/notes/${editingNote.note_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notebook_id: editingNote.notebook_id,
            title: title,
            content: content,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to update note'
        )
      }

      setNotes((prev) =>
        prev.map((note) =>
          note.note_id === data.note_id
            ? data
            : note
        )
      )

      setEditingNote(null)
      setTitle('')
      setContent('')
      setShowForm(false)

    } catch (err) {

      setError(err.message)

    }
  }


  // ================= DELETE NOTE =================

  const deleteNote = async (noteId) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmed) return

    try {

      const response = await fetch(
        `${API_URL}/notes/${noteId}`,
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
          data.detail || 'Failed to delete note'
        )
      }

      setNotes((prev) =>
        prev.filter(
          (note) =>
            note.note_id !== noteId
        )
      )

      setAttachments((prev) => {

        const updated = {
          ...prev,
        }

        delete updated[noteId]

        return updated
      })

    } catch (err) {

      setError(err.message)

    }
  }


  // ================= EDIT =================

  const startEditing = (note) => {

    setEditingNote(note)

    setTitle(note.title)

    setContent(
      note.content || ''
    )

    setShowForm(true)
  }


  // ================= SELECT NOTEBOOK =================

  const handleNotebookChange = (id) => {
    setSelectedNotebook(Number(id))
  }


  // ================= FILTER NOTES =================

  const filteredNotes = notes.filter(
    (note) =>
      note.notebook_id === selectedNotebook
  )


  // ================= LOADING =================

  if (loading) {

    return (
      <div className="notes-page">

        <div className="page-header">

          <h1>
            📝 Notes
          </h1>

          <p>
            Loading your notebooks...
          </p>

        </div>

        <div className="loading-box">
          Loading...
        </div>

      </div>
    )
  }


  // ================= UI =================

  return (
    <div className="notes-page">

      {/* HEADER */}

      <div className="page-header notes-header">

        <div>

          <h1>
            📝 My Notes
          </h1>

          <p>
            Write, organize, and manage your study notes.
          </p>

        </div>

        <div className="notes-header-buttons">

          <button
            className="new-notebook-button"
            onClick={() =>
              setShowNotebookForm(true)
            }
          >
            📓 New Notebook
          </button>

          <button
            className="new-note-button"
            onClick={() => {

              setEditingNote(null)
              setTitle('')
              setContent('')
              setShowForm(true)

            }}
            disabled={notebooks.length === 0}
          >
            + New Note
          </button>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="error-box">

          ❌ {error}

          <button
            onClick={() => setError('')}
            style={{
              marginLeft: '10px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

        </div>

      )}


      {/* ================= NEW NOTEBOOK FORM ================= */}

      {showNotebookForm && (

        <div className="note-form-card">

          <div className="form-header">

            <h2>
              📓 Create New Notebook
            </h2>

            <button
              className="close-form"
              onClick={() => {

                setShowNotebookForm(false)
                setNotebookTitle('')

              }}
            >
              ✕
            </button>

          </div>

          <form onSubmit={createNotebook}>

            <label>
              Notebook Name
            </label>

            <input
              type="text"
              placeholder="e.g. Software Engineering"
              value={notebookTitle}
              onChange={(e) =>
                setNotebookTitle(e.target.value)
              }
              required
            />

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => {

                  setShowNotebookForm(false)
                  setNotebookTitle('')

                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={notebookCreating}
              >
                {notebookCreating
                  ? 'Creating...'
                  : 'Create Notebook'}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* ================= NO NOTEBOOK ================= */}

      {notebooks.length === 0 ? (

        <div className="empty-box">

          <div className="empty-icon">
            📓
          </div>

          <h2>
            No notebooks yet
          </h2>

          <p>
            Create a notebook first to start writing notes.
          </p>

        </div>

      ) : (

        <>

          {/* ================= NOTEBOOK SELECTOR ================= */}

          <div className="notebook-section">

            <label>
              Notebook
            </label>

            <select
              value={selectedNotebook || ''}
              onChange={(e) =>
                handleNotebookChange(
                  e.target.value
                )
              }
            >

              {notebooks.map((notebook) => (

                <option
                  key={notebook.notebook_id}
                  value={notebook.notebook_id}
                >
                  {notebook.title}
                </option>

              ))}

            </select>

          </div>


          {/* ================= NOTE FORM ================= */}

          {showForm && (

            <div className="note-form-card">

              <div className="form-header">

                <h2>

                  {editingNote
                    ? '✏️ Edit Note'
                    : '✨ Create New Note'}

                </h2>

                <button
                  className="close-form"
                  onClick={() => {

                    setShowForm(false)
                    setEditingNote(null)
                    setTitle('')
                    setContent('')

                  }}
                >
                  ✕
                </button>

              </div>

              <form
                onSubmit={
                  editingNote
                    ? updateNote
                    : createNote
                }
              >

                <label>
                  Title
                </label>

                <input
                  type="text"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                />

                <label>
                  Content
                </label>

                <textarea
                  className="note-content-input"
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  rows="8"
                />

                <div className="form-actions">

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {

                      setShowForm(false)
                      setEditingNote(null)
                      setTitle('')
                      setContent('')

                    }}
                  >
                    Cancel
                  </button>

                  <button type="submit">

                    {editingNote
                      ? 'Save Changes'
                      : 'Create Note'}

                  </button>

                </div>

              </form>

            </div>

          )}


          {/* ================= NOTES ================= */}

          {notesLoading ? (

            <div className="loading-box">
              Loading notes...
            </div>

          ) : filteredNotes.length === 0 ? (

            <div className="empty-box">

              <div className="empty-icon">
                📝
              </div>

              <h2>
                No notes in this notebook
              </h2>

              <p>
                Start by creating your first note.
              </p>

              <button
                onClick={() => {

                  setEditingNote(null)
                  setTitle('')
                  setContent('')
                  setShowForm(true)

                }}
              >
                + Create Note
              </button>

            </div>

          ) : (

            <div className="notes-grid">

              {filteredNotes.map((note) => {

                const noteAttachments =
                  attachments[note.note_id] || []

                return (

                  <div
                    className="note-card"
                    key={note.note_id}
                  >

                    {/* NOTE TOP */}

                    <div className="note-card-top">

                      <div className="note-icon">
                        📝
                      </div>

                      <div className="note-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            startEditing(note)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteNote(
                              note.note_id
                            )
                          }
                        >
                          🗑
                        </button>

                      </div>

                    </div>


                    {/* NOTE CONTENT */}

                    <h2>
                      {note.title}
                    </h2>

                    <p>
                      {note.content ||
                        'No content available.'}
                    </p>


                    {/* DATE */}

                    <div className="note-footer">

                      🗓{' '}

                      {note.updated_at
                        ? new Date(
                            note.updated_at
                          ).toLocaleDateString()
                        : note.created_at
                          ? new Date(
                              note.created_at
                            ).toLocaleDateString()
                          : ''}

                    </div>


                    {/* ================= ATTACHMENTS ================= */}

                    <div
                      className="attachments-section"
                      style={{
                        marginTop: '18px',
                        paddingTop: '15px',
                        borderTop:
                          '1px solid #eee',
                      }}
                    >

                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center',
                          marginBottom: '10px',
                        }}
                      >

                        <strong>
                          📎 Attachments
                        </strong>

                        <label
                          style={{
                            cursor: 'pointer',
                            padding:
                              '6px 10px',
                            borderRadius:
                              '8px',
                            border:
                              '1px solid #ddd',
                            fontSize:
                              '13px',
                            background:
                              '#fff',
                          }}
                        >

                          {uploadingNote ===
                          note.note_id
                            ? 'Uploading...'
                            : '＋ Upload File'}

                          <input
                            type="file"
                            style={{
                              display: 'none',
                            }}
                            disabled={
                              uploadingNote ===
                              note.note_id
                            }
                            onChange={(e) => {

                              const file =
                                e.target.files?.[0]

                              if (file) {
                                uploadAttachment(
                                  note.note_id,
                                  file
                                )
                              }

                              e.target.value = ''

                            }}
                          />

                        </label>

                      </div>


                      {/* FILE LIST */}

                      {noteAttachments.length ===
                      0 ? (

                        <p
                          style={{
                            fontSize: '13px',
                            color: '#888',
                            margin: '5px 0',
                          }}
                        >
                          No files attached yet.
                        </p>

                      ) : (

                        <div>

                          {noteAttachments.map(
                            (attachment) => (

                              <div
                                key={
                                  attachment.attachment_id
                                }
                                style={{
                                  display: 'flex',
                                  alignItems:
                                    'center',
                                  justifyContent:
                                    'space-between',
                                  gap: '8px',
                                  padding:
                                    '7px 0',
                                }}
                              >

                                <a
                                  href={`${API_URL}${attachment.file_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    textDecoration:
                                      'none',
                                    fontSize:
                                      '13px',
                                    overflow:
                                      'hidden',
                                    textOverflow:
                                      'ellipsis',
                                    whiteSpace:
                                      'nowrap',
                                  }}
                                >
                                  📄{' '}
                                  {attachment.file_name}
                                </a>

                                <button
                                  onClick={() =>
                                    deleteAttachment(
                                      attachment.attachment_id,
                                      note.note_id
                                    )
                                  }
                                  style={{
                                    border: 'none',
                                    background:
                                      'transparent',
                                    cursor:
                                      'pointer',
                                    fontSize:
                                      '14px',
                                  }}
                                  title="Delete file"
                                >
                                  🗑
                                </button>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                )
              })}

            </div>

          )}

        </>

      )}

    </div>
  )
}

export default NotesPage
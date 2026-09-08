import { useEffect, useState } from "react";

function BerichtsheftPage() {
  const [berichtshefte, setBerichtshefte] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [entries, setEntries] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingDate, setSavingDate] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  // =========================
  // LOAD REPORTS
  // =========================

  const loadBerichtshefte = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/berichtsheft",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load reports.");
      }

      const data = await response.json();
      setBerichtshefte(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBerichtshefte();
  }, []);

  // =========================
  // CREATE REPORT
  // =========================

  const createBerichtsheft = async () => {
    if (!startDate || !endDate) {
      setError("Please select a start date and an end date.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/berichtsheft",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not create the report.");
      }

      const data = await response.json();

      setStartDate("");
      setEndDate("");

      await loadBerichtshefte();
      openReport(data.berichtsheft_id);
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // OPEN REPORT
  // =========================

  const openReport = async (id) => {
    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/berichtsheft/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load the report.");
      }

      const data = await response.json();

      setSelectedReport(data.berichtsheft);
      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // GET DATES
  // =========================

  const getDatesBetween = (start, end) => {
    const dates = [];

    const current = new Date(`${start}T00:00:00`);
    const last = new Date(`${end}T00:00:00`);

    while (current <= last) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");

      dates.push(`${year}-${month}-${day}`);

      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // =========================
  // DAY NAME
  // =========================

  const getDayName = (date) => {
    const day = new Date(`${date}T00:00:00`).getDay();

    const names = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return names[day];
  };

  // =========================
  // SAVE ENTRY
  // =========================

  const saveEntry = async (date) => {
    const activityElement = document.getElementById(
      `activity-${date}`
    );

    const typeElement = document.getElementById(
      `type-${date}`
    );

    const activity = activityElement?.value || "";
    const dayType = typeElement?.value || "Betrieb";

    try {
      setSavingDate(date);
      setError("");

      const existingEntry = entries.find(
        (entry) => entry.entry_date === date
      );

      let response;

      if (existingEntry) {
        response = await fetch(
          `http://127.0.0.1:8000/berichtsheft/entries/${existingEntry.entry_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              entry_date: date,
              day_type: dayType,
              activity: activity,
            }),
          }
        );
      } else {
        response = await fetch(
          `http://127.0.0.1:8000/berichtsheft/${selectedReport.berichtsheft_id}/entries`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              entry_date: date,
              day_type: dayType,
              activity: activity,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error("Could not save the entry.");
      }

      await openReport(selectedReport.berichtsheft_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDate(null);
    }
  };

  // =========================
  // DELETE ENTRY
  // =========================

  const deleteEntry = async (entryId) => {
    const confirmed = window.confirm(
      "Do you really want to delete this entry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/berichtsheft/entries/${entryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete the entry.");
      }

      await openReport(selectedReport.berichtsheft_id);
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // DELETE REPORT
  // =========================

  const deleteReport = async () => {
    const confirmed = window.confirm(
      "Do you really want to delete this report?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/berichtsheft/${selectedReport.berichtsheft_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete the report.");
      }

      setSelectedReport(null);
      setEntries([]);

      await loadBerichtshefte();
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // REPORT DETAILS
  // =========================

  if (selectedReport) {
    const dates = getDatesBetween(
      selectedReport.start_date,
      selectedReport.end_date
    );

    return (
      <div className="berichtsheft-page">
        <button
          onClick={() => {
            setSelectedReport(null);
            setEntries([]);
          }}
        >
          ← Back
        </button>

        <h1>📋 Training Report</h1>

        <p>
          <strong>Period:</strong>{" "}
          {selectedReport.start_date} →{" "}
          {selectedReport.end_date}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {selectedReport.status}
        </p>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <hr />

        <h2>Daily Activities</h2>

        {dates.map((date) => {
          const entry = entries.find(
            (item) => item.entry_date === date
          );

          return (
            <div
              key={date}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
              }}
            >
              <h3>
                {getDayName(date)} — {date}
              </h3>

              <label>
                <strong>Day Type</strong>
              </label>

              <br />

              <select
                id={`type-${date}`}
                defaultValue={entry?.day_type || "Betrieb"}
                style={{
                  marginTop: "5px",
                  marginBottom: "15px",
                  padding: "8px",
                }}
              >
                <option value="Betrieb">
                  🏢 Company
                </option>

                <option value="Schule">
                  🏫 Vocational School
                </option>

                <option value="Urlaub">
                  🏖️ Vacation
                </option>

                <option value="Krank">
                  🤒 Sick
                </option>

                <option value="Abwesend">
                  ❌ Absent
                </option>

                <option value="Sonstiges">
                  📌 Other
                </option>
              </select>

              <br />

              <label>
                <strong>Activity</strong>
              </label>

              <br />

              <textarea
                id={`activity-${date}`}
                defaultValue={entry?.activity || ""}
                placeholder="Describe what you did today..."
                rows="4"
                style={{
                  width: "100%",
                  marginTop: "5px",
                  marginBottom: "10px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
              />

              <br />

              <button
                onClick={() => saveEntry(date)}
                disabled={savingDate === date}
              >
                {savingDate === date
                  ? "Saving..."
                  : entry
                  ? "Save Changes"
                  : "Save"}
              </button>

              {entry && (
                <button
                  onClick={() => deleteEntry(entry.entry_id)}
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}

        <hr />

        <button onClick={deleteReport}>
          🗑️ Delete Training Report
        </button>
      </div>
    );
  }

  // =========================
  // REPORT LIST
  // =========================

  return (
    <div className="berichtsheft-page">
      <h1>📋 Training Report</h1>

      <p>
        Create and manage your weekly training reports.
      </p>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        <h2>
          Create New Training Report
        </h2>

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            <strong>Start Date</strong>
          </label>

          <br />

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />
        </div>

        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <label>
            <strong>End Date</strong>
          </label>

          <br />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />
        </div>

        <button onClick={createBerichtsheft}>
          Create Training Report
        </button>
      </div>

      <h2>
        My Training Reports
      </h2>

      {loading && (
        <p>Loading...</p>
      )}

      {!loading &&
        berichtshefte.length === 0 && (
          <p>
            No Training Reports yet.
          </p>
        )}

      {!loading &&
        berichtshefte.length > 0 && (
          <div>
            {berichtshefte.map((report) => (
              <div
                key={report.berichtsheft_id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              >
                <h3>
                  {report.start_date} →{" "}
                  {report.end_date}
                </h3>

                <p>
                  Status: {report.status}
                </p>

                <button
                  onClick={() =>
                    openReport(
                      report.berichtsheft_id
                    )
                  }
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default BerichtsheftPage;
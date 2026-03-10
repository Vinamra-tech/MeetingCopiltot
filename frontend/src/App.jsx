import { useState, useEffect } from "react";
import axios from "axios";

// Make sure this matches your Spring Boot port!
const SPRING_API = "https://meetingcopiltot.onrender.com/api/meetings"; 

function App() {
  const [view, setView] = useState("new"); // "new" or "history"
  const [title, setTitle] = useState("Q1 Sync");
  const [transcript, setTranscript] = useState("");
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch past meetings from Spring Boot Postgres DB
  const fetchHistory = async () => {
    try {
      const res = await axios.get(SPRING_API);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
      setError("Could not load past meetings. Is Spring Boot running?");
    }
  };

  // Trigger history fetch when user switches to the History tab
  useEffect(() => {
    if (view === "history") {
      fetchHistory();
    }
  }, [view]);

  const analyzeMeeting = async () => {
    if (!transcript) {
      setError("Please paste a transcript first.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post(
        `${SPRING_API}/process?title=${encodeURIComponent(title)}`, 
        transcript, 
        { headers: { 'Content-Type': 'text/plain' } }
      );
      setCurrentResult(res.data);
      setTranscript(""); // Clear input after success
    } catch (err) {
      console.error(err);
      setError("Backend failed. Check Spring Boot console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "900px", margin: "0 auto", color: "#e0e0e0" }}>
      
      {/* Header & Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ margin: 0 }}>🧠 AI Meeting Co-Pilot</h1>
        <div>
          <button 
            onClick={() => setView("new")} 
            style={{ marginRight: "10px", backgroundColor: view === "new" ? "#646cff" : "#333" }}
          >
            ➕ New Meeting
          </button>
          <button 
            onClick={() => setView("history")}
            style={{ backgroundColor: view === "history" ? "#646cff" : "#333" }}
          >
            📚 History
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div style={{ backgroundColor: "#ff4a4a", color: "white", padding: "10px", borderRadius: "5px", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* VIEW 1: NEW MEETING */}
      {view === "new" && (
        <div>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Meeting Title" 
            style={{ padding: "12px", width: "100%", marginBottom: "15px", fontSize: "16px", borderRadius: "6px", border: "none", backgroundColor: "#2d2d2d", color: "white" }}
          />
          <textarea
            rows="8"
            style={{ width: "100%", padding: "12px", fontSize: "14px", borderRadius: "6px", border: "none", backgroundColor: "#2d2d2d", color: "white", marginBottom: "15px" }}
            placeholder="Paste meeting transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <button 
            onClick={analyzeMeeting} 
            disabled={loading} 
            style={{ width: "100%", padding: "15px", fontSize: "16px", backgroundColor: loading ? "#555" : "#10a37f" }}
          >
            {loading ? "⏳ Spring Boot & AI are processing..." : "✨ Analyze Transcript"}
          </button>

          {/* Render Result immediately after analysis */}
          {currentResult && <MeetingDetails result={currentResult} />}
        </div>
      )}

      {/* VIEW 2: HISTORY DASHBOARD */}
      {view === "history" && (
        <div>
          <h2>Your Past Meetings</h2>
          {history.length === 0 ? (
            <p style={{ color: "#888" }}>No meetings found in database.</p>
          ) : (
            history.map((meeting) => (
              <div key={meeting.id} style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", marginBottom: "20px", borderLeft: "4px solid #646cff" }}>
                <h3 style={{ marginTop: 0 }}>{meeting.title} <span style={{ fontSize: "12px", color: "#888", fontWeight: "normal" }}> (ID: {meeting.id})</span></h3>
                <MeetingDetails result={meeting} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Extracted the result UI into a reusable component
// Extracted the result UI into an interactive component
function MeetingDetails({ result }) {
  // Store action items in local state so we can toggle them without reloading the page
  const [items, setItems] = useState(result.actionItems || []);

  const toggleStatus = async (itemId, currentStatus) => {
    // Determine the new status
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    // 1. OPTIMISTIC UPDATE: Update the UI instantly so it feels fast
    setItems(items.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));

    // 2. SEND TO SPRING BOOT: Update the actual PostgreSQL database
    try {
      await axios.patch(`http://localhost:8080/api/meetings/action-items/${itemId}/status?status=${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert the UI if the backend fails
      setItems(items.map(item => 
        item.id === itemId ? { ...item, status: currentStatus } : item
      ));
      alert("Failed to save to database. Is Spring Boot running?");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h4 style={{ color: "#a5b4fc", borderBottom: "1px solid #333", paddingBottom: "5px" }}>Executive Summary</h4>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0, color: "#d1d5db" }}>{result.summary}</pre>

      {/* 🚀 NEW: The Flexbox container holding the Title and the CSV Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderBottom: "1px solid #333", paddingBottom: "5px" }}>
        <h4 style={{ color: "#a5b4fc", margin: 0 }}>✅ Action Items</h4>
        
        {/* Only show button if the backend returned CSV data */}
        {result.csvExport && (
          <a 
            href={`http://localhost:8080/api/meetings/${result.id}/download-csv`}
            download
            style={{ 
              backgroundColor: "#10a37f", 
              color: "white", 
              padding: "8px 15px", 
              textDecoration: "none", 
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            📥 Download CSV
          </a>
        )}
      </div>

      <ul style={{ listStyleType: "none", padding: 0, margin: "15px 0 0 0" }}>
        {items.map((a) => (
          <li key={a.id} style={{ 
              backgroundColor: "#2d2d2d", 
              padding: "15px", 
              marginBottom: "10px", 
              borderRadius: "6px", 
              display: "flex", 
              alignItems: "center",
              // Dim the item visually if it's completed
              opacity: a.status === "COMPLETED" ? 0.6 : 1,
              transition: "opacity 0.2s"
            }}>
            
            {/* The Interactive Checkbox */}
            <input 
              type="checkbox" 
              checked={a.status === "COMPLETED"}
              onChange={() => toggleStatus(a.id, a.status)}
              style={{ marginRight: "15px", transform: "scale(1.5)", cursor: "pointer" }} 
            />
            
            <div>
              <strong style={{ 
                textDecoration: a.status === "COMPLETED" ? "line-through" : "none",
                color: a.status === "COMPLETED" ? "#888" : "#fff"
              }}>
                {a.task}
              </strong> <br/>
              <span style={{ color: "#aaa", fontSize: "13px" }}>
                👤 {a.owner} | 📅 {a.deadline} | ⚡ {a.priority}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <h4 style={{ color: "#a5b4fc", borderBottom: "1px solid #333", paddingBottom: "5px", marginTop: "20px" }}>❓ Open Questions</h4>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0, color: "#d1d5db" }}>{result.openQuestions}</pre>

      <h4 style={{ color: "#a5b4fc", borderBottom: "1px solid #333", paddingBottom: "5px", marginTop: "20px" }}>📧 Follow-up Email Draft</h4>
      <div style={{ backgroundColor: "#2a2a2a", padding: "15px", borderRadius: "6px", fontFamily: "monospace", whiteSpace: "pre-wrap", fontSize: "13px", color: "#a5b4fc" }}>
        {result.followupEmail}
      </div>
    </div>
  );
}

export default App;
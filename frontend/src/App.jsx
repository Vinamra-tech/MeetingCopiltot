import { useState, useEffect } from "react";
import axios from "axios";
import MeetingDetails from "./components/MeetingDetails";
import ToastContainer, { toast } from "./components/Toast";
import LiveRecorder from "./components/LiveRecorder";
import FileUploader from "./components/FileUploader";
import SkeletonLoader from "./components/SkeletonLoader";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./App.css";

// Use environment variable for API URL or fallback to localhost
const SPRING_API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/meetings"; 

function App() {
  const [view, setView] = useState("new");  // "new" or "history"
  const [title, setTitle] = useState("Q1 Sync");
  const [transcript, setTranscript] = useState("");
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch past meetings from Spring Boot Postgres DB
  const fetchHistory = async () => {
    try {
      const res = await axios.get(SPRING_API);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
      toast.error("Could not load past meetings. Is Spring Boot running?");
    }
  };

  // Trigger history fetch when user switches to the History tab
  useEffect(() => {
    if (view === "history") {
      fetchHistory();
    }
  }, [view]);

  const analyzeMeeting = async () => {
    if (!transcript.trim()) {
      toast.error("Please provide a transcript (record, upload, or paste).");
      return;
    }
    
    setLoading(true);
    setCurrentResult(null); // Clear previous results while loading
    
    try {
      const res = await axios.post(
        `${SPRING_API}/process?title=${encodeURIComponent(title)}`, 
        transcript, 
        { headers: { 'Content-Type': 'text/plain' } }
      );
      setCurrentResult(res.data);
      setTranscript(""); // Clear input after success
      toast.success("Meeting analyzed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Backend failed. Check Spring Boot console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Header & Navigation */}
      <header className="app-header">
        <h1 className="app-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><path d="M15 13v4"></path><path d="M9 13v4"></path></svg>
          AI Meeting Co-Pilot
        </h1>
        <div className="nav-pills">
          <button 
            className={`nav-button ${view === "new" ? "active" : ""}`}
            onClick={() => setView("new")} 
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Meeting
          </button>
          <button 
            className={`nav-button ${view === "history" ? "active" : ""}`}
            onClick={() => setView("history")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            History
          </button>
        </div>
      </header>

      {/* VIEW 1: NEW MEETING */}
      {view === "new" && (
        <div className="fade-in">
          <div className="input-group">
            <input 
              className="form-input"
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Meeting Title" 
            />
          </div>
          
          <LiveRecorder 
            onTranscriptUpdate={(text) => setTranscript(text)} 
            onStopAndAnalyze={analyzeMeeting}
          />

          <FileUploader onFileLoad={(text) => setTranscript(text)} />
          
          <div className="input-group">
            <textarea
              className="form-textarea"
              placeholder="Or paste meeting transcript here directly..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={analyzeMeeting} 
            disabled={loading} 
          >
            {loading ? (
              <>
                <svg className="loading-indicator" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                Processing Transcript...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Analyze Transcript
              </>
            )}
          </button>

          {/* Show Skeleton Loader instead of "Processing..." text when loading */}
          {loading && <SkeletonLoader />}

          {/* Render Result immediately after analysis */}
          {!loading && currentResult && <MeetingDetails result={currentResult} />}
        </div>
      )}

      {/* VIEW 2: HISTORY DASHBOARD */}
      {view === "history" && (
        <div className="fade-in">
          <AnalyticsDashboard history={history} />
          
          <h2 className="history-title">Your Past Meetings</h2>
          {history.length === 0 ? (
            <div className="history-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1rem", opacity: 0.5 }}><path d="M2 12h20"></path><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path><path d="M4 6h16"></path><path d="M6 2h12"></path></svg>
              <p>No meetings found in database.</p>
            </div>
          ) : (
            history.map((meeting) => (
              <div key={meeting.id} className="meeting-card">
                <h3 className="meeting-card-title">
                  {meeting.title} 
                  <span className="meeting-id">ID: {meeting.id}</span>
                </h3>
                <MeetingDetails result={meeting} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
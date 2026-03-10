import { useState } from "react";
import axios from "axios";

function App() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);

  const analyzeMeeting = async () => {
    try {
      const res = await axios.post("http://localhost:5000/analyze", {
        transcript: transcript,
      });

      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Backend not running yet");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🧠 AI Meeting Co-Pilot</h1>

      <h2>Paste Meeting Transcript</h2>

      <textarea
        rows="10"
        cols="80"
        placeholder="Paste meeting transcript..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />

      <br /><br />

      <button onClick={analyzeMeeting}>Analyze Meeting</button>

      <hr />

      {result && (
        <div>
          <h2>Summary</h2>
          <p>{result.summary}</p>

          <h2>Decisions</h2>
          <ul>
            {result.decisions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>

          <h2>Action Items</h2>
          <ul>
            {result.action_items.map((a, i) => (
              <li key={i}>
                {a.task} — {a.owner} ({a.deadline})
              </li>
            ))}
          </ul>

          <h2>Open Questions</h2>
          <ul>
            {result.open_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
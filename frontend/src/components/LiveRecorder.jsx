import React, { useState, useEffect, useRef } from 'react';
import { toast } from './Toast';
import './LiveRecorder.css';

export default function LiveRecorder({ onTranscriptUpdate, onStopAndAnalyze }) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const recognitionRef = useRef(null);
  
  // Set up the Web Speech API
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support live dictation. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast.custom("Listening... Start speaking now", "success");
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(currentInterim);
      
      if (currentFinal) {
        setFullTranscript(prev => {
          const updated = prev + currentFinal + ' ';
          onTranscriptUpdate(updated);
          return updated;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone permissions.");
      } else {
        toast.error(`Recording error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      // If we stop (or it stops itself) and we had interim text, make it final
      if (interimTranscript) {
        setFullTranscript(prev => {
          const updated = prev + interimTranscript + ' ';
          onTranscriptUpdate(updated);
          return updated;
        });
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptUpdate]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech Recognition is not initialized or supported.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      // Clear previous transcripts on new start
      setFullTranscript('');
      setInterimTranscript('');
      onTranscriptUpdate('');
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
        toast.error("Could not start recording.");
      }
    }
  };

  const handleStopAndAnalyze = () => {
    if (isRecording) {
      recognitionRef.current.stop();
    }
    
    // Slight delay to ensure final transcript chunks are processed
    setTimeout(() => {
      onStopAndAnalyze();
    }, 500);
  };

  return (
    <div className="recorder-container">
      <div className={`recorder-header ${isRecording ? 'recording-active' : ''}`}>
        <button 
          className={`mic-button ${isRecording ? 'pulsing' : ''}`}
          onClick={toggleRecording}
          title={isRecording ? "Stop Recording" : "Start Live Recording"}
        >
          {isRecording ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          )}
        </button>
        <div className="recorder-status">
          {isRecording ? (
             <span className="status-blinker">Listening... Speak clearly.</span>
          ) : (
             <span>Click the microphone to start live transcription</span>
          )}
        </div>
      </div>
      
      {isRecording && (
        <div className="live-transcript-box fade-in">
          <div className="transcript-content">
            <span className="final-text">{fullTranscript}</span>
            <span className="interim-text">{interimTranscript}</span>
          </div>
          
          <button 
            className="btn-analyze-live"
            onClick={handleStopAndAnalyze}
            disabled={!fullTranscript && !interimTranscript}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Stop & Analyze Now
          </button>
        </div>
      )}
    </div>
  );
}

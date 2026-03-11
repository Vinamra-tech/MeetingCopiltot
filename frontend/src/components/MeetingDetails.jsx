import React, { useState } from 'react';
import axios from 'axios';
import { toast } from './Toast';
import './MeetingDetails.css';

export default function MeetingDetails({ result }) {
  // Store action items in local state so we can toggle them without reloading the page
  const [items, setItems] = useState(result.actionItems || []);

  const toggleStatus = async (itemId, currentStatus) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    // Optimistic Update
    setItems(items.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));

    try {
      await axios.patch(`http://localhost:8080/api/meetings/action-items/${itemId}/status?status=${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert if backend fails
      setItems(items.map(item => 
        item.id === itemId ? { ...item, status: currentStatus } : item
      ));
      toast.error("Failed to save to database. Is Spring Boot running?");
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy text.');
    }
  };

  const generateMarkdownActionItems = () => {
    if (!items || items.length === 0) return "No action items.";
    return items.map(item => 
      `- [${item.status === 'COMPLETED' ? 'x' : ' '}] **${item.task}** (Owner: ${item.owner}, Deadline: ${item.deadline}, Priority: ${item.priority})`
    ).join('\n');
  };

  return (
    <div className="md-container fade-in">
      
      {/* Summary Section */}
      <section className="md-section">
        <div className="md-section-header">
          <h4 className="md-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Executive Summary
          </h4>
          <button 
            onClick={() => copyToClipboard(result.summary, 'Summary')}
            className="md-icon-btn" 
            title="Copy Summary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
        <div className="md-card md-summary">
          {result.summary}
        </div>
      </section>

      {/* Action Items Section */}
      <section className="md-section">
        <div className="md-section-header">
          <h4 className="md-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            Action Items
          </h4>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => copyToClipboard(generateMarkdownActionItems(), 'Action Items')}
              className="md-download-btn"
              title="Copy as Markdown"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy Markdown
            </button>

            {result.csvExport && (
              <a 
                href={`http://localhost:8080/api/meetings/${result.id}/download-csv`}
                download
                className="md-download-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export CSV
              </a>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="md-empty">No action items identified.</p>
        ) : (
          <ul className="md-task-list">
            {items.map((a) => (
              <li 
                key={a.id} 
                className={`md-task-item ${a.status === "COMPLETED" ? "completed" : ""}`}
                onClick={() => toggleStatus(a.id, a.status)}
              >
                <div className="md-checkbox">
                  <svg 
                    className={`md-checkmark ${a.status === "COMPLETED" ? "visible" : ""}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                
                <div className="md-task-content">
                  <div className="md-task-title">{a.task}</div>
                  <div className="md-task-meta">
                    <span className="md-badge owner">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {a.owner}
                    </span>
                    <span className="md-badge deadline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {a.deadline}
                    </span>
                    <span className={`md-badge priority priority-${a.priority?.toLowerCase() || 'medium'}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                      {a.priority}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Open Questions */}
      {result.openQuestions && result.openQuestions.trim() && (
        <section className="md-section">
          <div className="md-section-header">
            <h4 className="md-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Open Questions
            </h4>
            <button 
              onClick={() => copyToClipboard(result.openQuestions, 'Questions')}
              className="md-icon-btn" 
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
          <div className="md-card md-questions">
            {result.openQuestions}
          </div>
        </section>
      )}

      {/* Follow-up Email */}
      {result.followupEmail && result.followupEmail.trim() && (
        <section className="md-section">
          <div className="md-section-header">
            <h4 className="md-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Follow-up Email Draft
            </h4>
            <button 
              onClick={() => copyToClipboard(result.followupEmail, 'Email Draft')}
              className="md-icon-btn" 
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
          <div className="md-card md-email">
            {result.followupEmail}
          </div>
        </section>
      )}
    </div>
  );
}

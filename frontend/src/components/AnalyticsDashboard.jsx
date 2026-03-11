import React, { useMemo } from 'react';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard({ history }) {
  // Calculate analytics
  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;

    let totalActionItems = 0;
    let completedActionItems = 0;

    history.forEach(meeting => {
      if (meeting.actionItems) {
        totalActionItems += meeting.actionItems.length;
        completedActionItems += meeting.actionItems.filter(item => item.status === 'COMPLETED').length;
      }
    });

    const completionRate = totalActionItems > 0 
      ? Math.round((completedActionItems / totalActionItems) * 100) 
      : 0;

    return {
      totalMeetings: history.length,
      totalActionItems,
      completedActionItems,
      pendingActionItems: totalActionItems - completedActionItems,
      completionRate
    };
  }, [history]);

  if (!stats) return null;

  // SVG calculations for Doughnut chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.completionRate / 100) * circumference;

  return (
    <div className="analytics-dashboard fade-in">
      
      {/* Chart Section */}
      <div className="analytics-chart-card">
        <h4 className="analytics-title">Task Completion</h4>
        <div className="doughnut-container">
          <svg width="120" height="120" viewBox="0 0 100 100" className="doughnut-svg">
            {/* Background circle */}
            <circle 
              className="doughnut-bg" 
              cx="50" cy="50" r={radius} 
              strokeWidth="8" fill="none" 
            />
            {/* Progress circle */}
            <circle 
              className="doughnut-progress" 
              cx="50" cy="50" r={radius} 
              strokeWidth="8" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="doughnut-label">
            <span className="doughnut-percentage">{stats.completionRate}%</span>
            <span className="doughnut-text">Done</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="analytics-stats-grid">
        <div className="stat-card">
          <div className="stat-icon meetings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalMeetings}</span>
            <span className="stat-label">Total Meetings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingActionItems}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon done">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedActionItems}</span>
            <span className="stat-label">Tasks Completed</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}

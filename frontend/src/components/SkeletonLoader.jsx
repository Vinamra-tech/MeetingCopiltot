import React from 'react';
import './SkeletonLoader.css';

export default function SkeletonLoader() {
  return (
    <div className="skeleton-container fade-in">
      {/* Title block */}
      <div className="skeleton-title"></div>
      
      {/* Mocking the cards shape */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-header">
             <div className="skeleton-icon"></div>
             <div className="skeleton-text skeleton-heading"></div>
          </div>
          <div className="skeleton-body">
            <div className="skeleton-text w-100"></div>
            <div className="skeleton-text w-90"></div>
            <div className="skeleton-text w-80"></div>
            {i === 1 && <div className="skeleton-text w-60"></div>}
          </div>
        </div>
      ))}
    </div>
  );
}

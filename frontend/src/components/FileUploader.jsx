import React, { useState, useRef } from 'react';
import { toast } from './Toast';
import './FileUploader.css';

export default function FileUploader({ onFileLoad }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    // Only accept text files or VTT
    if (!file.type.match('text.*') && !file.name.endsWith('.vtt')) {
      toast.error('Only text files (.txt, .vtt) are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onFileLoad(e.target.result);
      toast.success(`Loaded "${file.name}" successfully!`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className={`file-uploader ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".txt,.vtt,text/plain" 
        style={{ display: 'none' }} 
      />
      <div className="uploader-content">
        <div className="uploader-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        </div>
        <p className="uploader-text">
          <strong>Click to upload</strong> or drag and drop<br/>
          <span className="uploader-subtext">Supports .txt and .vtt transcript files</span>
        </p>
      </div>
    </div>
  );
}

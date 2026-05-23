import React from 'react';
import { useSandboxStore } from '../store';
import { Zap, Code2, Play, GitMerge } from 'lucide-react';
import './Welcome.css';

export default function Welcome() {
  const { openFile, setProjectName } = useSandboxStore();

  return (
    <div className="welcome-wrapper" id="welcome-screen">
      <div className="welcome-content animate-slideUp">
        <div className="welcome-logo">
          <Zap size={48} className="brand-icon" />
        </div>
        
        <h1 className="welcome-title">DevSandbox</h1>
        <p className="welcome-subtitle">Browser-based Developer Assessment IDE</p>

        <div className="welcome-grid">
          <div className="welcome-card" onClick={() => openFile('/src/App.jsx')}>
            <Code2 size={24} className="welcome-card-icon" />
            <h3>Start Coding</h3>
            <p>Open App.jsx and start building the UI</p>
          </div>
          
          <div className="welcome-card" onClick={() => document.getElementById('install-btn')?.click()}>
            <GitMerge size={24} className="welcome-card-icon" />
            <h3>Install Packages</h3>
            <p>Run npm install to setup the environment</p>
          </div>
          
          <div className="welcome-card" onClick={() => document.getElementById('run-btn')?.click()}>
            <Play size={24} className="welcome-card-icon" />
            <h3>Run Project</h3>
            <p>Start the Vite dev server and preview</p>
          </div>
        </div>

        <div className="welcome-footer">
          <p>Powered by WebContainers & Monaco Editor</p>
        </div>
      </div>
    </div>
  );
}

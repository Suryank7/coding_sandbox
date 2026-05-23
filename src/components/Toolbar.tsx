import React from 'react';
import { useSandboxStore } from '../store';
import {
  Play,
  Square,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  RotateCcw,
  Settings,
  Zap,
} from 'lucide-react';
import './Toolbar.css';

interface ToolbarProps {
  onRun: () => void;
  onInstall: () => void;
  isRunning: boolean;
}

export default function Toolbar({ onRun, onInstall, isRunning }: ToolbarProps) {
  const {
    projectName,
    setProjectName,
    sidebarOpen,
    toggleSidebar,
    containerStatus,
  } = useSandboxStore();

  return (
    <header className="toolbar" id="main-toolbar">
      <div className="toolbar-left">
        <button
          className="toolbar-btn icon-btn"
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Hide Explorer' : 'Show Explorer'}
          id="toggle-sidebar-btn"
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        <div className="toolbar-brand">
          <Zap size={18} className="brand-icon" />
          <span className="brand-name">DevSandbox</span>
        </div>

        <div className="toolbar-divider" />

        <input
          className="project-name-input"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          spellCheck={false}
          id="project-name-input"
        />
      </div>

      <div className="toolbar-right">
        <div className="status-indicator">
          <span className={`status-dot status-${containerStatus}`} />
          <span className="status-text">
            {containerStatus === 'idle' && 'Ready to start'}
            {containerStatus === 'booting' && 'Booting...'}
            {containerStatus === 'ready' && 'Container ready'}
            {containerStatus === 'installing' && 'Installing...'}
            {containerStatus === 'running' && 'Running'}
            {containerStatus === 'error' && 'Error'}
          </span>
        </div>

        <div className="toolbar-divider" />

        <button
          className="toolbar-btn action-btn install-btn"
          onClick={onInstall}
          disabled={containerStatus === 'installing'}
          title="Install dependencies"
          id="install-btn"
        >
          <Download size={14} />
          <span>Install</span>
        </button>

        <button
          className={`toolbar-btn action-btn run-btn ${isRunning ? 'running' : ''}`}
          onClick={onRun}
          title={isRunning ? 'Restart' : 'Run Project'}
          id="run-btn"
        >
          {isRunning ? <RotateCcw size={14} /> : <Play size={14} />}
          <span>{isRunning ? 'Restart' : 'Run'}</span>
        </button>
      </div>
    </header>
  );
}

import React from 'react';
import { useSandboxStore } from '../store';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import './StatusBar.css';

export default function StatusBar() {
  const { containerStatus, auditLog } = useSandboxStore();

  const getStatusIcon = () => {
    switch (containerStatus) {
      case 'ready':
      case 'running':
        return <CheckCircle2 size={12} className="status-icon success" />;
      case 'booting':
      case 'installing':
        return <Loader2 size={12} className="status-icon animate-spin" />;
      case 'error':
        return <AlertCircle size={12} className="status-icon error" />;
      default:
        return <div className="status-dot-idle" />;
    }
  };

  const getStatusText = () => {
    switch (containerStatus) {
      case 'ready': return 'Environment Ready';
      case 'running': return 'Server Running';
      case 'booting': return 'Booting Environment...';
      case 'installing': return 'Installing Packages...';
      case 'error': return 'Environment Error';
      default: return 'Environment Idle';
    }
  };

  return (
    <footer className="status-bar" id="status-bar">
      <div className="status-bar-left">
        <div className="status-item">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>
      <div className="status-bar-right">
        <div className="status-item">
          <span>{auditLog.length} Events</span>
        </div>
        <div className="status-item">
          <span>UTF-8</span>
        </div>
        <div className="status-item">
          <span>WebContainers API</span>
        </div>
      </div>
    </footer>
  );
}

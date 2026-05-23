import React from 'react';
import { useSandboxStore } from '../store';
import { Globe, RefreshCw, ExternalLink } from 'lucide-react';
import './Preview.css';

export default function Preview() {
  const { previewUrl, containerStatus } = useSandboxStore();

  return (
    <div className="preview-panel" id="preview-panel">
      <div className="preview-header">
        <div className="preview-header-left">
          <Globe size={13} />
          <span>Preview</span>
        </div>
        {previewUrl && (
          <div className="preview-actions">
            <div className="preview-url-bar">
              <span className="preview-url">{previewUrl}</span>
            </div>
            <button
              className="preview-action-btn"
              onClick={() => {
                const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                if (iframe) iframe.src = previewUrl;
              }}
              title="Refresh"
            >
              <RefreshCw size={12} />
            </button>
            <button
              className="preview-action-btn"
              onClick={() => window.open(previewUrl, '_blank')}
              title="Open in new tab"
            >
              <ExternalLink size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="preview-body">
        {previewUrl ? (
          <iframe
            id="preview-iframe"
            className="preview-iframe"
            src={previewUrl}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        ) : (
          <div className="preview-placeholder">
            <div className="preview-placeholder-content">
              <div className="preview-icon-wrapper">
                <Globe size={32} />
              </div>
              <h3>Live Preview</h3>
              <p>
                {containerStatus === 'idle'
                  ? 'Click "Run" to start the dev server'
                  : containerStatus === 'installing'
                  ? 'Installing dependencies...'
                  : containerStatus === 'booting'
                  ? 'Booting WebContainer...'
                  : containerStatus === 'error'
                  ? 'Failed to start. Check the terminal.'
                  : 'Waiting for server to start...'}
              </p>
              {containerStatus === 'installing' || containerStatus === 'booting' ? (
                <div className="preview-loading-bar">
                  <div className="preview-loading-bar-inner" />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

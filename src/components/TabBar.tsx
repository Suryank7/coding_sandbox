import React from 'react';
import { useSandboxStore } from '../store';
import { X } from 'lucide-react';
import { getFileIcon } from '../types';
import './TabBar.css';

export default function TabBar() {
  const { openTabs, activeTab, setActiveTab, closeTab } = useSandboxStore();

  if (openTabs.length === 0) return null;

  return (
    <div className="tab-bar" id="tab-bar">
      <div className="tab-list">
        {openTabs.map((tab) => (
          <div
            key={tab.path}
            className={`tab ${tab.path === activeTab ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
            onClick={() => setActiveTab(tab.path)}
            title={tab.path}
          >
            <span className="tab-icon">{getFileIcon(tab.name)}</span>
            <span className="tab-name">{tab.name}</span>
            {tab.isDirty && <span className="tab-dirty-dot" />}
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.path);
              }}
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

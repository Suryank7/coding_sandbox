import { create } from 'zustand';
import type { FileNode, OpenTab, WebContainerStatus, AuditEntry } from './types';
import { getLanguageFromFilename } from './types';

/* ===== Default Project Files ===== */

export const DEFAULT_FILES: FileNode[] = [
  {
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    language: 'json',
    content: JSON.stringify(
      {
        name: 'sandbox-project',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'vite --host',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^19.1.0',
          'react-dom': '^19.1.0',
        },
        devDependencies: {
          vite: '^6.3.5',
          '@vitejs/plugin-react': '^4.5.2',
        },
      },
      null,
      2
    ),
  },
  {
    name: 'vite.config.js',
    type: 'file',
    path: '/vite.config.js',
    language: 'javascript',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
  },
  {
    name: 'index.html',
    type: 'file',
    path: '/index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  },
  {
    name: 'src',
    type: 'directory',
    path: '/src',
    children: [
      {
        name: 'main.jsx',
        type: 'file',
        path: '/src/main.jsx',
        language: 'javascript',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        name: 'App.jsx',
        type: 'file',
        path: '/src/App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      color: '#e2e8f0',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '480px',
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          🚀 Sandbox App
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
          Edit <code style={{ color: '#6366f1' }}>src/App.jsx</code> and save to see live changes!
        </p>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 36px',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 24px rgba(99,102,241,0.3)',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Count: {count}
        </button>
      </div>
    </div>
  );
}

export default App;
`,
      },
      {
        name: 'index.css',
        type: 'file',
        path: '/src/index.css',
        language: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}
`,
      },
    ],
  },
];

/* ===== Store Interface ===== */

interface SandboxStore {
  /* — File System — */
  files: FileNode[];
  setFiles: (files: FileNode[]) => void;
  updateFileContent: (path: string, content: string) => void;
  addFile: (parentPath: string, name: string, type: 'file' | 'directory') => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newName: string) => void;

  /* — Tabs — */
  openTabs: OpenTab[];
  activeTab: string | null;
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  markTabDirty: (path: string, dirty: boolean) => void;

  /* — WebContainer — */
  containerStatus: WebContainerStatus;
  setContainerStatus: (status: WebContainerStatus) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  terminalOutput: string[];
  appendTerminalOutput: (line: string) => void;
  clearTerminalOutput: () => void;

  /* — UI State — */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeRightPanel: 'preview' | 'terminal';
  setActiveRightPanel: (panel: 'preview' | 'terminal') => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;

  /* — Audit — */
  auditLog: AuditEntry[];
  addAuditEntry: (entry: AuditEntry) => void;
  clearAuditLog: () => void;

  /* — Project Meta — */
  projectName: string;
  setProjectName: (name: string) => void;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

/* ===== Helper: update file in nested tree ===== */

function updateFileInTree(nodes: FileNode[], path: string, content: string): FileNode[] {
  return nodes.map((node) => {
    if (node.path === path && node.type === 'file') {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateFileInTree(node.children, path, content) };
    }
    return node;
  });
}

function findFile(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFile(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

function addNodeToTree(nodes: FileNode[], parentPath: string, newNode: FileNode): FileNode[] {
  if (parentPath === '/') {
    return [...nodes, newNode];
  }
  return nodes.map((node) => {
    if (node.path === parentPath && node.type === 'directory') {
      return { ...node, children: [...(node.children || []), newNode] };
    }
    if (node.children) {
      return { ...node, children: addNodeToTree(node.children, parentPath, newNode) };
    }
    return node;
  });
}

function removeNodeFromTree(nodes: FileNode[], path: string): FileNode[] {
  return nodes
    .filter((node) => node.path !== path)
    .map((node) => {
      if (node.children) {
        return { ...node, children: removeNodeFromTree(node.children, path) };
      }
      return node;
    });
}

/* ===== Zustand Store ===== */

export const useSandboxStore = create<SandboxStore>((set, get) => ({
  /* — Files — */
  files: DEFAULT_FILES,
  setFiles: (files) => set({ files }),

  updateFileContent: (path, content) => {
    set((state) => ({
      files: updateFileInTree(state.files, path, content),
    }));
    get().markTabDirty(path, true);
    get().addAuditEntry({
      timestamp: Date.now(),
      type: 'file_change',
      path,
      content,
    });
  },

  addFile: (parentPath, name, type) => {
    const fullPath =
      parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    const newNode: FileNode = {
      name,
      type,
      path: fullPath,
      language: type === 'file' ? getLanguageFromFilename(name) : undefined,
      content: type === 'file' ? '' : undefined,
      children: type === 'directory' ? [] : undefined,
    };
    set((state) => ({
      files: addNodeToTree(state.files, parentPath, newNode),
    }));
    if (type === 'file') {
      get().openFile(fullPath);
    }
    get().addAuditEntry({
      timestamp: Date.now(),
      type: 'file_create',
      path: fullPath,
    });
  },

  deleteFile: (path) => {
    set((state) => ({
      files: removeNodeFromTree(state.files, path),
      openTabs: state.openTabs.filter((t) => t.path !== path),
      activeTab:
        state.activeTab === path
          ? state.openTabs.find((t) => t.path !== path)?.path || null
          : state.activeTab,
    }));
    get().addAuditEntry({
      timestamp: Date.now(),
      type: 'file_delete',
      path,
    });
  },

  renameFile: (oldPath, newName) => {
    const file = findFile(get().files, oldPath);
    if (!file) return;
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/')) || '/';
    const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;

    set((state) => {
      const newFiles = removeNodeFromTree(state.files, oldPath);
      const renamedNode: FileNode = {
        ...file,
        name: newName,
        path: newPath,
        language: file.type === 'file' ? getLanguageFromFilename(newName) : undefined,
      };
      return {
        files: addNodeToTree(newFiles, parentPath, renamedNode),
        openTabs: state.openTabs.map((t) =>
          t.path === oldPath ? { ...t, path: newPath, name: newName } : t
        ),
        activeTab: state.activeTab === oldPath ? newPath : state.activeTab,
      };
    });
  },

  /* — Tabs — */
  openTabs: [],
  activeTab: null,

  openFile: (path) => {
    const { openTabs, files } = get();
    const existingTab = openTabs.find((t) => t.path === path);
    if (existingTab) {
      set({ activeTab: path, showWelcome: false });
      return;
    }
    const file = findFile(files, path);
    if (!file || file.type !== 'file') return;
    const newTab: OpenTab = {
      path,
      name: file.name,
      language: getLanguageFromFilename(file.name),
      isDirty: false,
    };
    set({
      openTabs: [...openTabs, newTab],
      activeTab: path,
      showWelcome: false,
    });
  },

  closeTab: (path) => {
    set((state) => {
      const newTabs = state.openTabs.filter((t) => t.path !== path);
      let newActive = state.activeTab;
      if (state.activeTab === path) {
        const idx = state.openTabs.findIndex((t) => t.path === path);
        newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.path || null;
      }
      return {
        openTabs: newTabs,
        activeTab: newActive,
        showWelcome: newTabs.length === 0,
      };
    });
  },

  setActiveTab: (path) => set({ activeTab: path, showWelcome: false }),

  markTabDirty: (path, dirty) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === path ? { ...t, isDirty: dirty } : t
      ),
    }));
  },

  /* — WebContainer — */
  containerStatus: 'idle',
  setContainerStatus: (status) => set({ containerStatus: status }),
  previewUrl: null,
  setPreviewUrl: (url) => set({ previewUrl: url }),
  terminalOutput: [],
  appendTerminalOutput: (line) =>
    set((state) => ({
      terminalOutput: [...state.terminalOutput.slice(-500), line],
    })),
  clearTerminalOutput: () => set({ terminalOutput: [] }),

  /* — UI — */
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeRightPanel: 'terminal',
  setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),
  showWelcome: true,
  setShowWelcome: (show) => set({ showWelcome: show }),

  /* — Audit — */
  auditLog: [],
  addAuditEntry: (entry) => {
    set((state) => ({
      auditLog: [...state.auditLog, entry],
    }));
    
    // Sync to backend if session exists
    const { sessionId } = get();
    if (sessionId) {
      import('./api').then(({ api }) => {
        api.appendAuditLog(sessionId, entry).catch(console.error);
      });
    }
  },
  clearAuditLog: () => set({ auditLog: [] }),

  /* — Project — */
  projectName: 'Untitled Project',
  setProjectName: (name) => set({ projectName: name }),
  projectId: null,
  setProjectId: (id) => set({ projectId: id }),
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
}));

/* ===== Selector helpers ===== */

export const useActiveFileContent = (): string | null => {
  const activeTab = useSandboxStore((s) => s.activeTab);
  const files = useSandboxStore((s) => s.files);
  if (!activeTab) return null;
  const file = findFile(files, activeTab);
  return file?.content ?? null;
};

export { findFile };

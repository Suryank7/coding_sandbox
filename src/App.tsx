import React, { useEffect, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useSandboxStore } from './store';
import { useWebContainer } from './hooks/useWebContainer';
import { useAutoSave } from './hooks/useAutoSave';

import Toolbar from './components/Toolbar';
import FileExplorer from './components/FileExplorer';
import TabBar from './components/TabBar';
import CodeEditor from './components/CodeEditor';
import Terminal from './components/Terminal';
import Preview from './components/Preview';
import StatusBar from './components/StatusBar';
import Welcome from './components/Welcome';

function App() {
  const {
    sidebarOpen,
    activeTab,
    showWelcome,
    updateFileContent,
    containerStatus,
    projectId,
    setProjectId,
    sessionId,
    setSessionId,
    files,
    setFiles
  } = useSandboxStore();

  const {
    boot,
    writeFile,
    installDeps,
    startDevServer,
    runCommand,
  } = useWebContainer();

  // Boot WebContainer and initialize project on mount
  useEffect(() => {
    boot();
    
    // Initialize backend project
    import('./api').then(async ({ api }) => {
      try {
        const res = await api.createProject('Sandbox App', files);
        setProjectId(res.project._id);
        setSessionId(res.sessionId);
        console.log('[API] Project & Session initialized:', res);
      } catch (err) {
        console.error('[API] Failed to initialize project:', err);
      }
    });
  }, [boot, files, setProjectId, setSessionId]);

  // Hook up auto-save logic
  const activeContent = useSandboxStore(
    useCallback(
      (s) => {
        if (!activeTab) return null;
        const findNode = (nodes: any[], p: string): any => {
          for (const n of nodes) {
            if (n.path === p) return n;
            if (n.children) {
              const f = findNode(n.children, p);
              if (f) return f;
            }
          }
          return null;
        };
        const node = findNode(s.files, activeTab);
        return node?.content || null;
      },
      [activeTab]
    )
  );

  const debouncedSave = useAutoSave(
    activeContent,
    activeTab,
    (path, content) => {
      // Sync with MongoDB
      if (projectId) {
        import('./api').then(({ api }) => {
          api.updateFile(projectId, path, content).catch(console.error);
        });
      }
      updateFileContent(path, content);
      console.log(`[AutoSave] Synced ${path} to backend.`);
    },
    (path, content) => {
      // Instantly write to WebContainer FS
      writeFile(path, content);
      updateFileContent(path, content); // Update local store state immediately
    },
    1000 // 1s debounce
  );

  const handleEditorChange = useCallback(
    (path: string, content: string) => {
      debouncedSave(path, content);
    },
    [debouncedSave]
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#08080c] overflow-hidden">
      <Toolbar
        onRun={startDevServer}
        onInstall={installDeps}
        isRunning={containerStatus === 'running'}
      />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" autoSaveId="devsandbox-layout">
          {/* Sidebar Panel */}
          {sidebarOpen && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                <FileExplorer />
              </Panel>
              <PanelResizeHandle className="w-[1px] bg-white/10 hover:bg-[#6366f1] transition-colors" />
            </>
          )}

          {/* Editor Panel */}
          <Panel defaultSize={45} minSize={30}>
            <div className="flex flex-col h-full">
              <TabBar />
              {showWelcome ? (
                <Welcome />
              ) : (
                <CodeEditor onContentChange={handleEditorChange} />
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-[1px] bg-white/10 hover:bg-[#6366f1] transition-colors" />

          {/* Right Split (Preview & Terminal) */}
          <Panel defaultSize={35} minSize={20}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={60} minSize={30}>
                <Preview />
              </Panel>
              <PanelResizeHandle className="h-[1px] bg-white/10 hover:bg-[#6366f1] transition-colors" />
              <Panel defaultSize={40} minSize={20}>
                <Terminal onCommand={runCommand} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <StatusBar />
    </div>
  );
}

export default App;

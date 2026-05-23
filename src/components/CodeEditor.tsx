import React, { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useSandboxStore, useActiveFileContent, findFile } from '../store';
import './CodeEditor.css';

interface CodeEditorProps {
  onContentChange: (path: string, content: string) => void;
}

export default function CodeEditor({ onContentChange }: CodeEditorProps) {
  const activeTab = useSandboxStore((s) => s.activeTab);
  const files = useSandboxStore((s) => s.files);
  const content = useActiveFileContent();

  const file = activeTab ? findFile(files, activeTab) : null;
  const language = file?.language || 'plaintext';

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (activeTab && value !== undefined) {
        onContentChange(activeTab, value);
      }
    },
    [activeTab, onContentChange]
  );

  if (!activeTab || content === null) {
    return null;
  }

  return (
    <div className="code-editor-wrapper" id="code-editor">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          minimap: { enabled: true, scale: 1, maxColumn: 80 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: { top: 12, bottom: 12 },
          wordWrap: 'off',
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          automaticLayout: true,
          suggest: {
            showMethods: true,
            showFunctions: true,
            showVariables: true,
            showColors: true,
          },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
            verticalSliderSize: 6,
          },
        }}
        loading={
          <div className="editor-loading">
            <div className="editor-loading-spinner" />
            <span>Loading editor...</span>
          </div>
        }
      />
    </div>
  );
}

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSandboxStore } from '../store';
import { TerminalSquare, Trash2 } from 'lucide-react';
import './Terminal.css';

interface TerminalProps {
  onCommand: (cmd: string) => void;
}

export default function Terminal({ onCommand }: TerminalProps) {
  const { terminalOutput, clearTerminalOutput } = useSandboxStore();
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = inputValue.trim();
      if (!cmd) return;
      setCommandHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      onCommand(cmd);
      setInputValue('');
    },
    [inputValue, onCommand]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIdx);
      setInputValue(commandHistory[newIdx] || '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIdx = historyIndex + 1;
      if (newIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        setHistoryIndex(newIdx);
        setInputValue(commandHistory[newIdx] || '');
      }
    }
  };

  return (
    <div
      className="terminal-panel"
      id="terminal-panel"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="terminal-header">
        <div className="terminal-header-left">
          <TerminalSquare size={13} />
          <span>Terminal</span>
        </div>
        <button
          className="terminal-clear-btn"
          onClick={(e) => {
            e.stopPropagation();
            clearTerminalOutput();
          }}
          title="Clear terminal"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="terminal-body">
        <div className="terminal-output">
          {terminalOutput.map((line, idx) => (
            <pre key={idx} className="terminal-line" dangerouslySetInnerHTML={{
              __html: line
                .replace(/\x1b\[36m/g, '<span class="t-cyan">')
                .replace(/\x1b\[32m/g, '<span class="t-green">')
                .replace(/\x1b\[31m/g, '<span class="t-red">')
                .replace(/\x1b\[33m/g, '<span class="t-yellow">')
                .replace(/\x1b\[90m/g, '<span class="t-dim">')
                .replace(/\x1b\[0m/g, '</span>')
            }} />
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="terminal-input-row" onSubmit={handleSubmit}>
          <span className="terminal-prompt">$</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}

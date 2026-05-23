import React, { useState, useCallback } from 'react';
import { useSandboxStore } from '../store';
import { getFileIcon } from '../types';
import type { FileNode } from '../types';
import {
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Trash2,
  Pencil,
} from 'lucide-react';
import './FileExplorer.css';

/* ===== Single Tree Node ===== */

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  onSelect: (path: string) => void;
  onDelete: (path: string) => void;
  onRename: (path: string, newName: string) => void;
  onAddFile: (parentPath: string) => void;
  onAddFolder: (parentPath: string) => void;
  activeTab: string | null;
}

function TreeNode({
  node,
  depth,
  onSelect,
  onDelete,
  onRename,
  onAddFile,
  onAddFolder,
  activeTab,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [hovered, setHovered] = useState(false);

  const isActive = activeTab === node.path;
  const isDir = node.type === 'directory';

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      onSelect(node.path);
    }
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRename(node.path, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const sortedChildren = node.children
    ? [...node.children].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
    : [];

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node ${isActive ? 'active' : ''} ${hovered ? 'hovered' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={node.path}
      >
        <span className="tree-chevron">
          {isDir ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </span>

        <span className={`tree-icon ${isDir ? 'dir-icon' : `file-icon-${node.name.split('.').pop()}`}`}>
          {isDir ? (expanded ? '📂' : '📁') : getFileIcon(node.name)}
        </span>

        {isRenaming ? (
          <input
            className="rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="tree-name">{node.name}</span>
        )}

        {hovered && (
          <div className="tree-actions" onClick={(e) => e.stopPropagation()}>
            {isDir && (
              <>
                <button onClick={() => onAddFile(node.path)} title="New file">
                  <FilePlus size={13} />
                </button>
                <button onClick={() => onAddFolder(node.path)} title="New folder">
                  <FolderPlus size={13} />
                </button>
              </>
            )}
            <button
              onClick={() => {
                setRenameValue(node.name);
                setIsRenaming(true);
              }}
              title="Rename"
            >
              <Pencil size={12} />
            </button>
            <button onClick={() => onDelete(node.path)} title="Delete" className="delete-btn">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {isDir && expanded && (
        <div className="tree-children">
          {sortedChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onDelete={onDelete}
              onRename={onRename}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== File Explorer ===== */

export default function FileExplorer() {
  const { files, openFile, deleteFile, renameFile, addFile, activeTab } =
    useSandboxStore();

  const [newFileName, setNewFileName] = useState('');
  const [newFileParent, setNewFileParent] = useState<string | null>(null);
  const [newFileType, setNewFileType] = useState<'file' | 'directory'>('file');

  const handleAddFile = useCallback((parentPath: string) => {
    setNewFileParent(parentPath);
    setNewFileType('file');
    setNewFileName('');
  }, []);

  const handleAddFolder = useCallback((parentPath: string) => {
    setNewFileParent(parentPath);
    setNewFileType('directory');
    setNewFileName('');
  }, []);

  const handleSubmitNew = () => {
    if (newFileName.trim() && newFileParent) {
      addFile(newFileParent, newFileName.trim(), newFileType);
      setNewFileParent(null);
      setNewFileName('');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <aside className="file-explorer" id="file-explorer">
      <div className="explorer-header">
        <span className="explorer-title">EXPLORER</span>
        <div className="explorer-actions">
          <button onClick={() => handleAddFile('/')} title="New file at root">
            <FilePlus size={14} />
          </button>
          <button onClick={() => handleAddFolder('/')} title="New folder at root">
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      <div className="explorer-tree">
        {sortedFiles.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            onSelect={openFile}
            onDelete={deleteFile}
            onRename={renameFile}
            onAddFile={handleAddFile}
            onAddFolder={handleAddFolder}
            activeTab={activeTab}
          />
        ))}
      </div>

      {newFileParent !== null && (
        <div className="new-file-overlay">
          <div className="new-file-dialog animate-slideUp">
            <span className="new-file-label">
              New {newFileType} in {newFileParent === '/' ? 'root' : newFileParent}
            </span>
            <input
              className="new-file-input"
              placeholder={newFileType === 'file' ? 'filename.js' : 'folder-name'}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitNew();
                if (e.key === 'Escape') setNewFileParent(null);
              }}
              autoFocus
            />
            <div className="new-file-actions">
              <button className="nf-cancel" onClick={() => setNewFileParent(null)}>
                Cancel
              </button>
              <button className="nf-create" onClick={handleSubmitNew}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

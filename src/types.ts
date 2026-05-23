/* ===== File System Types ===== */

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  language?: string;
  path: string;
}

export interface OpenTab {
  path: string;
  name: string;
  language: string;
  isDirty: boolean;
}

/* ===== WebContainer Types ===== */

export type WebContainerStatus =
  | 'idle'
  | 'booting'
  | 'ready'
  | 'installing'
  | 'running'
  | 'error';

/* ===== Project Types ===== */

export interface Project {
  _id?: string;
  name: string;
  description: string;
  files: FileNode[];
  createdAt?: string;
  updatedAt?: string;
}

/* ===== Session Audit Types ===== */

export interface AuditEntry {
  timestamp: number;
  type: 'file_change' | 'terminal_command' | 'file_create' | 'file_delete' | 'package_install';
  path?: string;
  content?: string;
  command?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionAudit {
  _id?: string;
  projectId: string;
  candidateId: string;
  entries: AuditEntry[];
  startedAt: string;
  endedAt?: string;
}

/* ===== AI Assessment Types ===== */

export interface AssessmentResult {
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  categories: {
    codeQuality: number;
    stateManagement: number;
    errorHandling: number;
    projectStructure: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  nextBestActions: string[];
  summary: string;
}

/* ===== Utility ===== */

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    svg: 'xml',
    sh: 'shell',
    bash: 'shell',
    py: 'python',
    env: 'plaintext',
    gitignore: 'plaintext',
    txt: 'plaintext',
  };
  return languageMap[ext] || 'plaintext';
}

export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    js: '⬡',
    jsx: '⚛',
    ts: '⬡',
    tsx: '⚛',
    json: '{ }',
    html: '◇',
    css: '◆',
    scss: '◆',
    md: '▤',
    svg: '◈',
    png: '◈',
    jpg: '◈',
    gif: '◈',
    env: '⚙',
    gitignore: '⚙',
    yml: '⚙',
    yaml: '⚙',
  };
  return iconMap[ext] || '▪';
}

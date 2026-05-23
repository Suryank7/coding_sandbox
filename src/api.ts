import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Create a new project & session
  createProject: async (name: string, files: any[]) => {
    const res = await axios.post(`${API_BASE}/projects`, { name, files });
    return res.data;
  },

  // Fetch project state
  getProject: async (projectId: string) => {
    const res = await axios.get(`${API_BASE}/projects/${projectId}`);
    return res.data;
  },

  // Update specific file (Debounced save)
  updateFile: async (projectId: string, path: string, content: string) => {
    const res = await axios.put(`${API_BASE}/projects/${projectId}/files`, { path, content });
    return res.data;
  },

  // Update entire project file tree
  updateProjectTree: async (projectId: string, files: any[]) => {
    const res = await axios.put(`${API_BASE}/projects/${projectId}/tree`, { files });
    return res.data;
  },

  // Append to audit log
  appendAuditLog: async (sessionId: string, entry: any) => {
    const res = await axios.post(`${API_BASE}/sessions/${sessionId}/audit`, entry);
    return res.data;
  },

  // Analyze session
  assessSession: async (sessionId: string) => {
    const res = await axios.post(`${API_BASE}/sessions/${sessionId}/assess`);
    return res.data;
  }
};

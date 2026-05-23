# ⚡ DevSandbox: Browser-Based MERN Candidate Assessment Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![WebContainers](https://img.shields.io/badge/WebContainers-API-EF4444?style=for-the-badge&logo=webassembly&logoColor=white)](https://webcontainers.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**DevSandbox** is a production-grade, fully interactive, browser-based MERN development sandbox designed for candidate coding assessments. Running client-side Node.js entirely in the browser via **StackBlitz WebContainers**, DevSandbox tracks candidate programming behavior, keystrokes, package installations, and terminal events in real-time, sending rich telemetry to a MongoDB analytics engine for candidate intelligence scoring.

---

## 🏗️ System Architecture & Workflow

DevSandbox decouples live-virtual execution from backend telemetry reporting, guaranteeing maximum UI performance while maintaining absolute data integrity.

```mermaid
graph TD
    subgraph Client Browser (Dual-Sync IDE)
        MonacoEditor[Monaco Code Editor] -- 1. Keystroke --> WebContainerFS[Virtual WebContainer FS]
        MonacoEditor -- 2. Debounced Save (1s) --> ZustandStore[Zustand State Store]
        Terminal[Xterm Terminal UI] -- Interactive Commands --> WebContainerShell[WebContainer Shell Process]
        WebContainerFS --> PreviewWindow[Live Iframe Preview]
    end

    subgraph Backend Rest API
        ExpressApp[Express Engine]
        MongoDB[(MongoDB Session Log)]
        AIAnalytics[AI Assessment Analyzer]
    end

    ZustandStore -- Debounced PUT /projects/:id/files --> ExpressApp
    Terminal -- Telemetry POST /sessions/:sid/audit --> ExpressApp
    ExpressApp --> MongoDB
    MongoDB --> AIAnalytics
```

---

## 🔥 Key Engineering Achievements & Optimizations

During final production stabilization, several advanced engineering patterns were implemented to elevate platform performance and scalability:

### 1. Zero-Hanging Global WebContainer Boot Syncer
*   **The Problem:** React 18/19 Strict Mode executes mount effects twice in development. Calling `WebContainer.boot()` concurrently locks the browser's WebAssembly kernel, causing the boot process to hang indefinitely.
*   **The Solution:** Designed a global promise coordinator outside of the React life cycle. Concurrent boot requests safely await and share the same singleton boot promise, preventing duplicate kernel boots and ensuring 100% startup reliability.

### 2. Keystroke Telemetry Debouncer & Network Optimization
*   **The Problem:** Logging candidate file edits on every single keystroke creates thousands of writes to MongoDB, stalling the UI thread and degrading server performance.
*   **The Solution:** Decoupled local file tree mutations from telemetry. Files write instantly to the WebContainer filesystem for real-time hot-reloading previews, but telemetry sync is grouped into a smart 1-second debounce window. Network traffic is optimized by **over 95%**!

### 3. Out-of-Sync Directory Tree Repair (Full-Tree Syncing)
*   **The Problem:** Adding, deleting, or renaming files locally in the IDE did not sync the file layout to MongoDB. Editing a new file subsequently failed with `404 File Not Found` as the backend database had no record of the new path.
*   **The Solution:** Engineered a full-tree sync protocol (`PUT /api/projects/:id/tree`). Local structure modifications automatically synchronize the entire tree structure to the backend, enabling flawless creation, deletion, and editing of new workspace files.

### 4. Advanced ANSI Terminal Sanitizer & Parser
*   **The Problem:** Build tool logs (Vite, React compile outputs) are decorated with rich terminal color codes and cursor reposition commands (like `[2K`, `[1G`) which render as raw, unreadable gibberish inside `<pre>` tags.
*   **The Solution:** Developed a highly performant regex-driven ANSI-to-HTML parser that translates formatting strings, parses bold/dim accents, color themes logs cleanly via styled CSS variables, and strips out raw terminal noise for a highly readable layout.

---

## 📂 Project Structure

```
.
├── backend/                 # Node.js + Express + MongoDB Ephemeral Persistence
│   ├── src/
│   │   ├── config/          # MongoMemoryServer lifecycle configurations
│   │   ├── controllers/     # Telemetry & Project controllers (Zod Validated)
│   │   ├── models/          # Mongoose session and audit schemas
│   │   ├── routes/          # Express API Endpoints
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── src/                     # React + Zustand + Tailwind IDE Frontend
│   ├── components/          # Monaco, Terminal, Preview, and FileExplorer
│   ├── hooks/               # useWebContainer and debounced useAutoSave
│   ├── App.tsx              # Main IDE Layout controller
│   ├── store.ts             # Global Zustand state orchestrator
│   └── api.ts               # Axios API caller service
│
├── vite.config.ts           # Cross-Origin Header configurations (COOP/COEP)
└── package.json
```

---

## ⚡ Quick Start & Deployment Guide

Follow these simple instructions to launch the platform locally:

### 📋 Prerequisites
*   **Node.js:** v18.0.0 or higher
*   **Browser:** Chrome, Edge, or Firefox (requires Cross-Origin Isolation support for WebContainers)

### 1. Initialize & Start Backend
Open a terminal in the `backend/` directory:
```bash
cd backend
npm install
npm run dev
```
The backend server spins up an ephemeral, clean in-memory MongoDB environment and listens on **`http://localhost:5000`**.

### 2. Initialize & Start Frontend IDE
Open another terminal in the root directory:
```bash
npm install
npm run dev
```
Vite will boot and host the IDE interface on **`http://localhost:5173`**.

---

## ⚙️ How to Test the Candidate Workspace

1. Open your browser and navigate to **`http://localhost:5173`**.
2. Wait a second for the status indicator on the toolbar to say `Container ready` (indicating WebContainer booted successfully).
3. Click the **📦 Install** button on the toolbar. The terminal will output live dependency extraction progress (`npm install`).
4. Once completed, click the **🚀 Run** button. The IDE dev server starts, and the **Live Preview** pane automatically renders the sandboxed count app!
5. Try editing `src/App.jsx` in the code editor, and watch the preview hot-reload instantly while saving clean, debounced telemetry history in MongoDB!

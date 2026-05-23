import { useEffect, useRef, useCallback, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { useSandboxStore } from '../store';
import type { FileNode } from '../types';

/**
 * Converts our FileNode[] tree into WebContainer's FileSystemTree format.
 */
function toFileSystemTree(nodes: FileNode[]): Record<string, any> {
  const tree: Record<string, any> = {};
  for (const node of nodes) {
    if (node.type === 'file') {
      tree[node.name] = {
        file: { contents: node.content || '' },
      };
    } else if (node.type === 'directory' && node.children) {
      tree[node.name] = {
        directory: toFileSystemTree(node.children),
      };
    }
  }
  return tree;
}

// Global promise to prevent duplicate concurrent WebContainer boots (e.g. in React Strict Mode)
let globalBootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
  const instanceRef = useRef<WebContainer | null>(null);
  const serverProcessRef = useRef<any>(null);
  const [isBooting, setIsBooting] = useState(false);

  const {
    files,
    setContainerStatus,
    setPreviewUrl,
    appendTerminalOutput,
    clearTerminalOutput,
    addAuditEntry,
  } = useSandboxStore();

  /* — Boot WebContainer — */
  const boot = useCallback(async () => {
    if (instanceRef.current) return instanceRef.current;
    
    if (!globalBootPromise) {
      setIsBooting(true);
      setContainerStatus('booting');
      appendTerminalOutput('\x1b[36m⚡ Booting WebContainer...\x1b[0m');

      globalBootPromise = WebContainer.boot()
        .then(async (instance) => {
          instanceRef.current = instance;

          // Listen for server-ready (dev server URL)
          instance.on('server-ready', (_port: number, url: string) => {
            setPreviewUrl(url);
            setContainerStatus('running');
            appendTerminalOutput(`\x1b[32m✓ Dev server ready at ${url}\x1b[0m`);
          });

          // Mount initial files
          const fsTree = toFileSystemTree(files);
          await instance.mount(fsTree);

          setContainerStatus('ready');
          appendTerminalOutput('\x1b[32m✓ WebContainer ready!\x1b[0m');
          appendTerminalOutput('');
          setIsBooting(false);
          return instance;
        })
        .catch((err) => {
          globalBootPromise = null; // Reset on error to allow retry
          setContainerStatus('error');
          appendTerminalOutput(`\x1b[31m✗ Boot failed: ${err.message}\x1b[0m`);
          appendTerminalOutput('\x1b[33m⚠ WebContainers require Chrome/Edge with cross-origin isolation headers.\x1b[0m');
          setIsBooting(false);
          throw err;
        });
    } else {
      // If a boot is already in progress, await it and capture the reference locally
      try {
        const instance = await globalBootPromise;
        instanceRef.current = instance;
      } catch (err) {
        // Handled in primary promise catcher
      }
    }

    return globalBootPromise;
  }, [files, setContainerStatus, setPreviewUrl, appendTerminalOutput]);

  /* — Write a single file to the container FS — */
  const writeFile = useCallback(async (path: string, content: string) => {
    const instance = instanceRef.current;
    if (!instance) return;
    try {
      // Ensure parent directories exist
      const dir = path.substring(0, path.lastIndexOf('/'));
      if (dir && dir !== '/') {
        await instance.fs.mkdir(dir, { recursive: true });
      }
      await instance.fs.writeFile(path, content);
    } catch (err: any) {
      console.warn('writeFile error:', err.message);
    }
  }, []);

  /* — Run npm install — */
  const installDeps = useCallback(async () => {
    const instance = instanceRef.current || (await boot());
    if (!instance) return;

    setContainerStatus('installing');
    appendTerminalOutput('\x1b[36m📦 Running npm install...\x1b[0m');
    addAuditEntry({ timestamp: Date.now(), type: 'package_install', command: 'npm install' });

    try {
      const installProcess = await instance.spawn('npm', ['install']);

      const reader = installProcess.output.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendTerminalOutput(value);
      }

      const exitCode = await installProcess.exit;
      if (exitCode === 0) {
        appendTerminalOutput('\x1b[32m✓ Dependencies installed successfully!\x1b[0m');
        appendTerminalOutput('');
      } else {
        appendTerminalOutput(`\x1b[31m✗ npm install exited with code ${exitCode}\x1b[0m`);
      }
      setContainerStatus('ready');
    } catch (err: any) {
      appendTerminalOutput(`\x1b[31m✗ Install error: ${err.message}\x1b[0m`);
      setContainerStatus('error');
    }
  }, [boot]);

  /* — Run dev server — */
  const startDevServer = useCallback(async () => {
    const instance = instanceRef.current || (await boot());
    if (!instance) return;

    // Kill previous server
    if (serverProcessRef.current) {
      serverProcessRef.current.kill();
      serverProcessRef.current = null;
    }

    setContainerStatus('running');
    appendTerminalOutput('\x1b[36m🚀 Starting dev server...\x1b[0m');
    addAuditEntry({ timestamp: Date.now(), type: 'terminal_command', command: 'npm run dev' });

    try {
      const serverProcess = await instance.spawn('npm', ['run', 'dev']);
      serverProcessRef.current = serverProcess;

      const reader = serverProcess.output.getReader();
      (async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          appendTerminalOutput(value);
        }
      })();
    } catch (err: any) {
      appendTerminalOutput(`\x1b[31m✗ Server error: ${err.message}\x1b[0m`);
      setContainerStatus('error');
    }
  }, [boot]);

  /* — Run arbitrary shell command — */
  const runCommand = useCallback(async (command: string) => {
    const instance = instanceRef.current || (await boot());
    if (!instance) return;

    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    appendTerminalOutput(`\x1b[90m$ ${command}\x1b[0m`);
    addAuditEntry({ timestamp: Date.now(), type: 'terminal_command', command });

    try {
      const proc = await instance.spawn(cmd, args);

      const reader = proc.output.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendTerminalOutput(value);
      }

      const exitCode = await proc.exit;
      if (exitCode !== 0) {
        appendTerminalOutput(`\x1b[33mProcess exited with code ${exitCode}\x1b[0m`);
      }
    } catch (err: any) {
      appendTerminalOutput(`\x1b[31mError: ${err.message}\x1b[0m`);
    }
  }, [boot]);

  /* — Full pipeline: boot → install → start — */
  const runFullPipeline = useCallback(async () => {
    clearTerminalOutput();
    await boot();
    await installDeps();
    await startDevServer();
  }, [boot, installDeps, startDevServer, clearTerminalOutput]);

  /* — Teardown on unmount — */
  useEffect(() => {
    return () => {
      if (serverProcessRef.current) {
        serverProcessRef.current.kill();
      }
      instanceRef.current?.teardown();
    };
  }, []);

  return {
    instance: instanceRef.current,
    boot,
    writeFile,
    installDeps,
    startDevServer,
    runCommand,
    runFullPipeline,
  };
}

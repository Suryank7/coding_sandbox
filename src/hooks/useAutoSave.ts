import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounced auto-save hook.
 * Calls `onSave` after `delay` ms of inactivity.
 * Also immediately writes to WebContainer FS on every change.
 */
export function useAutoSave(
  content: string | null,
  path: string | null,
  onSave: (path: string, content: string) => void,
  onWriteToContainer: (path: string, content: string) => void,
  delay: number = 1000
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef(content);
  const latestPathRef = useRef(path);

  useEffect(() => {
    latestContentRef.current = content;
    latestPathRef.current = path;
  }, [content, path]);

  const debouncedSave = useCallback(
    (filePath: string, fileContent: string) => {
      // Immediately write to WebContainer
      onWriteToContainer(filePath, fileContent);

      // Debounce the backend save
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        onSave(filePath, fileContent);
      }, delay);
    },
    [onSave, onWriteToContainer, delay]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedSave;
}

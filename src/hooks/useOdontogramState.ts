// src/hooks/useOdontogramState.ts
import { useCallback, useMemo, useRef, useState } from 'react';
import type { Surface } from '@constants/odontogram';

export const useOdontogramState = () => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedSurfaces, setSelectedSurfaces] = useState<Surface[]>([]);
  const undoStack = useRef<any[]>([]);
  const redoStack = useRef<any[]>([]);

  const pushUndo = useCallback((snapshot: any) => {
    undoStack.current.push(snapshot);
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return null;
    redoStack.current.push(prev);
    return prev;
  }, []);

  const redo = useCallback(() => {
    const nxt = redoStack.current.pop();
    if (!nxt) return null;
    undoStack.current.push(nxt);
    return nxt;
  }, []);

  const resetSelection = () => {
    setSelectedTooth(null);
    setSelectedSurfaces([]);
  };

  return {
    selectedTooth,
    setSelectedTooth,
    selectedSurfaces,
    setSelectedSurfaces,
    pushUndo,
    undo,
    redo,
    resetSelection,
  };
};

import { useState, useCallback } from 'react';

export interface BatchSelectState {
  selectedIds: Set<string>;
  isBatchMode: boolean;
  selectedCount: number;
  enterBatchMode: (id: string) => void;
  exitBatchMode: () => void;
  toggleItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export function useBatchSelect(): BatchSelectState {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  const enterBatchMode = useCallback((id: string) => {
    setIsBatchMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const exitBatchMode = useCallback(() => {
    setIsBatchMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) {
          setIsBatchMode(false);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setSelectedIds(new Set(ids));
    setIsBatchMode(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsBatchMode(false);
  }, []);

  return {
    selectedIds,
    isBatchMode,
    selectedCount: selectedIds.size,
    enterBatchMode,
    exitBatchMode,
    toggleItem,
    selectAll,
    clearSelection,
  };
}

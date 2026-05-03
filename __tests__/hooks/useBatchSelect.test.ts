import { renderHook, act } from '@testing-library/react-native';
import { useBatchSelect } from '../../hooks/useBatchSelect';

describe('useBatchSelect', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useBatchSelect());
    expect(result.current.isBatchMode).toBe(false);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedIds).toEqual(new Set());
  });

  describe('enterBatchMode', () => {
    it('sets isBatchMode to true and selects the given id', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      expect(result.current.isBatchMode).toBe(true);
      expect(result.current.selectedCount).toBe(1);
      expect(result.current.selectedIds.has('item-1')).toBe(true);
    });

    it('replaces any previous selection', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      act(() => { result.current.enterBatchMode('item-2'); });
      expect(result.current.isBatchMode).toBe(true);
      expect(result.current.selectedCount).toBe(1);
      expect(result.current.selectedIds.has('item-2')).toBe(true);
      expect(result.current.selectedIds.has('item-1')).toBe(false);
    });
  });

  describe('exitBatchMode', () => {
    it('sets isBatchMode to false and clears selection', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      act(() => { result.current.exitBatchMode(); });
      expect(result.current.isBatchMode).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('toggleItem', () => {
    it('adds an item when not selected', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      act(() => { result.current.toggleItem('item-2'); });
      expect(result.current.selectedIds.has('item-1')).toBe(true);
      expect(result.current.selectedIds.has('item-2')).toBe(true);
      expect(result.current.selectedCount).toBe(2);
    });

    it('removes an item when already selected', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      act(() => { result.current.toggleItem('item-1'); });
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isBatchMode).toBe(false);
    });

    it('exits batch mode when last item is deselected', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      act(() => { result.current.toggleItem('item-1'); });
      expect(result.current.isBatchMode).toBe(false);
    });

    it('does not exit batch mode if other items remain', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      act(() => { result.current.toggleItem('item-2'); });
      act(() => { result.current.toggleItem('item-1'); });
      expect(result.current.isBatchMode).toBe(true);
      expect(result.current.selectedCount).toBe(1);
      expect(result.current.selectedIds.has('item-2')).toBe(true);
    });
  });

  describe('selectAll', () => {
    it('selects all provided ids and enters batch mode', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.selectAll(['item-1', 'item-2', 'item-3']); });
      expect(result.current.isBatchMode).toBe(true);
      expect(result.current.selectedCount).toBe(3);
      expect(result.current.selectedIds.has('item-1')).toBe(true);
      expect(result.current.selectedIds.has('item-2')).toBe(true);
      expect(result.current.selectedIds.has('item-3')).toBe(true);
    });

    it('replaces existing selection', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.enterBatchMode('item-1'); });
      act(() => { result.current.selectAll(['item-2', 'item-3']); });
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.selectedIds.has('item-1')).toBe(false);
    });

    it('does nothing with an empty array', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.selectAll([]); });
      expect(result.current.isBatchMode).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('clearSelection', () => {
    it('clears all selections and exits batch mode', () => {
      const { result } = renderHook(() => useBatchSelect());
      act(() => { result.current.selectAll(['item-1', 'item-2', 'item-3']); });
      act(() => { result.current.clearSelection(); });
      expect(result.current.isBatchMode).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('selectedIds immutability', () => {
    it('returns a new Set on each state change', () => {
      const { result } = renderHook(() => useBatchSelect());
      const before = result.current.selectedIds;
      act(() => { result.current.enterBatchMode('item-1'); });
      expect(result.current.selectedIds).not.toBe(before);
    });
  });
});

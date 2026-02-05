'use client';

import { useState, useCallback } from 'react';

export interface OptimisticAction<T> {
  execute: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  rollback?: () => void;
}

export function useOptimisticUpdate<TState>(initialState: TState) {
  const [state, setState] = useState<TState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async <TResult>(
      optimisticUpdate: Partial<TState>,
      action: OptimisticAction<TResult>
    ): Promise<TResult | null> => {
      const previousState = state;
      setIsLoading(true);
      setError(null);

      try {
        // Apply optimistic update immediately
        setState((prev) => ({ ...prev, ...optimisticUpdate }));

        // Execute the actual action
        const result = await action.execute();

        // Call success callback
        action.onSuccess?.(result);

        return result;
      } catch (err) {
        // Rollback on error
        setState(previousState);

        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);

        // Call error callback
        action.onError?.(error);

        // Call custom rollback if provided
        action.rollback?.();

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [state]
  );

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
    setIsLoading(false);
  }, [initialState]);

  return {
    state,
    setState,
    isLoading,
    error,
    execute,
    reset,
  };
}

// Hook for optimistic like/unlike
export function useOptimisticLike(
  initialLiked: boolean,
  initialCount: number,
  onToggle: (liked: boolean) => Promise<void>
) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggle = async () => {
    if (isUpdating) return;

    const previousLiked = liked;
    const previousCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount((prev) => prev + (liked ? -1 : 1));
    setIsUpdating(true);

    try {
      await onToggle(!liked);
    } catch (error) {
      // Rollback on error
      setLiked(previousLiked);
      setCount(previousCount);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    liked,
    count,
    toggle,
    isUpdating,
  };
}

// Hook for optimistic list operations
export function useOptimisticList<T extends { id: string }>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [pendingItems, setPendingItems] = useState<Set<string>>(new Set());

  const addOptimistic = useCallback(
    async (item: T, saveFn: () => Promise<T>) => {
      // Add to pending
      setPendingItems((prev) => new Set(prev).add(item.id));

      // Optimistically add to list
      setItems((prev) => [item, ...prev]);

      try {
        const saved = await saveFn();

        // Update with actual saved item
        setItems((prev) => prev.map((i) => (i.id === item.id ? saved : i)));
      } catch (error) {
        // Remove on error
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        throw error;
      } finally {
        setPendingItems((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    []
  );

  const removeOptimistic = useCallback(
    async (id: string, deleteFn: () => Promise<void>) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      // Add to pending
      setPendingItems((prev) => new Set(prev).add(id));

      // Optimistically remove from list
      setItems((prev) => prev.filter((i) => i.id !== id));

      try {
        await deleteFn();
      } catch (error) {
        // Restore on error
        setItems((prev) => [item, ...prev]);
        throw error;
      } finally {
        setPendingItems((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items]
  );

  const updateOptimistic = useCallback(
    async (id: string, updates: Partial<T>, updateFn: () => Promise<T>) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      // Add to pending
      setPendingItems((prev) => new Set(prev).add(id));

      // Optimistically update
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));

      try {
        const updated = await updateFn();

        // Update with actual saved item
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      } catch (error) {
        // Restore on error
        setItems((prev) => prev.map((i) => (i.id === id ? item : i)));
        throw error;
      } finally {
        setPendingItems((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items]
  );

  return {
    items,
    pendingItems,
    addOptimistic,
    removeOptimistic,
    updateOptimistic,
  };
}

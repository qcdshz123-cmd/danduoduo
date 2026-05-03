import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';
import type { Order } from '../types/models';

interface UseOrderReturn {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  confirm: () => Promise<void>;
  ship: () => Promise<void>;
  complete: () => Promise<void>;
  cancelAction: (reason?: string) => Promise<void>;
  actionLoading: boolean;
}

export function useOrder(id: string | undefined): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!id) { setOrder(null); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      setError(null);
      setOrder(await orderService.findById(id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载订单失败');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  const doAction = useCallback(async (action: () => Promise<Order>) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await action();
      setOrder(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '操作失败');
      throw e;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const confirm = useCallback(async () => { if (id) await doAction(() => orderService.confirm(id)); }, [id, doAction]);
  const ship = useCallback(async () => { if (id) await doAction(() => orderService.ship(id)); }, [id, doAction]);
  const complete = useCallback(async () => { if (id) await doAction(() => orderService.complete(id)); }, [id, doAction]);
  const cancelAction = useCallback(async (reason?: string) => {
    if (id) await doAction(() => orderService.cancel(id, reason));
  }, [id, doAction]);

  return { order, isLoading, error, refresh, confirm, ship, complete, cancelAction, actionLoading };
}

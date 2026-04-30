import { supabase, currentUser } from '@/api/supabase';
import * as idb from '@/utils/idb';

const TX_STORE = 'transactions';
const QUEUE_STORE = 'queue';

function generateTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function mapAndCacheServerRows(rows: any[]) {
  if (!rows || !rows.length) return [];
  const mapped = rows.map((t: any) => ({
    ...t,
    category: t.category_id,
    expand: { category: Array.isArray(t.categories) ? t.categories[0] ?? null : null },
  }));
  // cache each
  for (const r of mapped) {
    try {
      await idb.put(TX_STORE, r);
    } catch (e) {
      // ignore cache errors
    }
  }
  return mapped;
}

export async function fetchTransactions(userId?: string) {
  // Try network first
  if (navigator.onLine) {
    try {
      let res: any;
      if (userId) {
        res = await supabase
          .from('transactions')
          .select('*, categories(*)')
          .eq('user_id', userId)
          .order('date', { ascending: false });
      } else {
        res = await supabase.from('transactions').select('*, categories(*)').order('date', { ascending: false });
      }
      const { data, error } = res as { data: any[] | null; error: any };
      if (!error && data) {
        return await mapAndCacheServerRows(data);
      }
    } catch (e) {
      // fall through to cached
      console.warn('fetchTransactions network failed, falling back to cache', e);
    }
  }

  // Offline / fallback: return cached transactions (filter by userId if given)
  try {
    const cached = await idb.getAll(TX_STORE);
    const list = (cached ?? []).filter((c: any) => (userId ? c.user_id === userId : true));
    // sort by date desc
    list.sort((a: any, b: any) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
    return list;
  } catch (e) {
    console.warn('Error reading cached transactions', e);
    return [];
  }
}

export async function createTransaction(payload: any) {
  // Ensure user_id
  const userId = payload.user_id ?? currentUser.value?.id ?? null;
  const txPayload = { ...payload, user_id: userId };

  if (navigator.onLine) {
    try {
      const res: any = await supabase.from('transactions').insert([txPayload]).select('*');
      const { data, error } = res as { data: any[] | null; error: any };
      if (error) return { success: false, error };
      const created = data?.[0] ?? null;
      if (created) {
        await idb.put(TX_STORE, {
          ...created,
          category: created.category_id,
          expand: { category: Array.isArray(created.categories) ? created.categories[0] ?? null : null },
        });
      }
      return { success: true, data: created };
    } catch (e) {
      console.warn('Network insert failed, queuing', e);
      // fallthrough to offline
    }
  }

  // Offline: create local temp item and queue it
  try {
    const tempId = generateTempId();
    const localTx = {
      ...txPayload,
      id: tempId,
      pending: true,
      created_at: new Date().toISOString(),
      category: txPayload.category_id ?? txPayload.category,
    };
    await idb.put(TX_STORE, localTx);
    await idb.add(QUEUE_STORE, { type: 'insert', table: 'transactions', payload: txPayload, tempId, createdAt: Date.now() });
    return { success: true, data: localTx, offline: true, queued: true };
  } catch (e) {
    return { success: false, error: e };
  }
}

export async function updateTransaction(id: string, updates: any) {
  // If online try server
  if (navigator.onLine && !id?.toString().startsWith('temp-')) {
    try {
      const res: any = await supabase.from('transactions').update(updates).eq('id', id).select('*');
      const { data, error } = res as { data: any[] | null; error: any };
      if (error) return { success: false, error };
      const updated = data?.[0] ?? null;
      if (updated) {
        await idb.put(TX_STORE, {
          ...updated,
          category: updated.category_id,
          expand: { category: Array.isArray(updated.categories) ? updated.categories[0] ?? null : null },
        });
      }
      return { success: true, data: updated };
    } catch (e) {
      console.warn('Network update failed, queuing', e);
    }
  }

  // Offline: if id is a temp id, merge into pending insert; otherwise queue an update
  try {
    const local = await idb.get(TX_STORE, id);
    const merged = { ...(local ?? {}), ...updates };
    await idb.put(TX_STORE, merged);

    if (id?.toString().startsWith('temp-')) {
      // find the insert op and merge the payload
      const queue = await idb.getAll(QUEUE_STORE);
      const insertOp = (queue ?? []).find((q: any) => q.type === 'insert' && q.tempId === id);
      if (insertOp) {
        insertOp.payload = { ...insertOp.payload, ...updates };
        // replace: delete and re-add to preserve qid simplicity
        await idb.del(QUEUE_STORE, insertOp.qid);
        await idb.add(QUEUE_STORE, insertOp);
        return { success: true, offline: true, queued: true, data: merged };
      }
    }

    // otherwise add an update operation
    await idb.add(QUEUE_STORE, { type: 'update', table: 'transactions', id, payload: updates, createdAt: Date.now() });
    return { success: true, offline: true, queued: true, data: merged };
  } catch (e) {
    return { success: false, error: e };
  }
}

export async function deleteTransaction(id: string) {
  if (navigator.onLine && !id?.toString().startsWith('temp-')) {
    try {
      const res: any = await supabase.from('transactions').delete().eq('id', id);
      const { error } = res as { error: any };
      if (error) return { success: false, error };
      await idb.del(TX_STORE, id);
      return { success: true };
    } catch (e) {
      console.warn('Network delete failed, queuing', e);
    }
  }

  try {
    // If it was a temp-local item, remove local and any pending insert
    if (id?.toString().startsWith('temp-')) {
      const queue = await idb.getAll(QUEUE_STORE);
      const insertOps = (queue ?? []).filter((q: any) => q.type === 'insert' && q.tempId === id);
      for (const op of insertOps) {
        await idb.del(QUEUE_STORE, op.qid);
      }
      await idb.del(TX_STORE, id);
      return { success: true, offline: true };
    }

    // Otherwise queue a delete and remove from local cache for immediate UX
    await idb.add(QUEUE_STORE, { type: 'delete', table: 'transactions', id, createdAt: Date.now() });
    await idb.del(TX_STORE, id);
    return { success: true, offline: true, queued: true };
  } catch (e) {
    return { success: false, error: e };
  }
}

export async function replayQueue() {
  const queue = (await idb.getAll(QUEUE_STORE)) ?? [];
  queue.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
  const tempMap: Record<string, string> = {};

  for (const item of queue) {
    try {
      if (item.type === 'insert') {
        const payload = item.payload;
        const res: any = await supabase.from('transactions').insert([payload]).select('*');
        const { data, error } = res as { data: any[] | null; error: any };
        if (error) {
          console.warn('Insert replay failed', error);
          continue;
        }
        const real = data?.[0] ?? null;
        if (real) {
          // replace temp entry with real one
          if (item.tempId) await idb.del(TX_STORE, item.tempId);
          await idb.put(TX_STORE, {
            ...real,
            category: real.category_id,
            expand: { category: Array.isArray(real.categories) ? real.categories[0] ?? null : null },
          });
          tempMap[item.tempId] = real.id;
          await idb.del(QUEUE_STORE, item.qid);
        }
      } else if (item.type === 'update') {
        let targetId = item.id;
        if (tempMap[targetId]) targetId = tempMap[targetId];
        const res: any = await supabase.from('transactions').update(item.payload).eq('id', targetId).select('*');
        const { data, error } = res as { data: any[] | null; error: any };
        if (error) {
          console.warn('Update replay failed', error);
          continue;
        }
        const updated = data?.[0] ?? null;
        if (updated) {
          await idb.put(TX_STORE, {
            ...updated,
            category: updated.category_id,
            expand: { category: Array.isArray(updated.categories) ? updated.categories[0] ?? null : null },
          });
        }
        await idb.del(QUEUE_STORE, item.qid);
      } else if (item.type === 'delete') {
        let targetId = item.id;
        if (tempMap[targetId]) targetId = tempMap[targetId];
        const res: any = await supabase.from('transactions').delete().eq('id', targetId);
        const { error } = res as { error: any };
        if (error) {
          console.warn('Delete replay failed', error);
          continue;
        }
        await idb.del(TX_STORE, targetId);
        await idb.del(QUEUE_STORE, item.qid);
      }
    } catch (e) {
      console.warn('Error replaying queue item', e);
      continue;
    }
  }

  // notify listeners that replay finished
  try {
    window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: { count: queue.length } }));
  } catch (e) {
    // ignore
  }
}

export function initOfflineSync() {
  // Try replay on init if online
  if (navigator.onLine) {
    replayQueue().catch((e) => console.warn('Initial replay failed', e));
  }
  window.addEventListener('online', () => {
    // small delay to allow connection to stabilise
    setTimeout(() => replayQueue().catch((e) => console.warn('Replay on online failed', e)), 500);
  });
}

export default {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  replayQueue,
  initOfflineSync,
};

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { PendingCreator, Group } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

// ─── Pending creators ─────────────────────────────────────────────────────────

export function usePendingCreators() {
  const [creators, setCreators] = useState<PendingCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PendingCreator[]>('/admin/pending-creators');
      setCreators(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const approve = useCallback(async (creatorId: string) => {
    await api.post(`/admin/creators/${creatorId}/approve`);
    setCreators((prev) => prev.filter((c) => c.id !== creatorId));
  }, []);

  const reject = useCallback(async (creatorId: string) => {
    await api.post(`/admin/creators/${creatorId}/reject`);
    setCreators((prev) => prev.filter((c) => c.id !== creatorId));
  }, []);

  return { creators, loading, error, refetch: fetch, approve, reject };
}

// ─── Pending groups ───────────────────────────────────────────────────────────

export function usePendingGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Group[]>('/admin/pending-groups');
      setGroups(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const approve = useCallback(async (groupId: string) => {
    await api.post(`/admin/groups/${groupId}/approve`);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const reject = useCallback(async (groupId: string) => {
    await api.post(`/admin/groups/${groupId}/reject`);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  return { groups, loading, error, refetch: fetch, approve, reject };
}

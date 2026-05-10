import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Group, GroupSearchParams } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

// ─── Browse / search approved groups ─────────────────────────────────────────

export function useGroups(params?: GroupSearchParams) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Group[]>('/groups', { params });
      setGroups(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, error, refetch: fetchGroups };
}

// ─── Groups I belong to ───────────────────────────────────────────────────────

export function useMyGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Group[]>('/groups/my');
      setGroups(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyGroups();
  }, [fetchMyGroups]);

  return { groups, loading, error, refetch: fetchMyGroups };
}

// ─── Single group ─────────────────────────────────────────────────────────────

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    api
      .get<Group>(`/groups/${groupId}`)
      .then(({ data }) => setGroup(data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { group, loading, error };
}

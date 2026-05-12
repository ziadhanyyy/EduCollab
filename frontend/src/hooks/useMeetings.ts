import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { CreateMeetingRequest, Meeting, UpdateMeetingRequest } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

function toUtcIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function useMeetings(groupId: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Meeting[]>(`/meetings/group/${groupId}`);
      setMeetings(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(async (payload: CreateMeetingRequest): Promise<Meeting> => {
    const { data } = await api.post<Meeting>('/meetings', {
      ...payload,
      scheduledAt: toUtcIso(payload.scheduledAt),
    });
    setMeetings((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(
    async (meetingId: string, payload: UpdateMeetingRequest): Promise<Meeting> => {
      const { data } = await api.put<Meeting>(`/meetings/${meetingId}`, {
        ...payload,
        scheduledAt: toUtcIso(payload.scheduledAt),
      });
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? data : m)));
      return data;
    },
    [],
  );

  const remove = useCallback(async (meetingId: string) => {
    await api.delete(`/meetings/${meetingId}`);
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
  }, []);

  return { meetings, loading, error, refetch: fetch, create, update, remove };
}

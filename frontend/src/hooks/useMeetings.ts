import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Meeting, CreateMeetingRequest, UpdateMeetingRequest } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

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

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (payload: CreateMeetingRequest): Promise<Meeting> => {
    const { data } = await api.post<Meeting>('/meetings', payload);
    setMeetings((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (meetingId: string, payload: UpdateMeetingRequest): Promise<Meeting> => {
    const { data } = await api.put<Meeting>(`/meetings/${meetingId}`, payload);
    setMeetings((prev) => prev.map((m) => (m.id === meetingId ? data : m)));
    return data;
  }, []);

  const remove = useCallback(async (meetingId: string) => {
    await api.delete(`/meetings/${meetingId}`);
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
  }, []);

  return { meetings, loading, error, refetch: fetch, create, update, remove };
}

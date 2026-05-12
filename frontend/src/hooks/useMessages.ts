import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import type { Message } from '@/types';

const PAGE_SIZE = 50;

export function useMessages(groupId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);

  const fetchPage = useCallback(
    async (page: number): Promise<Message[]> => {
      const { data } = await api.get<Message[]>(`/messages/group/${groupId}`, {
        params: { page, pageSize: PAGE_SIZE },
      });
      return data;
    },
    [groupId],
  );

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    fetchPage(1)
      .then((data) => {
        setMessages([...data].reverse());
        setHasMore(data.length === PAGE_SIZE);
        pageRef.current = 1;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchPage, groupId]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const data = await fetchPage(nextPage);
      setMessages((prev) => [...[...data].reverse(), ...prev]);
      setHasMore(data.length === PAGE_SIZE);
      pageRef.current = nextPage;
    } catch (_) {
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage]);

  const send = useCallback(
    async (content: string): Promise<Message> => {
      const { data } = await api.post<Message>('/messages', {
        groupId,
        content,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      return data;
    },
    [groupId],
  );

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  return {
    messages,
    loading,
    hasMore,
    loadingMore,
    loadMore,
    send,
    appendMessage,
  };
}

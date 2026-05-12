import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { StudyMaterial } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

export function useMaterials(groupId: string) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<StudyMaterial[]>(`/material/group/${groupId}`);
      setMaterials(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const upload = useCallback(
    async (groupId: string, file: File, tags: string[]): Promise<StudyMaterial> => {
      const form = new FormData();
      form.append('groupId', groupId);
      form.append('file', file);
      for (const t of tags) form.append('tags', t);
      const { data } = await api.post<StudyMaterial>('/material/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterials((prev) => [data, ...prev]);
      return data;
    },
    [],
  );

  const remove = useCallback(async (materialId: string) => {
    await api.delete(`/material/${materialId}`);
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  }, []);

  const addTag = useCallback(async (materialId: string, tag: string): Promise<StudyMaterial> => {
    const { data } = await api.post<StudyMaterial>(`/material/${materialId}/tags`, tag, {
      headers: { 'Content-Type': 'application/json' },
    });
    setMaterials((prev) => prev.map((m) => (m.id === materialId ? data : m)));
    return data;
  }, []);

  const removeTag = useCallback(async (tagId: string, materialId: string) => {
    const { data } = await api.delete<StudyMaterial>(`/material/tags/${tagId}`);
    setMaterials((prev) => prev.map((m) => (m.id === materialId ? data : m)));
  }, []);

  const searchByTag = useCallback(
    async (tag: string) => {
      if (!tag.trim()) {
        await fetchMaterials();
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<StudyMaterial[]>(`/material/group/${groupId}/search`, {
          params: { tag: tag.trim() },
        });
        setMaterials(data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [groupId, fetchMaterials],
  );

  return {
    materials,
    loading,
    error,
    refetch: fetchMaterials,
    upload,
    remove,
    addTag,
    removeTag,
    searchByTag,
  };
}

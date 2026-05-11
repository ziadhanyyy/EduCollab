import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { TOKEN_KEY } from '@/lib/api';
import type { Message, StudyMaterial } from '@/types';

const HUB_URL = `${(
  import.meta.env.VITE_SIGNALR_BASE_URL ?? 'http://localhost:5184'
).replace(/\/+$/, '')}/hubs/group`;

interface UseGroupHubOptions {
  groupId: string;
  onMessage?: (msg: Message) => void;
  onMaterialUploaded?: (material: StudyMaterial) => void;
}

export function useGroupHub({ groupId, onMessage, onMaterialUploaded }: UseGroupHubOptions) {
  const onMessageRef = useRef(onMessage);
  const onMaterialRef = useRef(onMaterialUploaded);

  useEffect(() => { onMessageRef.current = onMessage; });
  useEffect(() => { onMaterialRef.current = onMaterialUploaded; });

  useEffect(() => {
    if (!groupId) return;

    
    let cancelled = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem(TOKEN_KEY) ?? '',
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (msg: Message) => {
      onMessageRef.current?.(msg);
    });

    connection.on('MaterialUploaded', (material: StudyMaterial) => {
      onMaterialRef.current?.(material);
    });

    connection
      .start()
      .then(() => {
        if (cancelled) {
          connection.stop().catch(() => {});
          return;
        }
        connection.invoke('JoinGroup', groupId).catch((err) =>
          console.warn('[GroupHub] JoinGroup error:', err)
        );
      })
      .catch((err) => {
        if (!cancelled) console.warn('[GroupHub] connection error:', err);
      });

    return () => {
      cancelled = true;
      if (
        connection.state === signalR.HubConnectionState.Connected ||
        connection.state === signalR.HubConnectionState.Reconnecting
      ) {
        connection.stop().catch(() => {});
      }
    };
  }, [groupId]);
}

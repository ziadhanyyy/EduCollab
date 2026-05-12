import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';
import { TOKEN_KEY } from '@/lib/api';
import type { Notification } from '@/types';

const HUB_URL = `${(import.meta.env.VITE_SIGNALR_BASE_URL ?? 'http://localhost:5184').replace(
  /\/+$/,
  '',
)}/hubs/notifications`;

export function useNotificationHub(onNotification?: (n: Notification) => void) {
  const callbackRef = useRef(onNotification);
  useEffect(() => {
    callbackRef.current = onNotification;
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    let cancelled = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem(TOKEN_KEY) ?? '',
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('Notify', (n: Notification) => {
      callbackRef.current?.(n);
    });

    connection
      .start()
      .then(() => {
        if (cancelled) {
          connection.stop().catch(() => {});
        }
      })
      .catch((err) => {
        if (!cancelled) console.warn('[NotificationHub] connection error:', err);
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
  }, []);
}

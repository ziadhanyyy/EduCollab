import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import type { Notification } from '@/types';
import { notificationLink, notificationTypeLabel, timeAgo } from '@/utils/helpers';
import { NotifIcon, NotifIconBg } from '@/utils/notif';

interface Props {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  bellRinging: boolean;
  unreadCount: number;
  notifications: Notification[];
  markAllRead: () => void;
  markOneRead: (id: string) => void;
  dashboardHref: string;
}

export default function NotificationDropdown({
  open,
  onToggle,
  onClose,
  bellRinging,
  unreadCount,
  notifications,
  markAllRead,
  markOneRead,
  dashboardHref,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          onToggle();
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell
          className={`h-4 w-4 transition-colors ${bellRinging ? 'text-primary bell-ring' : ''}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none select-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-40"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-96 rounded-xl border bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-105 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markOneRead(n.id);
                      navigate(notificationLink(n));
                      onClose();
                    }}
                    className={`w-full flex gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                      !n.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${NotifIconBg(n.type)}`}
                    >
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {notificationTypeLabel(n.type)}
                      </p>
                      <p
                        className={`text-sm leading-snug mt-0.5 ${!n.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                      >
                        {n.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </button>
                ))
              )}
            </div>

            {notifications.length > 10 && (
              <>
                <Separator />
                <div className="px-4 py-2.5 bg-muted/20 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(dashboardHref);
                      onClose();
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    View all {notifications.length} notifications →
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { Clock } from 'lucide-react';
import type { Notification } from '@/types';
import { timeAgo } from '@/utils/helpers';

export default function StudentNotificationItem({ notification }: { notification: Notification }) {
  const dotColor = notification.isRead ? 'bg-muted-foreground/40' : 'bg-green-500';

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
      <div className="space-y-0.5">
        <p className="text-sm leading-snug">{notification.message}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}

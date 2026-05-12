import { CalendarDays, Clock, MapPin, Video } from 'lucide-react';
import type { Meeting } from '@/types';
import { formatDateTime, meetingStatusLabel } from '@/utils/helpers';

const statusColors: Record<number, string> = {
  0: 'bg-emerald-100 text-emerald-700',
  1: 'bg-red-100 text-red-600',
  2: 'bg-gray-100 text-gray-500',
};

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight">{meeting.title}</p>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${statusColors[meeting.status]}`}
        >
          {meetingStatusLabel(meeting.status)}
        </span>
      </div>
      {meeting.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{meeting.description}</p>
      )}
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3 shrink-0" />
          {formatDateTime(meeting.scheduledAt)}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 shrink-0" />
          {meeting.durationMinutes} min · {meeting.meetingUrl ? 'Online' : 'Offline'}
        </div>
        {meeting.meetingUrl && (
          <div className="flex items-center gap-1.5">
            <Video className="h-3 w-3 shrink-0" />
            <a
              href={meeting.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              Join link
            </a>
          </div>
        )}
        {meeting.offlineAddress && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{meeting.offlineAddress}</span>
          </div>
        )}
      </div>
    </div>
  );
}

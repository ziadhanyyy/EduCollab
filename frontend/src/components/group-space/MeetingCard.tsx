import { CalendarDays, Clock, Loader2, MapPin, Pencil, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Meeting, MeetingStatus, UpdateMeetingRequest } from '@/types';
import { extractErrorMessage, formatDateTime, meetingStatusLabel } from '@/utils/helpers';

const statusColors: Record<number, string> = {
  0: 'bg-emerald-100 text-emerald-700',
  1: 'bg-red-100 text-red-600',
  2: 'bg-gray-100 text-gray-500',
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  meeting: Meeting;
  isCreator?: boolean;
  onUpdate?: (id: string, payload: UpdateMeetingRequest) => Promise<Meeting>;
  onDelete?: (id: string) => Promise<void>;
}

export default function MeetingCard({ meeting, isCreator, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<UpdateMeetingRequest>({
    title: meeting.title,
    description: meeting.description ?? '',
    scheduledAt: toLocalInput(meeting.scheduledAt),
    durationMinutes: meeting.durationMinutes,
    meetingUrl: meeting.meetingUrl ?? '',
    offlineAddress: meeting.offlineAddress ?? '',
    status: meeting.status,
  });

  const isOnline = meeting.meetingUrl !== null || meeting.offlineAddress === null;

  async function handleSave() {
    if (!form.title || !form.scheduledAt) return;
    setSaving(true);
    try {
      await onUpdate?.(meeting.id, form);
      toast.success('Meeting updated.');
      setEditing(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update meeting.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete?.(meeting.id);
      toast.success('Meeting deleted.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to delete meeting.'));
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Title *</Label>
          <Input
            className="h-8 text-xs"
            value={form.title ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Input
            className="h-8 text-xs"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Date & Time *</Label>
          <Input
            type="datetime-local"
            className="h-8 text-xs"
            value={form.scheduledAt ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Duration (minutes)</Label>
          <Input
            type="number"
            className="h-8 text-xs"
            min={15}
            value={form.durationMinutes ?? 60}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
          />
        </div>
        {isOnline ? (
          <div className="space-y-1.5">
            <Label className="text-xs">Meeting URL</Label>
            <Input
              className="h-8 text-xs"
              placeholder="https://meet.google.com/…"
              value={form.meetingUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input
              className="h-8 text-xs"
              value={form.offlineAddress ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, offlineAddress: e.target.value }))}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <select
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: Number(e.target.value) as MeetingStatus }))
            }
          >
            <option value={0}>Scheduled</option>
            <option value={1}>Cancelled</option>
            <option value={2}>Completed</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={!form.title || !form.scheduledAt || saving}
            onClick={handleSave}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Save
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight">{meeting.title}</p>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[meeting.status]}`}
          >
            {meetingStatusLabel(meeting.status)}
          </span>
          {isCreator && (
            <>
              <button
                type="button"
                title="Edit meeting"
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    title="Delete meeting"
                    disabled={deleting}
                    className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{meeting.title}&quot;? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={handleDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
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

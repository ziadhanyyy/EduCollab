import { CalendarDays, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateMeetingRequest, Meeting, MeetingType, UpdateMeetingRequest } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';
import MeetingCard from './MeetingCard';

interface Props {
  groupId: string;
  meetings: Meeting[];
  loading: boolean;
  meetingType: MeetingType;
  isCreator: boolean;
  createMeeting: (payload: CreateMeetingRequest) => Promise<Meeting>;
  updateMeeting: (id: string, payload: UpdateMeetingRequest) => Promise<Meeting>;
  removeMeeting: (id: string) => Promise<void>;
}

export default function MeetingsTab({
  groupId,
  meetings,
  loading,
  meetingType,
  isCreator,
  createMeeting,
  updateMeeting,
  removeMeeting,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<CreateMeetingRequest>>({
    durationMinutes: 60,
  });
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!form.title || !form.scheduledAt) return;
    setCreating(true);
    try {
      await createMeeting({ ...form, groupId } as CreateMeetingRequest);
      toast.success('Meeting scheduled!');
      setShowForm(false);
      setForm({ durationMinutes: 60 });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create meeting.'));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {isCreator && (
        <div className="px-3 pt-3 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-3.5 w-3.5" />
            {showForm ? 'Cancel' : 'New Meeting'}
          </Button>
        </div>
      )}

      {showForm && isCreator && (
        <div className="mx-3 mt-3 rounded-lg border bg-muted/30 p-3 space-y-3 shrink-0">
          <div className="space-y-1.5">
            <Label className="text-xs">Title *</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Session title"
              value={form.title ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Optional details"
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
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  durationMinutes: Number(e.target.value),
                }))
              }
            />
          </div>
          {meetingType === 0 ? (
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
                placeholder="Room / address"
                value={form.offlineAddress ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, offlineAddress: e.target.value }))}
              />
            </div>
          )}
          <Button
            size="sm"
            className="w-full"
            disabled={!form.title || !form.scheduledAt || creating}
            onClick={handleCreate}
          >
            {creating && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Schedule
          </Button>
        </div>
      )}

      <Separator className="mt-3" />

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 pt-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground space-y-1">
            <CalendarDays className="h-6 w-6 mx-auto opacity-30" />
            <p>No meetings scheduled</p>
          </div>
        ) : (
          meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              isCreator={isCreator}
              onUpdate={updateMeeting}
              onDelete={removeMeeting}
            />
          ))
        )}
      </div>
    </div>
  );
}

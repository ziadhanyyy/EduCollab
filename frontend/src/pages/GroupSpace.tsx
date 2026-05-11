import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Send, Upload, Plus, FileText, Trash2,
  Loader2, Video, MapPin, CalendarDays, Clock, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useGroup } from '@/hooks/useGroups';
import { useMessages } from '@/hooks/useMessages';
import { useGroupHub } from '@/hooks/useGroupHub';
import { useMaterials } from '@/hooks/useMaterials';
import { useMeetings } from '@/hooks/useMeetings';
import {
  extractErrorMessage, formatDateTime, formatBytes,
  meetingStatusLabel,
} from '@/utils/helpers';
import type { Message, StudyMaterial, Meeting, CreateMeetingRequest } from '@/types';

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  const time = new Date(msg.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isMe) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary text-white px-3.5 py-2 text-sm leading-relaxed">
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground">{time}</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <span className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase text-muted-foreground shrink-0 select-none">
        {msg.senderName.charAt(0)}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-muted-foreground ml-1">{msg.senderName}</span>
        <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white border px-3.5 py-2 text-sm leading-relaxed">
          {msg.content}
        </div>
        <span className="text-[10px] text-muted-foreground ml-1">{time}</span>
      </div>
    </div>
  );
}

// ─── Material row ─────────────────────────────────────────────────────────────
function MaterialRow({
  material,
  canDelete,
  onDelete,
}: {
  material: StudyMaterial;
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${material.originalFileName}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(material.id);
      toast.success('File deleted.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Delete failed.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b last:border-0">
      <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <a
          href={material.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium truncate block hover:text-primary transition-colors"
        >
          {material.originalFileName}
        </a>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatBytes(material.fileSizeBytes)} · {material.uploaderName}
        </p>
        {material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {material.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive/70 hover:text-destructive transition-colors shrink-0 mt-0.5"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}

// ─── Meeting card ─────────────────────────────────────────────────────────────
function MeetingCard({ meeting }: { meeting: Meeting }) {
  const statusColors: Record<number, string> = {
    0: 'bg-emerald-100 text-emerald-700',
    1: 'bg-red-100 text-red-600',
    2: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="rounded-lg border bg-white p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight">{meeting.title}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${statusColors[meeting.status]}`}>
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
            <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
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

// ─── GroupSpace ───────────────────────────────────────────────────────────────
export default function GroupSpace() {
  const { id } = useParams<{ id: string }>();
  const { user, isGroupCreator } = useAuth();
  const { group, loading: groupLoading } = useGroup(id ?? '');

  const {
    messages, loading: messagesLoading, hasMore, loadingMore,
    loadMore, send, appendMessage,
  } = useMessages(id ?? '');

  const {
    materials, loading: materialsLoading,
    upload, remove: removeMaterial, refetch: refetchMaterials,
  } = useMaterials(id ?? '');

  const { meetings, loading: meetingsLoading, create: createMeeting } = useMeetings(id ?? '');

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // ── Sidebar state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'materials' | 'meetings'>('materials');

  // ── Upload state ─────────────────────────────────────────────────────────────
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Meeting form state ────────────────────────────────────────────────────────
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState<Partial<CreateMeetingRequest>>({ durationMinutes: 60 });
  const [creatingMeeting, setCreatingMeeting] = useState(false);

  // ── SignalR ──────────────────────────────────────────────────────────────────
  const handleNewMessage = useCallback((msg: Message) => {
    appendMessage(msg);
    // If user is near bottom, scroll
    const el = chatContainerRef.current;
    if (el) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (nearBottom) autoScrollRef.current = true;
    }
  }, [appendMessage]);

  const handleMaterialUploaded = useCallback(() => {
    refetchMaterials();
  }, [refetchMaterials]);

  useGroupHub({
    groupId: id ?? '',
    onMessage: handleNewMessage,
    onMaterialUploaded: handleMaterialUploaded,
  });

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    if (autoScrollRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    if (!messagesLoading) {
      chatEndRef.current?.scrollIntoView();
    }
  }, [messagesLoading]);

  function handleChatScroll() {
    const el = chatContainerRef.current;
    if (!el) return;
    autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSend() {
    const content = messageInput.trim();
    if (!content || sending) return;
    setMessageInput('');
    autoScrollRef.current = true;
    setSending(true);
    try {
      await send(content);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to send message.'));
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  }

  // ── Upload material ───────────────────────────────────────────────────────
  async function handleUpload() {
    if (!uploadFile || !id) return;
    setUploading(true);
    try {
      const tags = uploadTags.split(',').map((t) => t.trim()).filter(Boolean);
      await upload(id, uploadFile, tags);
      toast.success('Material uploaded!');
      setShowUpload(false);
      setUploadFile(null);
      setUploadTags('');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  }

  // ── Create meeting ────────────────────────────────────────────────────────
  async function handleCreateMeeting() {
    if (!id || !meetingForm.title || !meetingForm.scheduledAt) return;
    setCreatingMeeting(true);
    try {
      await createMeeting({ ...meetingForm, groupId: id } as CreateMeetingRequest);
      toast.success('Meeting scheduled!');
      setShowMeetingForm(false);
      setMeetingForm({ durationMinutes: 60 });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create meeting.'));
    } finally {
      setCreatingMeeting(false);
    }
  }

  const isCreator = isGroupCreator && user?.id === group?.creatorId;
  const backHref = isCreator ? '/creator/groups' : '/student/groups';

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (groupLoading) {
    return (
      <div className="-mx-6 -my-6 flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <div className="flex-1 flex flex-col border-r">
          <div className="border-b px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-80 border-l" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Group not found.</p>
      </div>
    );
  }

  return (
    <div
      className="-mx-6 -my-6 flex overflow-hidden bg-background"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* ═══ Left: Chat ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center gap-3 bg-white shrink-0">
          <Link
            to={backHref}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base truncate">{group.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>{group.subject}</span>
              <span>·</span>
              <Users className="h-3 w-3" />
              <span>{group.memberCount} members</span>
            </p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {group.meetingType === 0 ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Messages list */}
        <div
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        >
          {/* Load earlier */}
          {hasMore && (
            <div className="text-center pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                disabled={loadingMore}
                className="text-xs text-muted-foreground"
              >
                {loadingMore ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                Load earlier messages
              </Button>
            </div>
          )}

          {messagesLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'items-end gap-2'}`}>
                  {i % 2 !== 0 && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
                  <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-40' : 'w-52'}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-16">
              <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} isMe={user?.id === msg.senderId} />
            ))
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t px-4 py-3 flex gap-2 bg-white shrink-0">
          <Input
            placeholder="Type a message…"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!messageInput.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ═══ Right: Sidebar ══════════════════════════════════════════════════ */}
      <div className="w-80 border-l flex flex-col shrink-0 bg-white">
        {/* Tab bar */}
        <div className="border-b flex shrink-0">
          {(['materials', 'meetings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Materials tab ─────────────────────────────────────────────── */}
        {activeTab === 'materials' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Upload button */}
            <div className="px-3 pt-3 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => setShowUpload((v) => !v)}
              >
                <Upload className="h-3.5 w-3.5" />
                {showUpload ? 'Cancel Upload' : 'Upload File'}
              </Button>
            </div>

            {/* Upload form */}
            {showUpload && (
              <div className="mx-3 mt-3 rounded-lg border bg-muted/30 p-3 space-y-3 shrink-0">
                <div className="space-y-1.5">
                  <Label className="text-xs">File</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-16 border-2 border-dashed rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    {uploadFile ? uploadFile.name : 'Click to select file'}
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tags (comma-separated)</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="e.g. lecture, week3"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!uploadFile || uploading}
                  onClick={handleUpload}
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Upload
                </Button>
              </div>
            )}

            <Separator className="mt-3" />

            {/* Materials list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {materialsLoading ? (
                <div className="space-y-3 pt-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground space-y-1">
                  <FileText className="h-6 w-6 mx-auto opacity-30" />
                  <p>No materials yet</p>
                </div>
              ) : (
                materials.map((m: StudyMaterial) => (
                  <MaterialRow
                    key={m.id}
                    material={m}
                    canDelete={user?.id === m.uploaderId}
                    onDelete={removeMaterial}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Meetings tab ──────────────────────────────────────────────── */}
        {activeTab === 'meetings' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {isCreator && (
              <div className="px-3 pt-3 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={() => setShowMeetingForm((v) => !v)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showMeetingForm ? 'Cancel' : 'New Meeting'}
                </Button>
              </div>
            )}

            {/* Meeting creation form */}
            {showMeetingForm && isCreator && (
              <div className="mx-3 mt-3 rounded-lg border bg-muted/30 p-3 space-y-3 shrink-0">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title *</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Session title"
                    value={meetingForm.title ?? ''}
                    onChange={(e) => setMeetingForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    className="h-8 text-xs"
                    value={meetingForm.scheduledAt ?? ''}
                    onChange={(e) => setMeetingForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration (minutes)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    min={15}
                    value={meetingForm.durationMinutes ?? 60}
                    onChange={(e) =>
                      setMeetingForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
                    }
                  />
                </div>
                {group.meetingType === 0 ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meeting URL</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="https://meet.google.com/…"
                      value={meetingForm.meetingUrl ?? ''}
                      onChange={(e) => setMeetingForm((f) => ({ ...f, meetingUrl: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Location</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="Room / address"
                      value={meetingForm.offlineAddress ?? ''}
                      onChange={(e) =>
                        setMeetingForm((f) => ({ ...f, offlineAddress: e.target.value }))
                      }
                    />
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!meetingForm.title || !meetingForm.scheduledAt || creatingMeeting}
                  onClick={handleCreateMeeting}
                >
                  {creatingMeeting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Schedule
                </Button>
              </div>
            )}

            <Separator className="mt-3" />

            {/* Meetings list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 pt-2">
              {meetingsLoading ? (
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
                meetings.map((m: Meeting) => <MeetingCard key={m.id} meeting={m} />)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


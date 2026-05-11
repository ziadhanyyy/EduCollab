import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Users, Monitor, MapPin, Clock, MessageSquare, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useMyGroups } from '@/hooks/useGroups';
import { extractErrorMessage, formatDateTime, groupStatusLabel } from '@/utils/helpers';
import api from '@/lib/api';
import type { Group } from '@/types';

// ─── Approval status badge ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Group['approvalStatus'] }) {
  const styles = [
    'bg-amber-100 text-amber-700 border-amber-300',
    'bg-emerald-100 text-emerald-700 border-emerald-300',
    'bg-red-100 text-red-700 border-red-300',
  ];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {groupStatusLabel(status)}
    </span>
  );
}

// ─── Group row card ───────────────────────────────────────────────────────────
function GroupRow({
  group,
  onDelete,
  deleting,
}: {
  group: Group;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const isFull = group.memberCount >= group.maxMembers;
  const fillPct = Math.min((group.memberCount / group.maxMembers) * 100, 100);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left info */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[15px] truncate">{group.name}</h3>
              <StatusBadge status={group.approvalStatus} />
            </div>

            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {group.memberCount} / {group.maxMembers} members
              </span>
              <span className="flex items-center gap-1">
                {group.meetingType === 0
                  ? <Monitor className="h-3.5 w-3.5 text-primary/70" />
                  : <MapPin className="h-3.5 w-3.5 text-amber-500" />}
                {group.meetingType === 0
                  ? (group.onlineLink ?? 'Online')
                  : (group.offlineAddress ?? 'Offline')}
              </span>
              {group.meetingSchedule && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(group.meetingSchedule)}
                </span>
              )}
            </div>

            {/* Member bar */}
            <div className="h-1.5 max-w-48 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? 'bg-muted-foreground/60' : 'bg-primary'}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/creator/groups/${group.id}/requests`}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Requests
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/creator/groups/${group.id}/edit`}>
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => onDelete(group.id)}
              disabled={deleting}
            >
              {deleting
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreatorGroups() {
  const { groups, loading, error, refetch } = useMyGroups();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/groups/${id}`);
      toast.success('Group deleted.');
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to delete group.'));
    } finally {
      setDeletingId(null);
    }
  }

  const pending  = groups.filter((g) => g.approvalStatus === 0);
  const approved = groups.filter((g) => g.approvalStatus === 1);
  const rejected = groups.filter((g) => g.approvalStatus === 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Study Groups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage your study groups.
          </p>
        </div>
        <Button asChild>
          <Link to="/creator/groups/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Group
          </Link>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="font-medium">No groups yet</p>
            <p className="text-sm text-muted-foreground">Create your first study group to get started.</p>
            <Button asChild className="mt-2">
              <Link to="/creator/groups/new">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Group
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {approved.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Approved ({approved.length})
              </h2>
              {approved.map((g) => (
                <GroupRow key={g.id} group={g} onDelete={handleDelete} deleting={deletingId === g.id} />
              ))}
            </section>
          )}

          {pending.length > 0 && (
            <>
              {approved.length > 0 && <Separator />}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                  Pending Review ({pending.length})
                </h2>
                {pending.map((g) => (
                  <GroupRow key={g.id} group={g} onDelete={handleDelete} deleting={deletingId === g.id} />
                ))}
              </section>
            </>
          )}

          {rejected.length > 0 && (
            <>
              {(approved.length > 0 || pending.length > 0) && <Separator />}
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                  Rejected ({rejected.length})
                </h2>
                {rejected.map((g) => (
                  <GroupRow key={g.id} group={g} onDelete={handleDelete} deleting={deletingId === g.id} />
                ))}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}


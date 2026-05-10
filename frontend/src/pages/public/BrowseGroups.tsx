import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Filter, Monitor, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import GroupCard from '@/components/groups/GroupCard';
import { useGroups, useMyGroups } from '@/hooks/useGroups';
import { useAuth } from '@/hooks/useAuth';
import { extractErrorMessage } from '@/utils/helpers';
import api from '@/lib/api';
import type { Group, JoinRequest } from '@/types';

// ─── Available subjects (pill buttons in sidebar) ─────────────────────────────
const SUBJECTS = ['Chemistry', 'Mathematics', 'Computer Science', 'Languages', 'Physics', 'Biology'];

// ─── Time filter options ──────────────────────────────────────────────────────
const TIME_OPTIONS = [
  { value: 'any',   label: 'Any Time' },
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-1.5 w-full rounded-full mt-1" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-8 w-full rounded-md mt-1" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BrowseGroups() {
  const { isAuthenticated, user } = useAuth();
  const { groups, loading, error } = useGroups();
  // Fetch user's own groups to detect already-joined status
  const { groups: myGroups } = useMyGroups();
  const memberGroupIds = useMemo(
    () => new Set(myGroups.map((g) => g.id)),
    [myGroups],
  );

  // Sidebar filter state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showOnline, setShowOnline]   = useState(true);
  const [showOffline, setShowOffline] = useState(true);
  const [timeFilter, setTimeFilter]   = useState('any');
  const [search, setSearch]           = useState('');

  // Per-card join state
  const [joiningId, setJoiningId]     = useState<string | null>(null);
  // Track which group IDs have a pending request — seeded from backend on mount
  const [pendingIds, setPendingIds]   = useState<Set<string>>(new Set());

  // Fetch student's existing pending join requests so the state survives page reload
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Student') return;
    api.get<JoinRequest[]>('/groups/my-join-requests')
      .then(({ data }) => {
        setPendingIds(new Set(data.map((r) => r.groupId)));
      })
      .catch(() => {});
  }, [isAuthenticated, user?.role]);

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  // ─── Client-side filtering ────────────────────────────────────────────────
  const filtered = useMemo<Group[]>(() => {
    return groups.filter((g) => {
      // Subject pill filter
      if (selectedSubjects.length > 0) {
        const match = selectedSubjects.some(
          (s) => s.toLowerCase() === g.subject.toLowerCase()
        );
        if (!match) return false;
      }

      // Meeting type checkboxes
      if (!showOnline && g.meetingType === 0) return false;
      if (!showOffline && g.meetingType === 1) return false;

      // Search bar — name or subject
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !g.name.toLowerCase().includes(q) &&
          !g.subject.toLowerCase().includes(q) &&
          !(g.description ?? '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Time filter (rough client-side)
      if (timeFilter !== 'any' && g.meetingSchedule) {
        const scheduled = new Date(g.meetingSchedule);
        const now = new Date();
        if (timeFilter === 'today') {
          if (scheduled.toDateString() !== now.toDateString()) return false;
        } else if (timeFilter === 'week') {
          const weekFromNow = new Date(now);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (scheduled < now || scheduled > weekFromNow) return false;
        } else if (timeFilter === 'month') {
          const monthFromNow = new Date(now);
          monthFromNow.setMonth(monthFromNow.getMonth() + 1);
          if (scheduled < now || scheduled > monthFromNow) return false;
        }
      }

      return true;
    });
  }, [groups, selectedSubjects, showOnline, showOffline, search, timeFilter]);

  // ─── Join handler ─────────────────────────────────────────────────────────
  const handleJoin = useCallback(async (groupId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to join a group.');
      return;
    }
    setJoiningId(groupId);
    try {
      await api.post<JoinRequest>('/groups/join', { groupId });
      setPendingIds((prev) => new Set([...prev, groupId]));
      toast.success('Join request sent!');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not send join request.'));
    } finally {
      setJoiningId(null);
    }
  }, [isAuthenticated]);

  return (
    <div className="flex gap-6 min-h-[calc(100vh-56px-48px)]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 space-y-5 pt-1">
        <h2 className="flex items-center gap-1.5 font-semibold text-sm">
          <Filter className="h-4 w-4" />
          Filters
        </h2>

        {/* Subject pills */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</p>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => {
              const active = selectedSubjects.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Meeting type */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meeting Type</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={showOnline}
                onCheckedChange={(v) => setShowOnline(!!v)}
                id="online"
              />
              <Label htmlFor="online" className="flex items-center gap-1.5 cursor-pointer text-sm font-normal">
                <Monitor className="h-3.5 w-3.5 text-primary/70" />
                Online
              </Label>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={showOffline}
                onCheckedChange={(v) => setShowOffline(!!v)}
                id="offline"
              />
              <Label htmlFor="offline" className="flex items-center gap-1.5 cursor-pointer text-sm font-normal">
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                Offline
              </Label>
            </label>
          </div>
        </div>

        <Separator />

        {/* Time */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</p>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-sm">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold">Discovery Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Find and join study groups that match your goals.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-white"
            placeholder="Search for subjects, groups, or topics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Error state */}
        {error && (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground">No study groups match your filters.</p>
            <button
              className="text-primary text-sm mt-2 hover:underline"
              onClick={() => {
                setSelectedSubjects([]);
                setShowOnline(true);
                setShowOffline(true);
                setTimeFilter('any');
                setSearch('');
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => {
              const isOwner = user?.id === g.creatorId;
              const isMember = isOwner || memberGroupIds.has(g.id);
              const membership = isMember
                ? 'member'
                : pendingIds.has(g.id)
                ? 'pending'
                : g.memberCount >= g.maxMembers
                ? 'full'
                : 'none';
              return (
                <GroupCard
                  key={g.id}
                  group={g}
                  membershipStatus={membership}
                  onJoin={handleJoin}
                  joining={joiningId === g.id}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


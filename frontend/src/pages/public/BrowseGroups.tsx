import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CardSkeleton from '@/components/browseGroups/card-skeleton';
import FilterBar from '@/components/browseGroups/filter-bar';
import GroupCard from '@/components/groups/GroupCard';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useGroups, useMyGroups } from '@/hooks/useGroups';
import api from '@/lib/api';
import type { Group, JoinRequest } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

export default function BrowseGroups() {
  const { isAuthenticated, user } = useAuth();
  const { groups, loading, error } = useGroups();
  const { groups: myGroups } = useMyGroups();
  const memberGroupIds = useMemo(() => new Set(myGroups.map((g) => g.id)), [myGroups]);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showOnline, setShowOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(true);
  const [timeFilter, setTimeFilter] = useState('any');
  const [search, setSearch] = useState('');

  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Student') return;
    api
      .get<JoinRequest[]>('/groups/my-join-requests')
      .then(({ data }) => {
        setPendingIds(new Set(data.map((r) => r.groupId)));
      })
      .catch(() => {});
  }, [isAuthenticated, user?.role]);

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  }

  const filtered = useMemo<Group[]>(() => {
    return groups.filter((g) => {
      if (selectedSubjects.length > 0) {
        const match = selectedSubjects.some((s) => s.toLowerCase() === g.subject.toLowerCase());
        if (!match) return false;
      }

      if (!showOnline && g.meetingType === 0) return false;
      if (!showOffline && g.meetingType === 1) return false;

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

  const handleJoin = useCallback(
    async (groupId: string) => {
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
    },
    [isAuthenticated],
  );

  return (
    <div className="flex gap-6 min-h-[calc(100vh-56px-48px)]">
      <FilterBar
        selectedSubjects={selectedSubjects}
        toggleSubject={toggleSubject}
        showOnline={showOnline}
        setShowOnline={setShowOnline}
        showOffline={showOffline}
        setShowOffline={setShowOffline}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      <div className="flex-1 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Discovery Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Find and join study groups that match your goals.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-white"
            placeholder="Search for subjects, groups, or topics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive text-center py-4">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground">No study groups match your filters.</p>
            <button
              type="button"
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

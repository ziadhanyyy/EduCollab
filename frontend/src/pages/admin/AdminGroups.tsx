import { useState } from 'react';
import { BookOpen, Search, CheckCircle, Monitor, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import GroupApprovalCard from '@/components/admin/GroupApprovalCard';
import { usePendingGroups } from '@/hooks/useAdmin';

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type MeetingFilter = 'all' | 'online' | 'offline';

export default function AdminGroups() {
  const { groups, loading, error, approve, reject } = usePendingGroups();
  const [search, setSearch] = useState('');
  const [meetingFilter, setMeetingFilter] = useState<MeetingFilter>('all');

  const filtered = groups.filter((g) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !g.name.toLowerCase().includes(q) &&
        !g.subject.toLowerCase().includes(q) &&
        !g.creatorName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (meetingFilter === 'online' && g.meetingType !== 0) return false;
    if (meetingFilter === 'offline' && g.meetingType !== 1) return false;
    return true;
  });

  const filterBtnCls = (active: boolean) =>
    `flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
      active
        ? 'bg-primary text-white border-primary'
        : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-violet-500" />
            Pending Study Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve study group submissions from Group Creators.
          </p>
        </div>
        {!loading && (
          <span className="text-sm font-medium bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
            {groups.length} pending
          </span>
        )}
      </div>

      {/* Search + type filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, subject, or creator…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className={filterBtnCls(meetingFilter === 'all')} onClick={() => setMeetingFilter('all')}>
            All
          </button>
          <button className={filterBtnCls(meetingFilter === 'online')} onClick={() => setMeetingFilter('online')}>
            <Monitor className="h-3.5 w-3.5" />
            Online
          </button>
          <button className={filterBtnCls(meetingFilter === 'offline')} onClick={() => setMeetingFilter('offline')}>
            <MapPin className="h-3.5 w-3.5" />
            Offline
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Grid */}
      {loading ? (
        <GridSkeleton />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="font-medium">
              {search || meetingFilter !== 'all'
                ? 'No groups match your filters.'
                : 'No pending study groups!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {search || meetingFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'All group submissions have been reviewed.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <GroupApprovalCard
              key={g.id}
              group={g}
              onApprove={approve}
              onReject={reject}
            />
          ))}
        </div>
      )}
    </div>
  );
}


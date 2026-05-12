import { BookOpen, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import GroupCard from '@/components/groups/GroupCard';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyGroups } from '@/hooks/useGroups';

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
      <Skeleton className="h-8 w-full rounded-md mt-1" />
    </div>
  );
}

export default function StudentGroups() {
  const { groups, loading, error } = useMyGroups();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q),
    );
  }, [groups, search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Groups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All the study groups you have joined.
          </p>
        </div>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-2"
        >
          <BookOpen className="h-4 w-4" />
          Browse more groups
        </Link>
      </div>

      {/* Search */}
      {!loading && groups.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-white"
            placeholder="Search your groups…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <Users className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <p className="font-medium">You haven't joined any groups yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Head to the{' '}
              <Link to="/browse" className="text-primary hover:underline">
                Discovery Hub
              </Link>{' '}
              to find study groups.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No groups match your search.</p>
          <button
            type="button"
            className="text-primary text-sm mt-1.5 hover:underline"
            onClick={() => setSearch('')}
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} group{filtered.length !== 1 ? 's' : ''}
            {search ? ` matching "${search}"` : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => (
              <GroupCard key={g.id} group={g} membershipStatus="member" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

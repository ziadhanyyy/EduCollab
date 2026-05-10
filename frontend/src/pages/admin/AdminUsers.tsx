import { useState } from 'react';
import { Users, Search, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import UserApprovalCard from '@/components/admin/UserApprovalCard';
import { usePendingCreators } from '@/hooks/useAdmin';

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminUsers() {
  const { creators, loading, error, approve, reject } = usePendingCreators();
  const [search, setSearch] = useState('');

  const filtered = creators.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" />
            Pending Group Creators
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve Group Creator account registrations.
          </p>
        </div>
        {!loading && (
          <span className="text-sm font-medium bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
            {creators.length} pending
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* List */}
      {loading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="font-medium">
              {search ? 'No creators match your search.' : 'No pending creator accounts!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? 'Try a different search term.'
                : 'All Group Creator registrations have been reviewed.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <UserApprovalCard
              key={c.id}
              creator={c}
              onApprove={approve}
              onReject={reject}
            />
          ))}
        </div>
      )}
    </div>
  );
}


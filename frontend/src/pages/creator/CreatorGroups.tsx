import { BookOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import GroupRow from '@/components/groups/GroupRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyGroups } from '@/hooks/useGroups';
import api from '@/lib/api';
import { extractErrorMessage } from '@/utils/helpers';

export default function CreatorGroups() {
  const { groups, loading, error, refetch } = useMyGroups();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
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

  const pending = groups.filter((g) => g.approvalStatus === 0);
  const approved = groups.filter((g) => g.approvalStatus === 1);
  const rejected = groups.filter((g) => g.approvalStatus === 2);

  return (
    <div className="space-y-6">
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
            <p className="text-sm text-muted-foreground">
              Create your first study group to get started.
            </p>
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
                <GroupRow
                  key={g.id}
                  group={g}
                  onDelete={handleDelete}
                  deleting={deletingId === g.id}
                />
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
                  <GroupRow
                    key={g.id}
                    group={g}
                    onDelete={handleDelete}
                    deleting={deletingId === g.id}
                  />
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
                  <GroupRow
                    key={g.id}
                    group={g}
                    onDelete={handleDelete}
                    deleting={deletingId === g.id}
                  />
                ))}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

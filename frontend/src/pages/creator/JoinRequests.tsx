import { ArrowLeft, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import RequestCard from '@/components/groups/RequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroup } from '@/hooks/useGroups';
import api from '@/lib/api';
import type { JoinRequest } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';

export default function JoinRequests() {
  const { id } = useParams<{ id: string }>();
  const { group } = useGroup(id ?? '');

  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<JoinRequest[]>(`/groups/${id}/join-requests`);
      setRequests(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = useCallback(async (requestId: string, accept: boolean) => {
    try {
      await api.post(`/groups/join-requests/${requestId}/review`, { accept });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success(accept ? 'Student accepted into the group.' : 'Request rejected.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to review request.'));
      throw err;
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <Link
          to="/creator/groups"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Groups
        </Link>
        <h1 className="text-2xl font-bold">Join Requests</h1>
        {group && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Pending requests for <span className="font-medium text-foreground">{group.name}</span>
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
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
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center space-y-2">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="font-medium">No pending requests</p>
            <p className="text-sm text-muted-foreground">
              Students who request to join will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {requests.map((r) => (
              <RequestCard key={r.id} req={r} onReview={handleReview} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

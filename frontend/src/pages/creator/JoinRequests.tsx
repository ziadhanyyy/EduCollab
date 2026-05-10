import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Users, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroup } from '@/hooks/useGroups';
import { extractErrorMessage, formatDate, timeAgo } from '@/utils/helpers';
import api from '@/lib/api';
import type { JoinRequest } from '@/types';

function RequestCard({
  req,
  onReview,
}: {
  req: JoinRequest;
  onReview: (id: string, accept: boolean) => Promise<void>;
}) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  async function handle(accept: boolean) {
    accept ? setAccepting(true) : setRejecting(true);
    try {
      await onReview(req.id, accept);
    } finally {
      setAccepting(false);
      setRejecting(false);
    }
  }

  const busy = accepting || rejecting;

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-10 w-10 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center uppercase shrink-0 select-none">
            {req.studentName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm">{req.studentName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              Requested {timeAgo(req.requestedAt)} · {formatDate(req.requestedAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => handle(false)}
            disabled={busy}
          >
            {rejecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            <span className="ml-1.5">Reject</span>
          </Button>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => handle(true)}
            disabled={busy}
          >
            {accepting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span className="ml-1.5">Accept</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JoinRequests() {
  const { id } = useParams<{ id: string }>();
  const { group } = useGroup(id ?? '');

  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

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

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

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
      {/* Header */}
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


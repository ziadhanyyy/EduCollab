import { Check, Clock, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import type { JoinRequest } from '@/types';
import { formatDate, timeAgo } from '@/utils/helpers';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

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
            {rejecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">Reject</span>
          </Button>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => handle(true)}
            disabled={busy}
          >
            {accepting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">Accept</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RequestCard;

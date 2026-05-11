import { useState } from 'react';
import { Check, X, User, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PendingCreator } from '@/types';
import { formatDate, extractErrorMessage } from '@/utils/helpers';

interface UserApprovalCardProps {
  creator: PendingCreator;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function UserApprovalCard({ creator, onApprove, onReject }: UserApprovalCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  async function handleApprove() {
    setApproving(true);
    try {
      await onApprove(creator.id);
      toast.success(`${creator.displayName} approved as Group Creator.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to approve.'));
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      await onReject(creator.id);
      toast.success(`${creator.displayName}'s account rejected.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to reject.'));
    } finally {
      setRejecting(false);
    }
  }

  const busy = approving || rejecting;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left — avatar + info */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center uppercase shrink-0 select-none">
            {creator.displayName.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{creator.displayName}</p>
              <Badge variant="secondary" className="text-xs shrink-0">
                Group Creator
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {creator.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Registered {formatDate(creator.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={handleReject}
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
            onClick={handleApprove}
            disabled={busy}
          >
            {approving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">Approve</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

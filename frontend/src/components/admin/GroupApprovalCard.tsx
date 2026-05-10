import { useState } from 'react';
import { Check, X, Users, Monitor, MapPin, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Group } from '@/types';
import { formatDate, formatDateTime, extractErrorMessage } from '@/utils/helpers';

// Subject badge colours
const SUBJECT_COLORS: Record<string, string> = {
  chemistry:           'bg-sky-100 text-sky-700',
  mathematics:         'bg-violet-100 text-violet-700',
  'computer science':  'bg-indigo-100 text-indigo-700',
  languages:           'bg-teal-100 text-teal-700',
  physics:             'bg-orange-100 text-orange-700',
  biology:             'bg-green-100 text-green-700',
};
function subjectColor(subject: string) {
  return SUBJECT_COLORS[subject.toLowerCase()] ?? 'bg-primary/10 text-primary';
}

interface GroupApprovalCardProps {
  group: Group;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function GroupApprovalCard({ group, onApprove, onReject }: GroupApprovalCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  async function handleApprove() {
    setApproving(true);
    try {
      await onApprove(group.id);
      toast.success(`"${group.name}" approved and is now visible to students.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to approve group.'));
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      await onReject(group.id);
      toast.success(`"${group.name}" rejected.`);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to reject group.'));
    } finally {
      setRejecting(false);
    }
  }

  const busy = approving || rejecting;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${subjectColor(group.subject)}`}>
              {group.subject}
            </span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            Submitted {formatDate(group.createdAt)}
          </span>
        </div>

        {/* Name + description */}
        <div>
          <h3 className="font-semibold text-[15px]">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{group.description}</p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Max {group.maxMembers} members
          </span>
          <span className="flex items-center gap-1">
            {group.meetingType === 0
              ? <Monitor className="h-3.5 w-3.5 text-primary/70" />
              : <MapPin className="h-3.5 w-3.5 text-amber-500" />}
            {group.meetingType === 0
              ? (group.onlineLink ?? 'Online')
              : (group.offlineAddress ?? 'Offline')}
          </span>
          {group.meetingSchedule && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(group.meetingSchedule)}
            </span>
          )}
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center uppercase shrink-0 select-none">
            {group.creatorName.charAt(0)}
          </span>
          <span className="text-sm text-muted-foreground">
            by <span className="font-medium text-foreground">{group.creatorName}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={handleReject}
            disabled={busy}
          >
            {rejecting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <X className="h-3.5 w-3.5 mr-1" />}
            Reject
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={handleApprove}
            disabled={busy}
          >
            {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

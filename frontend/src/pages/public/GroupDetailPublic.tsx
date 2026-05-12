import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Monitor,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { GroupDetailRow } from '@/components/group-detail/GroupDetailRow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useGroup } from '@/hooks/useGroups';
import api from '@/lib/api';
import type { JoinRequest } from '@/types';
import {
  extractErrorMessage,
  formatDateTime,
  groupStatusLabel,
  meetingTypeLabel,
  subjectColor,
} from '@/utils/helpers';

export default function GroupDetailPublic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();
  const { group, loading, error } = useGroup(id ?? '');

  const [joining, setJoining] = useState(false);
  const [requested, setRequested] = useState(false);

  async function handleJoin() {
    if (!isAuthenticated) {
      toast.error('Please log in to request to join.');
      navigate('/login');
      return;
    }
    setJoining(true);
    try {
      await api.post<JoinRequest>('/groups/join', { groupId: id });
      setRequested(true);
      toast.success('Join request sent! The group creator will review it.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not send join request.'));
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-3xl mx-auto py-10 text-center space-y-3">
        <p className="text-muted-foreground">{error ?? 'Group not found.'}</p>
        <Button variant="outline" asChild>
          <Link to="/browse">Back to Browse</Link>
        </Button>
      </div>
    );
  }

  const isFull = group.memberCount >= group.maxMembers;
  const fillPct = Math.min((group.memberCount / group.maxMembers) * 100, 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${subjectColor(group.subject)}`}
            >
              {group.subject}
            </span>
            <Badge
              variant="outline"
              className={
                group.approvalStatus === 1
                  ? 'border-green-400 text-green-600 bg-green-50'
                  : 'border-muted-foreground/40 text-muted-foreground'
              }
            >
              {groupStatusLabel(group.approvalStatus)}
            </Badge>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground mt-1.5 leading-relaxed">{group.description}</p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GroupDetailRow
              icon={<Users className="h-4 w-4" />}
              label="Members"
              value={`${group.memberCount} / ${group.maxMembers}`}
            />
            <GroupDetailRow
              icon={
                group.meetingType === 0 ? (
                  <Monitor className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )
              }
              label="Meeting Format"
              value={meetingTypeLabel(group.meetingType)}
            />
            {group.meetingType === 0 && group.onlineLink && (
              <GroupDetailRow
                icon={<Monitor className="h-4 w-4" />}
                label="Online Link"
                value={group.onlineLink}
              />
            )}
            {group.meetingType === 1 && group.offlineAddress && (
              <GroupDetailRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={group.offlineAddress}
              />
            )}
            {group.meetingSchedule && (
              <GroupDetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Next Meeting"
                value={formatDateTime(group.meetingSchedule)}
              />
            )}
            <GroupDetailRow
              icon={<Clock className="h-4 w-4" />}
              label="Created"
              value={formatDateTime(group.createdAt)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Capacity</span>
              <span>{Math.round(fillPct)}% full</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? 'bg-muted-foreground/60' : 'bg-primary'}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center uppercase shrink-0 select-none">
              {group.creatorName.charAt(0)}
            </span>
            <div>
              <p className="font-medium text-sm">{group.creatorName}</p>
              <p className="text-xs text-muted-foreground">Group Creator</p>
            </div>
          </div>

          {isStudent && (
            <div className="pt-1">
              {requested ? (
                <Button className="w-full sm:w-auto" variant="outline" disabled>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Request Sent
                </Button>
              ) : isFull ? (
                <Button className="w-full sm:w-auto" disabled variant="secondary">
                  Group Full
                </Button>
              ) : (
                <Button
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleJoin}
                  disabled={joining}
                >
                  {joining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Request to Join
                </Button>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>{' '}
              to request to join this group.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

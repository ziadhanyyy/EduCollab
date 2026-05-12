import { CheckCircle, Clock, Loader2, MapPin, Monitor, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Group } from '@/types';
import { formatDateTime, subjectColor } from '@/utils/helpers';

type MembershipStatus = 'member' | 'pending' | 'full' | 'none';

interface GroupCardProps {
  group: Group;
  membershipStatus?: MembershipStatus;
  onJoin?: (groupId: string) => void;
  joining?: boolean;
}

export default function GroupCard({
  group,
  membershipStatus = 'none',
  onJoin,
  joining = false,
}: GroupCardProps) {
  const isFull = group.memberCount >= group.maxMembers;
  const fillPct = Math.min((group.memberCount / group.maxMembers) * 100, 100);

  const statusBadge = (() => {
    if (membershipStatus === 'member') {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-teal-600">
          <CheckCircle className="h-3 w-3" /> Member
        </span>
      );
    }
    if (membershipStatus === 'full' || isFull) {
      return <span className="text-xs text-muted-foreground font-medium">Full</span>;
    }
    return null;
  })();

  const actionButton = (() => {
    if (membershipStatus === 'member') {
      return (
        <Button variant="outline" className="w-full" size="sm" asChild>
          <Link to={`/groups/${group.id}/space`}>Open Group Space</Link>
        </Button>
      );
    }
    if (membershipStatus === 'pending') {
      return (
        <Button
          variant="outline"
          className="w-full text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100"
          size="sm"
          disabled
        >
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Request Pending
        </Button>
      );
    }
    if (isFull || membershipStatus === 'full') {
      return (
        <Button variant="secondary" className="w-full" size="sm" disabled>
          Group Full
        </Button>
      );
    }
    return (
      <Button
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
        size="sm"
        onClick={() => onJoin?.(group.id)}
        disabled={joining}
      >
        {joining && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
        Request to Join
      </Button>
    );
  })();

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${subjectColor(group.subject)}`}
          >
            {group.subject}
          </span>
          {statusBadge}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-[15px] leading-snug line-clamp-1">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
              {group.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center uppercase shrink-0 select-none">
            {group.creatorName.charAt(0)}
          </span>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-medium truncate">{group.creatorName}</p>
            <p className="text-xs text-muted-foreground">Creator</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {group.memberCount} / {group.maxMembers} Members
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? 'bg-muted-foreground/60' : 'bg-primary'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {group.meetingType === 0 ? (
              <Monitor className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            ) : (
              <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            )}
            <span className="truncate">
              {group.meetingType === 0
                ? (group.onlineLink ?? 'Virtual')
                : (group.offlineAddress ?? 'Offline')}
            </span>
          </div>
          {group.meetingSchedule && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDateTime(group.meetingSchedule)}</span>
            </div>
          )}
        </div>

        <div className="pt-1">{actionButton}</div>
      </CardContent>
    </Card>
  );
}

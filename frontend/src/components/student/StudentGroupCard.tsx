import { CheckCircle, Clock, MapPin, Monitor, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Group } from '@/types';
import { formatDateTime, meetingTypeLabel } from '@/utils/helpers';

export function StudentGroupCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-9 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

export default function StudentGroupCard({ group }: { group: Group }) {
  const isFull = group.memberCount >= group.maxMembers;
  const fillPct = Math.min((group.memberCount / group.maxMembers) * 100, 100);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-medium">
              {group.subject}
            </Badge>
            {isFull ? (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground border-muted-foreground/40"
              >
                Full
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-green-600 border-green-400 bg-green-50"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Member
              </Badge>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-base leading-tight">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center uppercase shrink-0">
              {group.creatorName.charAt(0)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">{group.creatorName}</p>
              <p className="text-xs text-muted-foreground">Creator</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {group.memberCount} / {group.maxMembers} Members
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? 'bg-muted-foreground' : 'bg-primary'}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {group.meetingType === 0 ? (
                <Monitor className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <MapPin className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">
                {group.meetingType === 0
                  ? (group.onlineLink ?? meetingTypeLabel(0))
                  : (group.offlineAddress ?? meetingTypeLabel(1))}
              </span>
            </div>
            {group.meetingSchedule && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDateTime(group.meetingSchedule)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-4">
          {isFull ? (
            <Button variant="secondary" className="w-full" disabled>
              Group Full
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link to={`/groups/${group.id}/space`}>Open Group Space</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

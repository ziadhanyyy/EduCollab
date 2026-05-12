import { Clock, Edit2, Loader2, MapPin, MessageSquare, Monitor, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Group } from '@/types';
import { GroupStatusBadge } from '@/utils/getStatusBadges';
import { formatDateTime } from '@/utils/helpers';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

function GroupRow({
  group,
  onDelete,
  deleting,
}: {
  group: Group;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const isFull = group.memberCount >= group.maxMembers;
  const fillPct = Math.min((group.memberCount / group.maxMembers) * 100, 100);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[15px] truncate">{group.name}</h3>
              <GroupStatusBadge status={group.approvalStatus} />
            </div>

            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {group.memberCount} / {group.maxMembers} members
              </span>
              <span className="flex items-center gap-1">
                {group.meetingType === 0 ? (
                  <Monitor className="h-3.5 w-3.5 text-primary/70" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                )}
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

            <div className="h-1.5 max-w-48 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? 'bg-muted-foreground/60' : 'bg-primary'}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/creator/groups/${group.id}/requests`}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Requests
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to={`/creator/groups/${group.id}/edit`}>
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Link>
            </Button>
<AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <Trash2 />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete group?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <span className="font-medium text-foreground">{group.name}</span> will be
                    permanently deleted along with all its members, materials, and meetings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(group.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GroupRow;

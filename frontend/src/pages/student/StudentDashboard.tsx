import { Link } from 'react-router-dom';
import { Bell, MapPin, Monitor, Clock, Users, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useMyGroups } from '@/hooks/useGroups';
import { useNotifications } from '@/hooks/useNotifications';
import type { Group, Notification } from '@/types';
import { timeAgo, formatDateTime, meetingTypeLabel } from '@/utils/helpers';

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({ group }: { group: Group }) {
  const isFull = group.memberCount >= group.maxMembers;
  const fillPct = Math.min((group.memberCount / group.maxMembers) * 100, 100);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          {/* Top row: subject badge + status badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-medium">
              {group.subject}
            </Badge>
            {isFull ? (
              <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/40">
                Full
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-green-600 border-green-400 bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Member
              </Badge>
            )}
          </div>

          {/* Name + description */}
          <div>
            <h3 className="font-semibold text-base leading-tight">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
            )}
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center uppercase shrink-0">
              {group.creatorName.charAt(0)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">{group.creatorName}</p>
              <p className="text-xs text-muted-foreground">Creator</p>
            </div>
          </div>

          {/* Member count + progress bar */}
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

          {/* Meeting info */}
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {group.meetingType === 0 ? (
                <Monitor className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <MapPin className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">
                {group.meetingType === 0
                  ? group.onlineLink ?? meetingTypeLabel(0)
                  : group.offlineAddress ?? meetingTypeLabel(1)}
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

        {/* Action button */}
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

// ─── Notification item ────────────────────────────────────────────────────────

function NotificationItem({ notification }: { notification: Notification }) {
  const dotColor = notification.isRead ? 'bg-muted-foreground/40' : 'bg-green-500';

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
      <div className="space-y-0.5">
        <p className="text-sm leading-snug">{notification.message}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function GroupCardSkeleton() {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth();
  const { groups, loading: groupsLoading } = useMyGroups();
  const { notifications, loading: notifLoading, markAllRead, unreadCount } = useNotifications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ''}! Here is an overview of your activities.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — My Groups (takes 2/3) */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold">My Groups</h2>

          {groupsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GroupCardSkeleton />
              <GroupCardSkeleton />
            </div>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">You haven't joined any groups yet.</p>
                <Button className="mt-4" asChild>
                  <Link to="/browse">Browse Groups</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          )}
        </section>

        {/* Right — Notification Center (takes 1/3) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              {notifLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 py-2">
                      <Skeleton className="h-2 w-2 rounded-full mt-2 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}


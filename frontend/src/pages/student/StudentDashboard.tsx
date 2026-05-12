import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import StudentGroupCard, { StudentGroupCardSkeleton } from '@/components/student/StudentGroupCard';
import StudentNotificationItem from '@/components/student/StudentNotificationItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useMyGroups } from '@/hooks/useGroups';
import { useNotifications } from '@/hooks/useNotifications';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { groups, loading: groupsLoading } = useMyGroups();
  const { notifications, loading: notifLoading, markAllRead, unreadCount } = useNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ''}! Here is an overview of
          your activities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold">My Groups</h2>

          {groupsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StudentGroupCardSkeleton />
              <StudentGroupCardSkeleton />
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
                <StudentGroupCard key={g.id} group={g} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <button
                type="button"
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
                notifications.map((n) => <StudentNotificationItem key={n.id} notification={n} />)
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

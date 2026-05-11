import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePendingCreators, usePendingGroups } from '@/hooks/useAdmin';
import UserApprovalCard from '@/components/admin/UserApprovalCard';
import GroupApprovalCard from '@/components/admin/GroupApprovalCard';

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  href: string;
  loading: boolean;
  color: string;
}

function StatCard({ title, value, icon, href, loading, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <span className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          {loading ? (
            <Skeleton className="h-7 w-10 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{value ?? 0}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to={href}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Section skeleton ─────────────────────────────────────────────────────────
function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const {
    creators,
    loading: creatorsLoading,
    approve: approveCreator,
    reject: rejectCreator,
  } = usePendingCreators();

  const {
    groups,
    loading: groupsLoading,
    approve: approveGroup,
    reject: rejectGroup,
  } = usePendingGroups();

  const totalPending = (creators?.length ?? 0) + (groups?.length ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {totalPending > 0
              ? `${totalPending} item${totalPending !== 1 ? 's' : ''} awaiting your review`
              : 'Everything is up to date.'}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Creators"
          value={creators?.length}
          icon={<Users className="h-5 w-5 text-amber-600" />}
          href="/admin/users"
          loading={creatorsLoading}
          color="bg-amber-100"
        />
        <StatCard
          title="Pending Groups"
          value={groups?.length}
          icon={<BookOpen className="h-5 w-5 text-violet-600" />}
          href="/admin/groups"
          loading={groupsLoading}
          color="bg-violet-100"
        />
        <StatCard
          title="Items Reviewed Today"
          value={0}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          href="/admin/users"
          loading={false}
          color="bg-emerald-100"
        />
        <StatCard
          title="Total Pending"
          value={totalPending}
          icon={<Clock className="h-5 w-5 text-primary" />}
          href="/admin/users"
          loading={creatorsLoading || groupsLoading}
          color="bg-primary/10"
        />
      </div>

      {/* Two-column: pending creators + pending groups */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Pending Creators */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              Pending Group Creators
              {!creatorsLoading && creators.length > 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  {creators.length}
                </span>
              )}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/users" className="text-xs text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {creatorsLoading ? (
            <ListSkeleton />
          ) : creators.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending creator accounts.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {creators.slice(0, 3).map((c) => (
                <UserApprovalCard
                  key={c.id}
                  creator={c}
                  onApprove={approveCreator}
                  onReject={rejectCreator}
                />
              ))}
              {creators.length > 3 && (
                <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground">
                  <Link to="/admin/users">+{creators.length - 3} more</Link>
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Pending Groups */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" />
              Pending Study Groups
              {!groupsLoading && groups.length > 0 && (
                <span className="ml-1 text-xs bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">
                  {groups.length}
                </span>
              )}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/groups" className="text-xs text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {groupsLoading ? (
            <ListSkeleton />
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending groups to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {groups.slice(0, 3).map((g) => (
                <GroupApprovalCard
                  key={g.id}
                  group={g}
                  onApprove={approveGroup}
                  onReject={rejectGroup}
                />
              ))}
              {groups.length > 3 && (
                <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground">
                  <Link to="/admin/groups">+{groups.length - 3} more</Link>
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, Bell, Search, LayoutDashboard, ChevronDown,
  LogOut, User, Users, Check, BellRing,
  Calendar, FileText, MessageSquare, CheckCircle2, XCircle, ShieldCheck,
} from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationHub } from '@/hooks/useNotificationHub';
import { timeAgo, notificationTypeLabel, notificationLink } from '@/utils/helpers';
import type { Notification } from '@/types';

// ─── Notification type → icon ─────────────────────────────────────────────────
function NotifIcon({ type }: { type: Notification['type'] }) {
  const cls = 'h-4 w-4';
  switch (type) {
    case 0:  return <Calendar       className={`${cls} text-blue-500`} />;
    case 1:  return <CheckCircle2   className={`${cls} text-emerald-500`} />;
    case 2:  return <XCircle        className={`${cls} text-red-500`} />;
    case 3:  return <FileText       className={`${cls} text-violet-500`} />;
    case 4:  return <MessageSquare  className={`${cls} text-indigo-500`} />;
    case 5:  return <ShieldCheck    className={`${cls} text-emerald-500`} />;
    case 6:  return <XCircle        className={`${cls} text-red-500`} />;
    case 7:  return <BookOpen       className={`${cls} text-amber-500`} />;
    case 8:  return <Users           className={`${cls} text-sky-500`} />;
    default: return <Bell           className={`${cls} text-primary`} />;
  }
}

function notifIconBg(type: Notification['type']): string {
  const map = [
    'bg-blue-50',    // MeetingReminder
    'bg-emerald-50', // JoinRequestAccepted
    'bg-red-50',     // JoinRequestRejected
    'bg-violet-50',  // NewMaterial
    'bg-indigo-50',  // NewMessage
    'bg-emerald-50', // GroupApproved
    'bg-red-50',     // GroupRejected
    'bg-amber-50',   // NewGroupPendingReview
    'bg-sky-50',     // NewJoinRequest
  ];
  return map[type] ?? 'bg-muted';
}

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin, isGroupCreator } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const { notifications, unreadCount, markAllRead, markOneRead, appendNotification } = useNotifications();

  // Bell ring animation when unread count increases
  const prevUnreadRef = useRef(unreadCount);
  const [bellRinging, setBellRinging] = useState(false);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setBellRinging(true);
      const t = setTimeout(() => setBellRinging(false), 700);
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  // Real-time notifications via hub — show toast + prepend to list
  const handleIncoming = useCallback((n: Notification) => {
    appendNotification(n);
    toast(notificationTypeLabel(n.type), {
      description: n.message,
      icon: <BellRing className="h-4 w-4 text-primary" />,
    });
  }, [appendNotification]);

  useNotificationHub(isAuthenticated ? handleIncoming : undefined);

  function handleLogout() {
    logout();
    navigate('/');
    setDropdownOpen(false);
  }

  const dashboardHref = isAdmin
    ? '/admin/dashboard'
    : isGroupCreator
    ? '/creator/groups'
    : '/student/dashboard';

  const roleLabel = isAdmin ? 'Admin' : isGroupCreator ? 'Group Creator' : 'Student';

  const activeCls = 'text-foreground font-semibold border-b-2 border-primary pb-0.5';
  const inactiveCls = 'text-muted-foreground hover:text-foreground transition-colors';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-sm ${isActive ? activeCls : inactiveCls}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-base text-foreground shrink-0">
          <BookOpen className="h-5 w-5 text-primary" />
          EduCollab
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-6">
          <NavLink to="/browse" className={navLinkClass}>
            <Search className="h-4 w-4" />
            Discovery
          </NavLink>
          {isAuthenticated && (
            <NavLink to={dashboardHref} className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="h-4 w-4" />
                Users
              </NavLink>
              <NavLink to="/admin/groups" className={navLinkClass}>
                <BookOpen className="h-4 w-4" />
                Groups
              </NavLink>
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* ── Bell with notification dropdown ─────────────────────── */}
              <div className="relative">
                <button
                  onClick={() => {
                    setBellOpen((p) => !p);
                    setDropdownOpen(false);
                    // Mark all read when opening the panel
                    if (!bellOpen && unreadCount > 0) markAllRead();
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className={`h-4 w-4 transition-colors ${bellRinging ? 'text-primary bell-ring' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none select-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-96 rounded-xl border bg-white shadow-xl overflow-hidden">

                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllRead()}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Check className="h-3 w-3" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="max-h-[420px] overflow-y-auto divide-y">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                if (!n.isRead) markOneRead(n.id);
                                navigate(notificationLink(n));
                                setBellOpen(false);
                              }}
                              className={`w-full flex gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                                !n.isRead
                                  ? 'bg-primary/5 hover:bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              {/* Icon badge */}
                              <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${notifIconBg(n.type)}`}>
                                <NotifIcon type={n.type} />
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {notificationTypeLabel(n.type)}
                                </p>
                                <p className={`text-sm leading-snug mt-0.5 ${!n.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                  {n.message}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                              </div>

                              {/* Unread dot */}
                              {!n.isRead && (
                                <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 10 && (
                        <>
                          <Separator />
                          <div className="px-4 py-2.5 bg-muted/20 text-center">
                            <button
                              onClick={() => { navigate(dashboardHref); setBellOpen(false); }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              View all {notifications.length} notifications →
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ── Avatar + dropdown ────────────────────────────────────── */}
              <div className="relative">
                <button
                  onClick={() => { setDropdownOpen((p) => !p); setBellOpen(false); }}
                  className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors"
                >
                  <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center uppercase select-none">
                    {user?.displayName.charAt(0)}
                  </span>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium">{user?.displayName}</span>
                    <span className="text-xs text-muted-foreground">Viewing as {roleLabel}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-md border bg-white shadow-md py-1">
                      <Link
                        to={dashboardHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


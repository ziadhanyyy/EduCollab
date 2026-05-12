import { BellRing, BookOpen, LayoutDashboard, Search, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationHub } from '@/hooks/useNotificationHub';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types';
import { notificationTypeLabel } from '@/utils/helpers';
import { getRoleLabel, navLinkClass } from '@/utils/notif';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin, isGroupCreator } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const { notifications, unreadCount, markAllRead, markOneRead, appendNotification } =
    useNotifications();

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

  const handleIncoming = useCallback(
    (n: Notification) => {
      appendNotification(n);
      toast(notificationTypeLabel(n.type), {
        description: n.message,
        icon: <BellRing className="h-4 w-4 text-primary" />,
      });
    },
    [appendNotification],
  );

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

  const roleLabel = getRoleLabel(isAdmin, isGroupCreator);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-base text-foreground shrink-0"
        >
          <BookOpen className="h-5 w-5 text-primary" />
          EduCollab
        </Link>

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

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationDropdown
                open={bellOpen}
                onToggle={() => {
                  setBellOpen((p) => !p);
                  setDropdownOpen(false);
                }}
                onClose={() => setBellOpen(false)}
                bellRinging={bellRinging}
                unreadCount={unreadCount}
                notifications={notifications}
                markAllRead={markAllRead}
                markOneRead={markOneRead}
                dashboardHref={dashboardHref}
              />
              <UserDropdown
                open={dropdownOpen}
                onToggle={() => {
                  setDropdownOpen((p) => !p);
                  setBellOpen(false);
                }}
                onClose={() => setDropdownOpen(false)}
                user={user}
                roleLabel={roleLabel}
                dashboardHref={dashboardHref}
                onLogout={handleLogout}
              />
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

import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import type { Notification } from '@/types';

export function NotifIcon({ type }: { type: Notification['type'] }) {
  const cls = 'h-4 w-4';
  switch (type) {
    case 0:
      return <Calendar className={`${cls} text-blue-500`} />;
    case 1:
      return <CheckCircle2 className={`${cls} text-emerald-500`} />;
    case 2:
      return <XCircle className={`${cls} text-red-500`} />;
    case 3:
      return <FileText className={`${cls} text-violet-500`} />;
    case 4:
      return <MessageSquare className={`${cls} text-indigo-500`} />;
    case 5:
      return <ShieldCheck className={`${cls} text-emerald-500`} />;
    case 6:
      return <XCircle className={`${cls} text-red-500`} />;
    case 7:
      return <BookOpen className={`${cls} text-amber-500`} />;
    case 8:
      return <Users className={`${cls} text-sky-500`} />;
    default:
      return <Bell className={`${cls} text-primary`} />;
  }
}

export function NotifIconBg(type: Notification['type']): string {
  const map = [
    'bg-blue-50',
    'bg-emerald-50',
    'bg-red-50',
    'bg-violet-50',
    'bg-indigo-50',
    'bg-emerald-50',
    'bg-red-50',
    'bg-amber-50',
    'bg-sky-50',
  ];
  return map[type] ?? 'bg-muted';
}

export function getRoleLabel(isAdmin: boolean, isGroupCreator: boolean): string {
  return isAdmin ? 'Admin' : isGroupCreator ? 'Group Creator' : 'Student';
}

export const activeCls = 'text-foreground font-semibold border-b-2 border-primary pb-0.5';
export const inactiveCls = 'text-muted-foreground hover:text-foreground transition-colors';

export const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 text-sm ${isActive ? activeCls : inactiveCls}`;

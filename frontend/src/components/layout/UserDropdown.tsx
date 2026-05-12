import { ChevronDown, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User as UserType } from '@/types';

interface Props {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  user: UserType | null | undefined;
  roleLabel: string;
  dashboardHref: string;
  onLogout: () => void;
}

export default function UserDropdown({
  open,
  onToggle,
  onClose,
  user,
  roleLabel,
  dashboardHref,
  onLogout,
}: Props) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
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

      {open && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-40"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-md border bg-white shadow-md py-1">
            <Link
              to={dashboardHref}
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

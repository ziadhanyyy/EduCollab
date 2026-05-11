import type { GroupApprovalStatus, JoinRequestStatus, MeetingStatus, MeetingType, NotificationType, UserRole } from '@/types';
import type { Notification } from '@/types';
import axios from 'axios';


export function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    Admin: 'Admin',
    GroupCreator: 'Group Creator',
    Student: 'Student',
  };
  return map[role];
}


export function groupStatusLabel(status: GroupApprovalStatus): string {
  return ['Pending', 'Approved', 'Rejected'][status];
}

export function joinRequestStatusLabel(status: JoinRequestStatus): string {
  return ['Pending', 'Accepted', 'Rejected'][status];
}

export function meetingStatusLabel(status: MeetingStatus): string {
  return ['Scheduled', 'Cancelled', 'Completed'][status];
}

export function meetingTypeLabel(type: MeetingType): string {
  return type === 0 ? 'Online' : 'Offline';
}

export function notificationTypeLabel(type: NotificationType): string {
  const labels = [
    'Meeting Reminder',
    'Join Request Accepted',
    'Join Request Rejected',
    'New Material',
    'New Message',
    'Group Approved',
    'Group Rejected',
    'New Group Pending Review',
    'New Join Request',
  ];
  return labels[type] ?? 'Notification';
}


export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}


export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


export function notificationLink(n: Notification): string {
  switch (n.type) {
    case 0: 
    case 3: 
    case 4:
      return n.groupId ? `/groups/${n.groupId}/space` : '/';
    case 1: 
      return n.groupId ? `/groups/${n.groupId}/space` : '/student/groups';
    case 2: 
      return '/browse';
    case 5: 
    case 6: 
      return '/creator/groups';    case 7: 
      return '/admin/groups';    default:
      return '/';
  }
}


export function extractErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

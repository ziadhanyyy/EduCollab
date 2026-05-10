export type UserRole = 'Admin' | 'GroupCreator' | 'Student';

export interface User {
  id: string;
  userName: string;
  email: string;
  displayName: string;
  createdAt: string;
  role: UserRole;
}


export type MeetingType = 0 | 1;

export type GroupApprovalStatus = 0 | 1 | 2;

export interface Group {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  maxMembers: number;
  meetingType: MeetingType;
  onlineLink: string | null;
  offlineAddress: string | null;
  meetingSchedule: string | null;
  approvalStatus: GroupApprovalStatus;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  memberCount: number;
}

export interface CreateGroupRequest {
  name: string;
  subject: string;
  description?: string;
  maxMembers?: number;
  meetingType?: MeetingType;
  onlineLink?: string;
  offlineAddress?: string;
  meetingSchedule?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  subject?: string;
  description?: string;
  maxMembers?: number;
  meetingType?: MeetingType;
  onlineLink?: string;
  offlineAddress?: string;
  meetingSchedule?: string;
}


export type JoinRequestStatus = 0 | 1 | 2;

export interface JoinRequest {
  id: string;
  groupId: string;
  groupName: string;
  studentId: string;
  studentName: string;
  status: JoinRequestStatus;
  requestedAt: string;
}

export type MeetingStatus = 0 | 1 | 2;

export interface Meeting {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string | null;
  offlineAddress: string | null;
  status: MeetingStatus;
  organizerId: string;
  organizerName: string;
  createdAt: string;
}

export interface CreateMeetingRequest {
  groupId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes?: number;
  meetingUrl?: string;
  offlineAddress?: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  meetingUrl?: string;
  offlineAddress?: string;
  status?: MeetingStatus;
}


export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

export interface SendMessageRequest {
  groupId: string;
  content: string;
}


export interface StudyMaterial {
  id: string;
  groupId: string;
  uploaderId: string;
  uploaderName: string;
  originalFileName: string;
  fileUrl: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  tags: string[];
}
export type NotificationType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  groupId: string | null;
  isRead: boolean;
  createdAt: string;
}


export interface PendingCreator {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  userName: string;
  role?: 'Student' | 'GroupCreator';
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface ApiError {
  error: string;
}


export interface GroupSearchParams {
  subject?: string;
  location?: string;
  meetingSchedule?: string;
  page?: number;
  pageSize?: number;
}

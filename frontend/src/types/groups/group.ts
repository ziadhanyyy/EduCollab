export type GroupFormValues = {
  name: string;
  subject: string;
  description: string;
  maxMembers: string;
  meetingType: '0' | '1';
  onlineLink: string;
  offlineAddress: string;
  meetingSchedule: string;
};

export type GroupFormErrors = Partial<Record<keyof GroupFormValues, string>>;

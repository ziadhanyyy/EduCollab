export type Role = 'Student' | 'GroupCreator';

export interface RegFormState {
  userName: string;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

export interface RegFormErrors {
  userName?: string;
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

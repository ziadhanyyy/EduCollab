import type { FormErrors, FormState } from '@/types/auth/Login';
import type { RegFormErrors, RegFormState } from '@/types/auth/Register';
import type { GroupFormErrors, GroupFormValues } from '@/types/groups/group';

export function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

export function validateReg(values: RegFormState): RegFormErrors {
  const errors: RegFormErrors = {};
  if (!values.displayName?.trim()) {
    errors.displayName = 'Display name is required.';
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  } else if (!/\d/.test(values.password)) {
    errors.password = 'Password must contain at least one digit.';
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export function GroupValidate(v: GroupFormValues): GroupFormErrors {
  const e: GroupFormErrors = {};
  if (!v.name.trim()) e.name = 'Group name is required.';
  if (!v.subject.trim()) e.subject = 'Subject is required.';
  const max = Number(v.maxMembers);
  if (v.maxMembers && (Number.isNaN(max) || max < 2)) e.maxMembers = 'Must be at least 2.';
  if (v.meetingType === '0' && !v.onlineLink.trim())
    e.onlineLink = 'Online link is required for online groups.';
  if (v.meetingType === '1' && !v.offlineAddress.trim())
    e.offlineAddress = 'Address is required for offline groups.';
  return e;
}

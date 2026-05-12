export const SUBJECTS = [
  'Chemistry',
  'Mathematics',
  'Computer Science',
  'Languages',
  'Physics',
  'Biology',
];

export const TIME_OPTIONS = [
  { value: 'any', label: 'Any Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export const SUBJECT_COLORS: Record<string, string> = {
  chemistry: 'bg-sky-100 text-sky-700',
  mathematics: 'bg-violet-100 text-violet-700',
  'computer science': 'bg-indigo-100 text-indigo-700',
  languages: 'bg-teal-100 text-teal-700',
  physics: 'bg-orange-100 text-orange-700',
  biology: 'bg-green-100 text-green-700',
};

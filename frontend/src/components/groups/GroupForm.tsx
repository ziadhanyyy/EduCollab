import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Monitor, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { Group, CreateGroupRequest, UpdateGroupRequest } from '@/types';

type FormValues = {
  name: string;
  subject: string;
  description: string;
  maxMembers: string;
  meetingType: '0' | '1';
  onlineLink: string;
  offlineAddress: string;
  meetingSchedule: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.name.trim())    e.name    = 'Group name is required.';
  if (!v.subject.trim()) e.subject = 'Subject is required.';
  const max = Number(v.maxMembers);
  if (v.maxMembers && (isNaN(max) || max < 2)) e.maxMembers = 'Must be at least 2.';
  if (v.meetingType === '0' && !v.onlineLink.trim())   e.onlineLink    = 'Online link is required for online groups.';
  if (v.meetingType === '1' && !v.offlineAddress.trim()) e.offlineAddress = 'Address is required for offline groups.';
  return e;
}

interface GroupFormProps {
  initial?: Group;
  onSubmit: (payload: CreateGroupRequest | UpdateGroupRequest) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export default function GroupForm({ initial, onSubmit, submitLabel, loading }: GroupFormProps) {
  const [form, setForm] = useState<FormValues>({
    name:            initial?.name            ?? '',
    subject:         initial?.subject         ?? '',
    description:     initial?.description     ?? '',
    maxMembers:      initial?.maxMembers?.toString() ?? '50',
    meetingType:     initial?.meetingType === 1 ? '1' : '0',
    onlineLink:      initial?.onlineLink      ?? '',
    offlineAddress:  initial?.offlineAddress  ?? '',
    meetingSchedule: initial?.meetingSchedule
      ? new Date(initial.meetingSchedule).toISOString().slice(0, 16)
      : '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!initial) return;
    setForm({
      name:            initial.name            ?? '',
      subject:         initial.subject         ?? '',
      description:     initial.description     ?? '',
      maxMembers:      initial.maxMembers?.toString() ?? '50',
      meetingType:     initial.meetingType === 1 ? '1' : '0',
      onlineLink:      initial.onlineLink      ?? '',
      offlineAddress:  initial.offlineAddress  ?? '',
      meetingSchedule: initial.meetingSchedule
        ? new Date(initial.meetingSchedule).toISOString().slice(0, 16)
        : '',
    });
  }, [initial?.id]); 

  function set(field: keyof FormValues, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload: CreateGroupRequest = {
      name:    form.name.trim(),
      subject: form.subject.trim(),
      ...(form.description.trim() && { description: form.description.trim() }),
      maxMembers:  Number(form.maxMembers) || 50,
      meetingType: Number(form.meetingType) as 0 | 1,
      ...(form.meetingType === '0' && { onlineLink: form.onlineLink.trim() }),
      ...(form.meetingType === '1' && { offlineAddress: form.offlineAddress.trim() }),
      ...(form.meetingSchedule && { meetingSchedule: new Date(form.meetingSchedule).toISOString() }),
    };

    await onSubmit(payload);
  }

  const field = (id: keyof FormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        className={errors[id] ? 'border-destructive' : ''}
        {...props}
      />
      {errors[id] && <p className="text-xs text-destructive">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Basic Info</h2>

          {field('name',    'Group name *',{ placeholder: 'e.g. Advanced Organic Chemistry' })}
          {field('subject', 'Subject *', { placeholder: 'e.g. Chemistry' })}

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What will this group study? (optional)"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
            />
          </div>

          {field('maxMembers', 'Max members', { type: 'number', min: 2, placeholder: '50' })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Meeting Details</h2>

          {/* Meeting type toggle */}
          <div className="space-y-1.5">
            <Label>Meeting type</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['0', '1'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('meetingType', type)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    form.meetingType === type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {type === '0'
                    ? <Monitor className="h-4 w-4" />
                    : <MapPin className="h-4 w-4" />}
                  {type === '0' ? 'Online' : 'Offline'}
                </button>
              ))}
            </div>
          </div>

          {form.meetingType === '0' && (
            <div className="space-y-1.5">
              <Label htmlFor="onlineLink">Online link *</Label>
              <Input
                id="onlineLink"
                value={form.onlineLink}
                onChange={(e) => set('onlineLink', e.target.value)}
                placeholder="https://meet.google.com/..."
                className={errors.onlineLink ? 'border-destructive' : ''}
              />
              {errors.onlineLink && <p className="text-xs text-destructive">{errors.onlineLink}</p>}
            </div>
          )}

          {form.meetingType === '1' && (
            <div className="space-y-1.5">
              <Label htmlFor="offlineAddress">Location / address *</Label>
              <Input
                id="offlineAddress"
                value={form.offlineAddress}
                onChange={(e) => set('offlineAddress', e.target.value)}
                placeholder="Library Room 302"
                className={errors.offlineAddress ? 'border-destructive' : ''}
              />
              {errors.offlineAddress && <p className="text-xs text-destructive">{errors.offlineAddress}</p>}
            </div>
          )}

          {field('meetingSchedule', 'Meeting schedule (optional)', { type: 'datetime-local' })}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

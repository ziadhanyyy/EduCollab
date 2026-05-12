import { Eye, EyeOff, GraduationCap, Loader2, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import type { RegisterRequest, RegisterResponse } from '@/types';
import type { RegFormErrors, RegFormState, Role } from '@/types/auth/Register';
import { extractErrorMessage } from '@/utils/helpers';
import { validateReg } from '@/utils/validator';
import { CardContent, CardFooter } from '../ui/card';
import RoleCard from './RoleCard';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<RegFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<RegFormState>({
    userName: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }
  function selectRole(role: Role) {
    setForm((prev) => ({ ...prev, role }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateReg(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterRequest = {
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        userName: form.userName,
        role: form.role,
      };
      const { data } = await api.post<RegisterResponse>('/auth/register', payload);
      if (form.role === 'GroupCreator') {
        toast.success('Account created! Awaiting admin approval before you can log in.');
      } else {
        toast.success(data.message || 'Account created! You can now log in.');
      }
      navigate('/login');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} noValidate>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>I am a…</Label>
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              active={form.role === 'Student'}
              onClick={() => selectRole('Student')}
              icon={<GraduationCap className="h-5 w-5" />}
              title="Student"
              description="Browse & join groups"
            />
            <RoleCard
              active={form.role === 'GroupCreator'}
              onClick={() => selectRole('GroupCreator')}
              icon={<Users className="h-5 w-5" />}
              title="Group Creator"
              description="Create & manage groups"
            />
          </div>
          {form.role === 'GroupCreator' && (
            <p className="text-xs text-muted-foreground mt-1">
              Group Creator accounts require admin approval before login.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="userName">User name</Label>
          <Input
            id="userName"
            name="userName"
            autoComplete="name"
            placeholder="Alex Johnson"
            value={form.userName}
            onChange={handleChange}
            aria-invalid={!!errors.userName}
            className={errors.userName ? 'border-destructive' : ''}
          />
          {errors.userName && <p className="text-xs text-destructive">{errors.userName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            name="displayName"
            autoComplete="name"
            placeholder="Alex Johnson"
            value={form.displayName}
            onChange={handleChange}
            aria-invalid={!!errors.displayName}
            className={errors.displayName ? 'border-destructive' : ''}
          />
          {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min 6 chars, at least one digit"
              value={form.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            aria-invalid={!!errors.confirmPassword}
            className={errors.confirmPassword ? 'border-destructive' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </form>
  );
};

export default RegisterForm;

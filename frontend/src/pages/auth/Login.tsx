import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pendingNav, setPendingNav] = useState<string | null>(null);

  useEffect(() => {
    if (pendingNav && user) {
      navigate(pendingNav, { replace: true });
      setPendingNav(null);
    }
  }, [user, pendingNav, navigate]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            EduCollab
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}

import { BookOpen } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            EduCollab
          </div>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Join EduCollab and start learning together</CardDescription>
          </CardHeader>
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
}

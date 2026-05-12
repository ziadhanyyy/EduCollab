import { Bell, BookOpen, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Join Study Groups',
    description: 'Browse and join approved study groups that match your subject and schedule.',
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: 'Share Materials',
    description: 'Upload and download study materials, tag files, and search by topic.',
  },
  {
    icon: <Bell className="h-6 w-6 text-primary" />,
    title: 'Stay Notified',
    description: 'Get real-time reminders for meetings and updates from your groups.',
  },
];

export default function Home() {
  return (
    <div className="space-y-20 py-10">
      {/* Hero */}
      <section className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
          <BookOpen className="h-4 w-4" />
          Collaborative Learning Platform
        </div>
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Learn better, <span className="text-primary">together.</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          EduCollab connects students with study groups, shared materials, and real-time discussions
          — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/browse">Browse Study Groups</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {features.map((f) => (
          <Card key={f.title} className="text-center">
            <CardContent className="pt-8 pb-6 space-y-3">
              <div className="flex justify-center">{f.icon}</div>
              <h3 className="font-semibold text-base">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

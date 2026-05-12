import { ArrowRight } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  href: string;
  loading: boolean;
  color: string;
}

function StatCard({ title, value, icon, href, loading, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <span className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-7 w-10 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{value ?? 0}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to={href}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default StatCard;

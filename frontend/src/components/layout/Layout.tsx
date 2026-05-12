import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

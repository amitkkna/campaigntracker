'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <Header />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

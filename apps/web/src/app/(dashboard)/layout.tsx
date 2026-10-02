'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/common/theme-toggle';
import {
  LayoutDashboard,
  Bookmark,
  History,
  MessageSquare,
  FileText,
  User,
  Shield,
  LogOut,
  PenTool,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Saved Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
  { name: 'Reading History', href: '/dashboard/history', icon: History },
  { name: 'My Comments', href: '/dashboard/comments', icon: MessageSquare },
  { name: 'Contributor Posts', href: '/dashboard/guest-posts', icon: FileText },
  { name: 'Profile Information', href: '/dashboard/profile', icon: User },
  { name: 'Security & Sessions', href: '/dashboard/settings', icon: Shield },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-mono text-sm">
        <div className="space-y-2 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/70 bg-card/40 flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Portal
            </Link>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-base text-foreground tracking-tight">
                Nexus<span className="text-primary font-light">Reader</span>
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary font-bold">
                DASHBOARD
              </span>
            </div>
          </div>

          {/* User Preview */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs font-mono shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate font-mono">@{user?.username}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/40 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-muted-foreground">Theme</span>
            <ThemeToggle showLabel={false} />
          </div>

          <Link
            href="/guest-post/submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-all font-mono"
          >
            <PenTool className="h-3.5 w-3.5" />
            <span>Submit Guest Post</span>
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Body */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-background p-4 sm:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

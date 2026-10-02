'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/common/theme-toggle';
import {
  LayoutDashboard,
  FileText,
  Inbox,
  FolderTree,
  Cpu,
  Bookmark,
  Layers,
  Tag,
  Users,
  Image,
  MessageSquare,
  Mail,
  Search,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  PenSquare,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Articles Management', href: '/admin/articles', icon: FileText },
  { name: 'Guest Post Queue', href: '/admin/guest-posts', icon: Inbox },
  { name: 'Series & Roadmaps', href: '/admin/series', icon: Layers },
  { name: 'Taxonomy & Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Technology Hubs', href: '/admin/technologies', icon: Cpu },
  { name: 'Article Types', href: '/admin/article-types', icon: Bookmark },
  { name: 'Tags Taxonomy', href: '/admin/tags', icon: Tag },
  { name: 'Staff & User Directory', href: '/admin/users', icon: Users },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'Comment Moderation', href: '/admin/comments', icon: MessageSquare },
  { name: 'Newsletter & Dispatch', href: '/admin/newsletter', icon: Mail },
  { name: 'Developer Config', href: '/admin/dev-config', icon: Sliders },
  { name: 'SEO & Performance', href: '/admin/seo', icon: Search },
  { name: 'Security Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isStaff =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'EDITOR' ||
    user?.role === 'AUTHOR';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (!isStaff) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isStaff, pathname, router]);

  const isEditorPage =
    pathname?.includes('/admin/articles/') &&
    (pathname.endsWith('/edit') || pathname.endsWith('/new'));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-mono text-sm">
        <div className="space-y-2 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row text-foreground">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/70 bg-card/60 flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          {/* Brand & Badge */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-mono font-bold text-base text-foreground tracking-tight">
                Nexus<span className="text-primary font-light">Admin</span>
              </Link>
              <span className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono text-rose-400 font-bold">
                CMS
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> View Live Portal <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Staff Info */}
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs font-mono shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary font-semibold">
                <ShieldCheck className="h-3 w-3" /> {user?.role}
              </span>
            </div>
          </div>

          {/* Quick Write Action */}
          <Link
            href="/admin/articles/new"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:opacity-90 transition-all font-mono shadow-sm"
          >
            <PenSquare className="h-3.5 w-3.5" />
            <span>New Technical Article</span>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
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
            href="/dashboard"
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-all"
          >
            <span>Reader Dashboard</span>
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

      {/* Main Content Area */}
      {isEditorPage ? (
        <main className="flex-1 overflow-hidden h-screen bg-background flex flex-col min-w-0">
          {children}
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto min-h-screen bg-background p-4 sm:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </main>
      )}
    </div>
  );
}

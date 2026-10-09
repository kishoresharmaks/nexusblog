'use client';

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Bookmark,
  BookOpen,
  Cpu,
  Home,
  Layers,
  LayoutDashboard,
  LogIn,
  LogOut,
  PenTool,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/brand-logo';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { useAuth } from '@/context/auth-context';
import { readingHistoryApi } from '@/lib/api-client';

interface DesktopNavigationPanelProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

interface RecentArticle {
  key: string;
  slug: string;
  title: string;
  category: string;
  lastViewedAt?: string;
}

interface HistoryRecord {
  id?: string;
  articleId?: string;
  slug?: string;
  title?: string;
  category?: string | { name?: string };
  lastViewedAt?: string;
  article?: {
    id?: string;
    slug?: string;
    title?: string;
    category?: { name?: string };
  };
}

const PUBLIC_LINKS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Guides', href: '/articles', icon: BookOpen },
  { label: 'Incidents', href: '/incidents', icon: Activity },
  { label: 'Architecture', href: '/categories', icon: Layers },
  { label: 'Technologies', href: '/technologies', icon: Cpu },
  { label: 'Case Studies', href: '/case-studies', icon: Sparkles },
  { label: 'Contribute', href: '/write-for-us', icon: PenTool },
];

const QUICK_LINKS = [
  { label: 'Articles & Guides', detail: 'Engineering blueprints', href: '/articles', icon: BookOpen, tone: 'text-sky-500 bg-sky-500/10' },
  { label: 'Production Incidents', detail: 'Sourced failure timelines', href: '/incidents', icon: Activity, tone: 'text-rose-500 bg-rose-500/10' },
  { label: 'Architecture Topics', detail: 'Browse by domain', href: '/categories', icon: Layers, tone: 'text-indigo-500 bg-indigo-500/10' },
  { label: 'Technologies', detail: 'Infrastructure & databases', href: '/technologies', icon: Cpu, tone: 'text-emerald-500 bg-emerald-500/10' },
];

function toRecentArticle(value: unknown): RecentArticle | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as HistoryRecord;
  const slug = record.article?.slug || record.slug;
  if (!slug) return null;

  const category = record.article?.category?.name ||
    (typeof record.category === 'string' ? record.category : record.category?.name) ||
    'Engineering';

  return {
    key: record.article?.id || record.articleId || slug,
    slug,
    title: record.article?.title || record.title || 'Engineering guide',
    category,
    lastViewedAt: record.lastViewedAt,
  };
}

function responseItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const response = value as { items?: unknown; data?: unknown };
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function relativeTime(value?: string) {
  if (!value) return 'Recently';
  const viewedAt = new Date(value).getTime();
  if (!Number.isFinite(viewedAt) || viewedAt > Date.now()) return 'Recently';

  const minutes = Math.floor((Date.now() - viewedAt) / 60_000);
  if (minutes < 60) return minutes < 2 ? 'Just now' : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days} day${days === 1 ? '' : 's'} ago` : 'Earlier';
}

function mergeRecent(remote: RecentArticle[], local: RecentArticle[]) {
  const seen = new Set<string>();
  return [...remote, ...local]
    .filter((item) => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .sort((a, b) => (Date.parse(b.lastViewedAt || '') || 0) - (Date.parse(a.lastViewedAt || '') || 0))
    .slice(0, 3);
}

export function DesktopNavigationPanel({ open, onClose, onOpenSearch }: DesktopNavigationPanelProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [desktopViewport, setDesktopViewport] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  const isStaff = user && ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);
  const workspaceHref = isStaff ? '/admin' : '/dashboard';

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1536px)');
    const updateViewport = () => setDesktopViewport(media.matches);
    updateViewport();
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || ''));
    media.addEventListener('change', updateViewport);
    return () => media.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!open || !desktopViewport) return;

    let cancelled = false;
    const loadRecent = async () => {
      setLoadingRecent(false);
      let local: RecentArticle[] = [];
      try {
        const stored = localStorage.getItem('nexus_reading_history');
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        local = responseItems(parsed).map(toRecentArticle).filter((item): item is RecentArticle => Boolean(item));
      } catch {
        local = [];
      }

      if (!cancelled) setRecentArticles(local.slice(0, 3));
      if (!isAuthenticated) return;

      setLoadingRecent(local.length === 0);
      try {
        const response = await readingHistoryApi.getUserHistory();
        const remote = responseItems(response)
          .map(toRecentArticle)
          .filter((item): item is RecentArticle => Boolean(item));
        if (!cancelled) setRecentArticles(mergeRecent(remote, local));
      } catch {
        // Keep locally stored history visible when the API is unavailable.
      } finally {
        if (!cancelled) setLoadingRecent(false);
      }
    };

    void loadRecent();
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated, desktopViewport]);

  useEffect(() => {
    if (!open || !desktopViewport || !panelRef.current?.getClientRects().length) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current.focus();
    return () => previousFocus?.focus();
  }, [open, desktopViewport]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open || !desktopViewport) return null;

  const accountLinks = isAuthenticated
    ? [
        { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
        { label: 'Workspace', href: workspaceHref, icon: LayoutDashboard },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    : [];

  return createPortal(
    <div className="fixed inset-0 z-[9998] hidden 2xl:flex justify-end">
      <button
        type="button"
        aria-label="Close navigation workspace"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-150"
      />

      <aside
        id="desktop-navigation-workspace"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="desktop-navigation-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative z-10 my-2 mr-2 flex h-[calc(100dvh-1rem)] w-[min(92vw,760px)] flex-col overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl animate-in slide-in-from-right-8 fade-in duration-200 focus:outline-none"
      >
        <header className="relative flex h-[92px] shrink-0 items-center justify-between overflow-hidden border-b border-white/10 bg-zinc-950 px-6 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-20 h-48 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
          <Link href="/" onClick={onClose} className="relative z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <BrandLogo variant="compact" size="md" subtitle="SYSTEMS PORTAL" />
          </Link>
          <div className="relative z-10 flex items-center gap-3">
            <span className="hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-zinc-300 sm:inline">ESC</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation workspace"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav aria-label="Site navigation" className="flex w-[156px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-border/70 bg-muted/35 px-2.5 py-4">
            {PUBLIC_LINKS.map(({ label, href, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-600 dark:text-emerald-300' : ''}`} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}

            {accountLinks.length > 0 && (
              <>
                <div className="my-2 border-t border-border/70" />
                <p className="px-2.5 pb-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Your space</p>
                {accountLinks.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 text-left text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">Ask or search anything...</span>
              <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-2 py-1 font-mono text-[10px] sm:inline">{isMac ? '⌘ + K' : 'Ctrl + K'}</kbd>
            </button>

            <section className="relative mt-3 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-card to-card p-5">
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
              <p className="relative text-xs text-muted-foreground">{user ? 'Welcome back,' : 'Welcome to NexusNation'}</p>
              <h1 id="desktop-navigation-title" className="relative mt-1 text-2xl font-bold tracking-tight text-foreground">
                {user ? user.name.split(' ')[0] : 'Explore engineering'}
                {user && <span aria-hidden="true" className="ml-2">👋</span>}
              </h1>
              <p className="relative mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Continue learning through practical guides, architecture patterns, and real incident timelines.
              </p>
            </section>

            <section className="mt-5" aria-labelledby="desktop-quick-actions">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 id="desktop-quick-actions" className="text-sm font-semibold text-foreground">Quick actions</h2>
                <Link href="/articles" onClick={onClose} className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {QUICK_LINKS.map(({ label, detail, href, icon: Icon, tone }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="group flex min-h-[68px] min-w-0 items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 transition-colors hover:border-primary/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">{label}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{detail}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-5" aria-labelledby="desktop-recently-visited">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 id="desktop-recently-visited" className="text-sm font-semibold text-foreground">Recently visited</h2>
                {isAuthenticated && <Link href="/dashboard/history" onClick={onClose} className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary">View history</Link>}
              </div>
              {recentArticles.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {recentArticles.map((article) => (
                    <Link
                      key={article.key}
                      href={`/articles/${article.slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-3 py-2.5 first:pt-1 last:pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><BookOpen className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-foreground group-hover:text-primary">{article.title}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{article.category} · {relativeTime(article.lastViewedAt)}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              ) : loadingRecent ? (
                <div className="space-y-3 py-2" aria-label="Loading recent articles">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 px-3 py-4 text-xs text-muted-foreground">
                  Articles you read will appear here.
                </div>
              )}
            </section>
          </main>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-muted/25 px-4 py-3 sm:px-5">
          {user ? (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-mono text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-foreground">{user.name}</span>
                <span className="block truncate font-mono text-[10px] text-muted-foreground">@{user.username} · {user.role}</span>
              </span>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              <Link href="/login" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
              <Link href="/register" onClick={onClose} className="rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-85">Join free</Link>
            </div>
          )}
          <div className="flex shrink-0 items-center gap-2">
            {user && (
              <button type="button" onClick={() => { onClose(); void logout(); }} aria-label="Sign out" title="Sign out" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <LogOut className="h-4 w-4" />
              </button>
            )}
            <ThemeToggle className="rounded-xl border border-border bg-card shadow-xs" />
          </div>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}

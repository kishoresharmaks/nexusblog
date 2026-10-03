'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AdminSidebarProvider, useAdminSidebar } from '@/context/admin-sidebar-context';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { BrandLogo } from '@/components/common/brand-logo';
import { SearchCommand } from '@/components/public/search-command';
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
  Image as ImageIcon,
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
  FileCode2,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  User,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview & Insights',
    items: [
      { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
      { name: 'Security Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
    ],
  },
  {
    label: 'Editorial & Content',
    items: [
      { name: 'Articles Management', href: '/admin/articles', icon: FileText },
      { name: 'Guest Post Queue', href: '/admin/guest-posts', icon: Inbox },
      { name: 'Pages & Legal CMS', href: '/admin/pages', icon: FileCode2 },
      { name: 'Series & Roadmaps', href: '/admin/series', icon: Layers },
      { name: 'Comment Moderation', href: '/admin/comments', icon: MessageSquare },
    ],
  },
  {
    label: 'Taxonomy & Stacks',
    items: [
      { name: 'Taxonomy & Categories', href: '/admin/categories', icon: FolderTree },
      { name: 'Technology Hubs', href: '/admin/technologies', icon: Cpu },
      { name: 'Article Types', href: '/admin/article-types', icon: Bookmark },
      { name: 'Tags Taxonomy', href: '/admin/tags', icon: Tag },
    ],
  },
  {
    label: 'Platform & Operations',
    items: [
      { name: 'Staff & User Directory', href: '/admin/users', icon: Users },
      { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
      { name: 'Newsletter & Dispatch', href: '/admin/newsletter', icon: Mail },
      { name: 'Developer Config', href: '/admin/dev-config', icon: Sliders },
      { name: 'SEO & Performance', href: '/admin/seo', icon: Search },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminSidebarProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { isCollapsed, toggleSidebar, isEditorPage } = useAdminSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  const isStaff =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'EDITOR' ||
    user?.role === 'AUTHOR';

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || ''));
    }
  }, []);

  // Authentication guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (!isStaff) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isStaff, pathname, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Outside click listener for user dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Determine current active page label for breadcrumbs
  const allNavItems = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
  const activeNavItem =
    allNavItems.find((item) =>
      item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href),
    ) || { name: 'Editorial Workspace', icon: ShieldCheck };

  const ActiveIcon = activeNavItem.icon;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-mono text-sm">
        <div className="space-y-3 text-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Verifying staff credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Global Command Search Dialog */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Laptop & Large screens) */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex border-r border-border/70 bg-card/60 backdrop-blur-xl flex-col justify-between shrink-0 sticky top-0 h-screen z-40 transition-all duration-300 ease-in-out ${
          isCollapsed
            ? 'w-0 opacity-0 -translate-x-full border-r-0 pointer-events-none overflow-hidden'
            : 'w-64 lg:w-72 opacity-100 translate-x-0 overflow-hidden'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 lg:p-5 border-b border-border/40 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-block group focus:outline-none">
              <BrandLogo variant="admin" size="sm" showPulse={true} pulseColor="emerald" />
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-3 w-3" />
              <span>Live Portal</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </Link>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>STAFF</span>
            </span>
          </div>
        </div>

        {/* Staff Identity & Quick Action */}
        <div className="p-3 lg:p-4 border-b border-border/30 bg-muted/20 space-y-3 shrink-0">
          <div className="rounded-xl border border-border/60 bg-card/80 p-2.5 flex items-center space-x-3 shadow-2xs">
            <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary font-bold flex items-center justify-center text-xs font-mono shrink-0 border border-primary/20">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate leading-tight">{user?.name}</p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-primary font-semibold pt-0.5">
                <ShieldCheck className="h-3 w-3" />
                <span>{user?.role}</span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/articles/new"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-xs font-bold hover:opacity-90 transition-all font-mono shadow-xs group"
          >
            <PenSquare className="h-3.5 w-3.5 group-hover:rotate-6 transition-transform" />
            <span>New Technical Article</span>
          </Link>
        </div>

        {/* Scrollable Navigation Deck */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar text-xs">
          {ADMIN_NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 pb-1.5 font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 lg:p-4 border-t border-border/40 bg-card/80 space-y-2 shrink-0">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono text-muted-foreground">Theme Mode</span>
            <ThemeToggle showLabel={false} className="rounded-lg" />
          </div>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background hover:bg-muted px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-all shadow-2xs"
          >
            <User className="h-3.5 w-3.5" />
            <span>Reader Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE STICKY NAVBAR (Phones & Tablets) */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl shrink-0">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close admin navigation' : 'Open admin navigation'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shadow-2xs"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <Link href="/admin" className="focus:outline-none">
              <BrandLogo variant="admin" size="sm" showPulse={true} pulseColor="emerald" />
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              title="Command Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <ThemeToggle className="rounded-xl border border-border bg-card shadow-2xs" />

            <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary font-mono font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OVER SHEET DRAWER (Overlay via Portal) */}
      {/* ========================================================================= */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="md:hidden fixed inset-0 z-[9999] flex justify-start overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <aside
            className="relative z-10 flex h-[100dvh] w-full max-w-[320px] sm:max-w-sm flex-col bg-background/98 backdrop-blur-3xl border-r border-border shadow-2xl animate-drawer-in-left overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Drawer"
          >
            {/* Top Accent Gradient */}
            <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-primary to-sky-500 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5 shrink-0 bg-muted/20">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2"
              >
                <BrandLogo variant="admin" size="sm" showPulse={true} pulseColor="emerald" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer font-mono text-xs shadow-2xs"
              >
                <X className="h-4 w-4" />
                <span className="text-[10px]">ESC</span>
              </button>
            </div>

            {/* Staff Info Card & Fast Write */}
            <div className="p-4 border-b border-border/40 bg-muted/10 space-y-3 shrink-0">
              <div className="rounded-xl border border-border/70 bg-card p-3 flex items-center space-x-3 shadow-2xs">
                <div className="h-9 w-9 rounded-lg bg-primary/20 text-primary font-mono font-bold flex items-center justify-center text-sm border border-primary/30">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary font-semibold">
                    <ShieldCheck className="h-3 w-3" /> {user?.role}
                  </span>
                </div>
              </div>

              <Link
                href="/admin/articles/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-xs font-bold font-mono shadow-xs"
              >
                <PenSquare className="h-3.5 w-3.5" />
                <span>New Technical Article</span>
              </Link>
            </div>

            {/* Main Navigation Deck */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
              {ADMIN_NAV_GROUPS.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  <p className="px-3 pb-1 font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/admin'
                          ? pathname === '/admin'
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </div>
                          {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-border/40 bg-card/80 space-y-2 shrink-0">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                <User className="h-3.5 w-3.5" />
                <span>Switch to Reader Dashboard</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Live Public Portal</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA WITH DESKTOP TOP NAVBAR */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Top Navbar Bar */}
        {!isEditorPage && (
          <header className="hidden md:flex h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl px-6 lg:px-8 items-center justify-between shrink-0 z-30">
            {/* Left: Sidebar Toggle (when collapsed), Breadcrumbs & Current Section */}
            <div className="flex items-center space-x-2.5">
              {isCollapsed && (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs mr-1"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              )}
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <ActiveIcon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span>Editorial Admin</span>
                  <span>/</span>
                  <span className="text-foreground font-semibold">{activeNavItem.name}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Command Search, Live Portal, Theme, Profile Dropdown */}
            <div className="flex items-center space-x-3">
              {/* Quick Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shadow-2xs font-mono"
                title="Global Search (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs">Quick search...</span>
                <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border">
                  {isMac ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </button>

              {/* Fast Write CTA */}
              <Link
                href="/admin/articles/new"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-xs"
              >
                <PenSquare className="h-3.5 w-3.5" />
                <span>Write</span>
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle className="rounded-xl border border-border bg-card shadow-2xs" />

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 text-xs hover:border-primary/50 transition-all cursor-pointer shadow-2xs focus:outline-none"
                  aria-label="Staff Profile"
                >
                  <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary font-mono font-bold flex items-center justify-center text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-foreground' : ''
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-card/95 backdrop-blur-2xl p-1.5 shadow-2xl text-xs space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 bg-muted/40 rounded-xl mb-1 border-b border-border/40">
                      <p className="font-bold text-foreground truncate">{user?.name}</p>
                      <p className="text-[11px] font-mono text-primary font-semibold">{user?.role}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>Reader Dashboard</span>
                    </Link>

                    <Link
                      href="/admin/dev-config"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Developer Config</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Home className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Live Portal</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>

                    <div className="border-t border-border/40 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left font-medium cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Children Content */}
        {isEditorPage ? (
          <main className="flex-1 overflow-hidden h-full bg-background flex flex-col min-w-0">
            {children}
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto min-h-0 bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">{children}</div>
          </main>
        )}
      </div>
    </div>
  );
}

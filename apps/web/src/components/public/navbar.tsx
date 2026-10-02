'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { siteConfig } from '@nexus/config';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { BrandLogo } from '@/components/common/brand-logo';
import {
  Search,
  PenTool,
  User,
  LayoutDashboard,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Layers,
  Cpu,
  Bookmark,
  History,
  Settings,
  Sparkles,
  ArrowRight,
  BookOpen,
  Database,
  Server,
  Cloud,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Compass,
  FileCode2,
  Rss,
  Activity,
  Flame,
  Tag,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Mega dropdown state for desktop
  const [activeDropdown, setActiveDropdown] = useState<'categories' | 'technologies' | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Accordion state for mobile drawer
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileTechOpen, setMobileTechOpen] = useState(false);

  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || ''));
    }
  }, []);

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setActiveDropdown(null);
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

  // Close dropdown on outside click
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMouseEnter = (type: 'categories' | 'technologies') => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isStaff = user && ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);

  // Featured Categories for Mega Menu
  const categoryHighlights = [
    {
      name: 'System Design',
      slug: 'system-design',
      desc: 'Distributed architectures, consensus protocols & high-availability blueprints.',
      icon: Server,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      name: 'Backend Engineering',
      slug: 'backend-engineering',
      desc: 'Concurrency models, lock-free datastructures & low-latency execution.',
      icon: Terminal,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      name: 'Distributed Systems',
      slug: 'distributed-systems',
      desc: 'Raft, Paxos, partition tolerance, message brokers & event sourcing.',
      icon: Layers,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      name: 'Databases & Sharding',
      slug: 'databases',
      desc: 'Zero-downtime migrations, read replicas, LSM trees & query optimization.',
      icon: Database,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      name: 'DevOps & Cloud',
      slug: 'devops',
      desc: 'Kubernetes orchestration, Docker internals, CI/CD & observability.',
      icon: Cloud,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      name: 'APIs & Microservices',
      slug: 'apis',
      desc: 'gRPC protocols, GraphQL federations, REST design & rate limiters.',
      icon: Compass,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
  ];

  // Featured Technologies for Mega Menu
  const technologyTags = [
    { name: 'Redis', slug: 'redis', tag: '#redis', role: 'In-Memory Cache & Pub/Sub' },
    { name: 'Kafka', slug: 'kafka', tag: '#kafka', role: 'Distributed Event Streaming' },
    { name: 'PostgreSQL', slug: 'postgresql', tag: '#postgresql', role: 'Relational ACID Engine' },
    { name: 'Kubernetes', slug: 'kubernetes', tag: '#kubernetes', role: 'Container Orchestration' },
    { name: 'Docker', slug: 'docker', tag: '#docker', role: 'Container Virtualization' },
    { name: 'NestJS', slug: 'nestjs', tag: '#nestjs', role: 'Enterprise TypeScript Backend' },
    { name: 'MongoDB', slug: 'mongodb', tag: '#mongodb', role: 'Document Database' },
    { name: 'Next.js', slug: 'nextjs', tag: '#nextjs', role: 'React Server Framework' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl transition-all">
      {/* Top micro-line gradient for high-end aesthetic */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Identity & Desktop Navigation */}
        <div className="flex items-center space-x-7">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2.5 group focus:outline-none"
            aria-label={`${siteConfig.name} Home`}
          >
            <BrandLogo
              variant="navbar"
              size="md"
              showPulse={true}
              pulseColor="emerald"
              priority={true}
            />
          </Link>

          {/* Desktop Navigation Links with Mega Dropdowns */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            {/* Articles */}
            <Link
              href="/articles"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-foreground hover:bg-muted/50 ${
                pathname === '/articles' || pathname.startsWith('/articles/')
                  ? 'text-foreground font-semibold bg-muted/60'
                  : 'text-muted-foreground'
              }`}
            >
              Articles
            </Link>

            {/* Categories (with Mega Dropdown) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('categories')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:text-foreground hover:bg-muted/50 cursor-pointer ${
                  pathname.startsWith('/categories') || activeDropdown === 'categories'
                    ? 'text-foreground font-semibold bg-muted/60'
                    : 'text-muted-foreground'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    activeDropdown === 'categories' ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {/* Mega Menu Flyout */}
              {activeDropdown === 'categories' && (
                <div className="absolute top-full left-0 mt-1.5 w-[560px] rounded-2xl border border-border bg-card/95 backdrop-blur-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
                    <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <span>Architecture Taxonomy</span>
                    </span>
                    <Link
                      href="/categories"
                      onClick={() => setActiveDropdown(null)}
                      className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View All Categories</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {categoryHighlights.map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                        >
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${cat.color} group-hover:scale-105 transition-transform`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                              {cat.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {cat.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Technologies (with Mega Dropdown) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('technologies')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:text-foreground hover:bg-muted/50 cursor-pointer ${
                  pathname.startsWith('/technologies') || activeDropdown === 'technologies'
                    ? 'text-foreground font-semibold bg-muted/60'
                    : 'text-muted-foreground'
                }`}
              >
                <span>Technologies</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    activeDropdown === 'technologies' ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {/* Mega Menu Flyout */}
              {activeDropdown === 'technologies' && (
                <div className="absolute top-full left-0 mt-1.5 w-[520px] rounded-2xl border border-border bg-card/95 backdrop-blur-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
                    <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-primary" />
                      <span>Infrastructure Stacks</span>
                    </span>
                    <Link
                      href="/technologies"
                      onClick={() => setActiveDropdown(null)}
                      className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View All Stacks</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {technologyTags.map((tech) => (
                      <Link
                        key={tech.slug}
                        href={`/technologies/${tech.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                            <span>{tech.tag}</span>
                          </span>
                          <p className="text-[10px] text-muted-foreground truncate">{tech.role}</p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Series */}
            <Link
              href="/series"
              className={`px-3 py-1.5 rounded-lg transition-colors hover:text-foreground hover:bg-muted/50 ${
                pathname.startsWith('/series')
                  ? 'text-foreground font-semibold bg-muted/60'
                  : 'text-muted-foreground'
              }`}
            >
              Series
            </Link>

            {/* Write for Us */}
            <Link
              href="/write-for-us"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:text-foreground hover:bg-muted/50 ${
                pathname === '/write-for-us'
                  ? 'text-foreground font-semibold bg-muted/60'
                  : 'text-muted-foreground'
              }`}
            >
              <PenTool className="h-3.5 w-3.5 text-primary/80" />
              <span>Write for Us</span>
            </Link>
          </nav>
        </div>

        {/* Right: Search, Theme Toggle, Contributor Action & Auth */}
        <div className="flex items-center space-x-2.5">
          {/* Global Search Bar (Keyboard trigger) */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="group flex items-center justify-between gap-2 sm:gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground transition-all cursor-pointer shadow-2xs"
            title="Open Command Search"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="hidden md:inline font-sans text-xs">Search blueprints &amp; stacks...</span>
              <span className="inline md:hidden text-xs">Search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border group-hover:border-primary/40 shadow-2xs">
              <span>{isMac ? '⌘' : 'Ctrl'}</span>
              <span>K</span>
            </kbd>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle className="rounded-xl border border-border/80 bg-card/60 hover:bg-muted shadow-2xs" />

          {/* Authenticated State vs Guest */}
          {mounted && isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/80 p-1.5 text-xs hover:border-primary/50 transition-all cursor-pointer shadow-2xs focus:outline-none"
                aria-label="User profile menu"
              >
                <div className="relative h-7 w-7 rounded-lg bg-primary/20 text-primary font-mono font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                  {isStaff && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                  )}
                </div>
                <ChevronDown
                  className={`h-3 w-3 text-muted-foreground transition-transform duration-200 hidden sm:inline ${
                    userDropdownOpen ? 'rotate-180 text-foreground' : ''
                  }`}
                />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card/95 backdrop-blur-2xl p-1.5 shadow-2xl text-xs space-y-1 z-50 font-sans animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  {/* Profile Header */}
                  <div className="px-3.5 py-2.5 border-b border-border/50 bg-muted/30 rounded-xl mb-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground truncate">{user.name}</p>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-muted-foreground truncate font-mono text-[11px] pt-0.5">
                      @{user.username}
                    </p>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                      <span>Reader Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/bookmarks"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Saved Bookmarks</span>
                    </Link>

                    <Link
                      href="/dashboard/history"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Reading History</span>
                    </Link>

                    <Link
                      href="/guest-post/submit"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Submit Blueprint</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </Link>
                  </div>

                  {/* Staff Portal Link */}
                  {isStaff && (
                    <div className="border-t border-border/50 pt-1 mt-1">
                      <Link
                        href="/admin"
                        className="flex items-center justify-between rounded-xl px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5" />
                          <span>Editorial Workspace</span>
                        </div>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Log Out */}
                  <div className="border-t border-border/50 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left font-medium cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold font-mono bg-foreground text-background hover:bg-foreground/90 px-3.5 py-1.5 rounded-xl transition-all shadow-sm hover:scale-[1.02]"
              >
                <span>Join Free</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-xl border border-border/80 bg-card/60 p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shadow-2xs"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sheet Drawer (Overlay + Slide-over via Portal) */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] flex justify-end overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-backdrop-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <aside
            className="relative z-10 flex h-[100dvh] w-full max-w-[340px] sm:max-w-md flex-col bg-background/98 backdrop-blur-3xl border-l border-border shadow-2xl animate-drawer-in overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {/* Top micro-line gradient for tech aesthetic */}
            <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-primary to-sky-500 shrink-0" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0 bg-muted/20">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 group"
              >
                <BrandLogo
                  variant="compact"
                  size="sm"
                  showPulse={true}
                  pulseColor="emerald"
                />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer font-mono text-[11px] shadow-2xs"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
                <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">ESC</span>
              </button>
            </div>

            {/* Search & System Status Quick Bar */}
            <div className="p-4 border-b border-border/40 bg-muted/10 space-y-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenSearch) onOpenSearch();
                }}
                className="flex items-center justify-between w-full rounded-xl border border-border/80 bg-card/90 hover:bg-card px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all font-mono shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  <span>Quick command search...</span>
                </div>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border/80">
                  {isMac ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </button>

              {/* Live Cluster Status */}
              <div className="flex items-center justify-between px-1 text-[10px] font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-semibold">Cluster Operational</span>
                </div>
                <span>Edge p99 &lt; 12ms</span>
              </div>
            </div>

            {/* Main Scrollable Navigation Deck */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-xs">
              {/* Section: Core Blueprints & Publications */}
              <div className="space-y-1">
                <p className="px-2 pb-1 font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Publications &amp; Hub
                </p>

                <Link
                  href="/articles"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                    pathname === '/articles' || pathname.startsWith('/articles/')
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs leading-none">Articles &amp; Guides</p>
                      <p className="text-[10px] text-muted-foreground">Production blueprints &amp; teardowns</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/case-studies"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                    pathname.startsWith('/case-studies')
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs leading-none">Case Studies</p>
                      <p className="text-[10px] text-muted-foreground">Real-world scale &amp; post-mortems</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/series"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                    pathname.startsWith('/series')
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs leading-none">Technical Series</p>
                      <p className="text-[10px] text-muted-foreground">Multi-part masterclass curricula</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/tags"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                    pathname.startsWith('/tags')
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <Tag className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs leading-none">Topic Tags Cloud</p>
                      <p className="text-[10px] text-muted-foreground">Explore by indexed keyword</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/write-for-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                    pathname === '/write-for-us'
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                      <PenTool className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs leading-none">Write for Us</p>
                      <p className="text-[10px] text-muted-foreground">Author guidelines &amp; compensation</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>

              {/* Section: Architecture Categories Accordion */}
              <div className="rounded-2xl border border-border/70 bg-card/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="flex items-center justify-between w-full p-3 font-mono text-xs font-bold text-foreground uppercase tracking-wider hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>Architecture Categories ({categoryHighlights.length})</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      mobileCategoriesOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {mobileCategoriesOpen && (
                  <div className="p-2 pt-0 grid grid-cols-1 gap-1 border-t border-border/40 animate-in fade-in duration-150">
                    {categoryHighlights.map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted text-foreground transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`h-6 w-6 rounded-md flex items-center justify-center border ${cat.color}`}>
                              <IconComponent className="h-3 w-3" />
                            </div>
                            <span className="text-xs font-medium">{cat.name}</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      );
                    })}
                    <Link
                      href="/categories"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mt-1 p-2 text-center text-[11px] font-mono font-bold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors block"
                    >
                      Browse All Categories &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {/* Section: Infrastructure Stacks Accordion */}
              <div className="rounded-2xl border border-border/70 bg-card/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileTechOpen(!mobileTechOpen)}
                  className="flex items-center justify-between w-full p-3 font-mono text-xs font-bold text-foreground uppercase tracking-wider hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span>Infrastructure Stacks</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      mobileTechOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {mobileTechOpen && (
                  <div className="p-3 pt-2 border-t border-border/40 animate-in fade-in duration-150">
                    <div className="flex flex-wrap gap-1.5">
                      {technologyTags.map((tech) => (
                        <Link
                          key={tech.slug}
                          href={`/technologies/${tech.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 font-mono text-[11px] text-foreground transition-colors"
                        >
                          {tech.tag}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/technologies"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mt-2.5 p-2 text-center text-[11px] font-mono font-bold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors block"
                    >
                      View All Stacks &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Bottom Console: Theme & User Session */}
            <div className="border-t border-border/60 bg-muted/25 p-4 space-y-3.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Theme Preference</span>
                </span>
                <ThemeToggle showLabel={true} />
              </div>

              {mounted && isAuthenticated && user ? (
                <div className="space-y-2 rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        @{user.username} • {user.role}
                      </p>
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary font-mono font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground text-center transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/bookmarks"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground text-center transition-colors"
                    >
                      Bookmarks
                    </Link>
                  </div>

                  {isStaff && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold w-full hover:bg-emerald-500/20 transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Editorial Workspace</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-center text-xs font-semibold text-destructive hover:bg-destructive/10 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-xs font-semibold py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center text-xs font-semibold font-mono py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
                  >
                    Join Free &rarr;
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>,
        document.body
      )}
    </header>
  );
}

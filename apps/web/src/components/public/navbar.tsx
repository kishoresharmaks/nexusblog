'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { siteConfig } from '@nexus/config';
import { ThemeToggle } from '@/components/common/theme-toggle';
import {
  Search,
  Sun,
  Moon,
  PenTool,
  User,
  LayoutDashboard,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/articles', label: 'Articles' },
    { href: '/categories', label: 'Categories' },
    { href: '/technologies', label: 'Technologies' },
    { href: '/series', label: 'Series' },
    { href: '/write-for-us', label: 'Write for Us' },
  ];

  const isStaff = user && ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand + Desktop Navigation */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-lg tracking-tight"
          >
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent font-mono">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-5 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-foreground ${
                    isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Theme Toggle & Auth */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Authenticated State vs Guest */}
          {mounted && isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-border p-1 text-xs hover:border-border/80 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card p-1.5 shadow-xl text-xs space-y-1 z-50 font-sans"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-border/40">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-muted-foreground truncate font-mono text-[11px]">
                      @{user.username} • {user.role}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Reader Dashboard</span>
                  </Link>

                  <Link
                    href="/guest-post/submit"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-muted transition-colors"
                  >
                    <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Submit Guest Post</span>
                  </Link>

                  {isStaff && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-emerald-500 hover:bg-emerald-500/10 transition-colors font-medium"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin CMS Portal</span>
                    </Link>
                  )}

                  <div className="border-t border-border/40 pt-1">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left"
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
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-medium bg-foreground text-background hover:bg-foreground/90 px-3.5 py-1.5 rounded-md transition-colors shadow-sm"
              >
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <span className="text-xs font-mono text-muted-foreground">Color Theme</span>
            <ThemeToggle showLabel={true} />
          </div>

          {mounted && isAuthenticated && user ? (
            <div className="border-t border-border/40 pt-3 flex flex-col space-y-2">
              <div className="px-1 py-1">
                <p className="text-xs font-semibold text-foreground">{user.name}</p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  @{user.username} • {user.role}
                </p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md py-1.5 text-xs text-foreground hover:text-primary font-medium"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Reader Dashboard</span>
              </Link>
              <Link
                href="/guest-post/submit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md py-1.5 text-xs text-foreground hover:text-primary font-medium"
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>Submit Guest Post</span>
              </Link>
              {isStaff && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md py-1.5 text-xs text-emerald-500 hover:text-emerald-400 font-semibold"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin CMS Portal</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 text-xs text-destructive hover:text-destructive/80 font-medium py-1.5 text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-border/40 pt-3 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-medium py-2 rounded-md border border-border"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-medium py-2 rounded-md bg-foreground text-background"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground opacity-60 ${className}`}
        aria-hidden="true"
      >
        <span className="h-4 w-4 inline-block" />
        {showLabel && <span className="ml-2 text-xs font-sans">Theme</span>}
      </div>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-medium font-sans">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}

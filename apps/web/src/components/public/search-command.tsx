'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, BookOpen, Layers, Cpu, ArrowRight } from 'lucide-react';
import { siteConfig } from '@nexus/config';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-card p-0 shadow-2xl overflow-hidden font-sans text-sm animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full" label="Global Command Search">
          <div className="flex items-center border-b border-border/40 px-3.5 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
            <Command.Input
              placeholder="Search articles, architectures, technologies, categories..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-border/20 text-xs">
            <Command.Empty className="p-4 text-center text-muted-foreground font-mono">
              No matching articles or topics found.
            </Command.Empty>

            {/* Quick Navigation Group */}
            <Command.Group heading="Navigation" className="p-1 font-mono text-muted-foreground uppercase text-[10px]">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/articles'))}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted cursor-pointer text-foreground font-sans text-xs"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>Browse All Articles</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/categories'))}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted cursor-pointer text-foreground font-sans text-xs"
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>Explore Architecture Categories</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push('/technologies'))}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted cursor-pointer text-foreground font-sans text-xs"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-primary" />
                  <span>Technologies & Infrastructure</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Command.Item>
            </Command.Group>

            {/* Popular Topics Group */}
            <Command.Group heading="Architecture Topics" className="p-1 font-mono text-muted-foreground uppercase text-[10px]">
              {siteConfig.technologies.map((tech) => (
                <Command.Item
                  key={tech}
                  value={tech}
                  onSelect={() => runCommand(() => router.push(`/technologies/${tech.toLowerCase()}`))}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted cursor-pointer text-foreground font-sans text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">#</span>
                    <span>{tech} Deep Dives</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">/technologies/{tech.toLowerCase()}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="border-t border-border/40 bg-muted/30 px-3.5 py-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>Navigation: ↑ ↓ • Select: ↵</span>
            <span>ESC to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

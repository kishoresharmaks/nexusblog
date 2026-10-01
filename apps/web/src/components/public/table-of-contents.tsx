'use client';

import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content?: string;
  headings?: TocItem[];
}

export function TableOfContents({ content, headings: explicitHeadings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [toc, setToc] = useState<TocItem[]>([]);

  // Parse headings from markdown content if explicitHeadings is not provided
  useEffect(() => {
    if (explicitHeadings && explicitHeadings.length > 0) {
      setToc(explicitHeadings);
      return;
    }

    if (!content) return;

    const lines = content.split('\n');
    const parsedHeadings: TocItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/`|\*/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        parsedHeadings.push({ id, text, level });
      }
    });

    setToc(parsedHeadings);
  }, [content, explicitHeadings]);

  // Scroll spy to highlight active section in viewport
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = toc
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          return;
        }
      }

      if (headingElements.length > 0) {
        setActiveId(headingElements[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav className="space-y-2 text-xs">
      <div className="flex items-center space-x-2 font-mono font-semibold uppercase tracking-wider text-foreground mb-3">
        <List className="h-3.5 w-3.5 text-primary" />
        <span>On This Page</span>
      </div>

      <ul className="space-y-1.5 border-l border-border/40 pl-3">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={`${item.level === 3 ? 'pl-3' : ''}`}
            >
              <a
                href={`#${item.id}`}
                className={`block py-1 leading-snug transition-colors line-clamp-1 ${
                  isActive
                    ? 'font-medium text-primary -ml-[13px] border-l-2 border-primary pl-2.5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

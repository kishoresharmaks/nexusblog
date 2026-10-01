import React from 'react';
import {
  Info,
  AlertTriangle,
  Lightbulb,
  AlertOctagon,
  FileText,
} from 'lucide-react';

export type CalloutType = 'info' | 'warning' | 'tip' | 'caution' | 'note';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_STYLES: Record<
  CalloutType,
  {
    border: string;
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultTitle: string;
  }
> = {
  info: {
    border: 'border-sky-500/30 dark:border-sky-500/20',
    bg: 'bg-sky-500/5 dark:bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    icon: Info,
    defaultTitle: 'Note',
  },
  tip: {
    border: 'border-emerald-500/30 dark:border-emerald-500/20',
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: Lightbulb,
    defaultTitle: 'Tip / Best Practice',
  },
  warning: {
    border: 'border-amber-500/30 dark:border-amber-500/20',
    bg: 'bg-amber-500/5 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    icon: AlertTriangle,
    defaultTitle: 'Warning',
  },
  caution: {
    border: 'border-rose-500/30 dark:border-rose-500/20',
    bg: 'bg-rose-500/5 dark:bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    icon: AlertOctagon,
    defaultTitle: 'Caution / Critical',
  },
  note: {
    border: 'border-zinc-500/30 dark:border-zinc-500/20',
    bg: 'bg-zinc-500/5 dark:bg-zinc-500/10',
    text: 'text-zinc-600 dark:text-zinc-400',
    icon: FileText,
    defaultTitle: 'Context',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const config = CALLOUT_STYLES[type] || CALLOUT_STYLES.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`my-6 rounded-lg border p-4 sm:p-5 ${config.border} ${config.bg} transition-colors`}
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-0.5 shrink-0 ${config.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className={`text-sm font-semibold tracking-tight ${config.text}`}>
            {title || config.defaultTitle}
          </div>
          <div className="text-sm text-foreground/90 leading-relaxed font-sans prose-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

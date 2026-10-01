'use client';

import React, { useState } from 'react';
import { CodeBlock } from './code-block';

export interface CodeTabProps {
  title: string;
  language?: string;
  filename?: string;
  children: React.ReactNode;
}

export function CodeTab({ children }: CodeTabProps) {
  return <>{children}</>;
}

export interface CodeTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

export function CodeTabs({ children, defaultValue }: CodeTabsProps) {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<CodeTabProps> =>
      React.isValidElement(child) && Boolean((child.props as any)?.title),
  );

  const [activeTab, setActiveTab] = useState<string>(
    defaultValue || (tabs[0]?.props as any)?.title || '',
  );

  if (tabs.length === 0) return null;

  const currentTab = tabs.find((t) => (t.props as any).title === activeTab) || tabs[0];

  return (
    <div className="my-6 rounded-lg border border-border/80 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-border/40 bg-zinc-900/90 px-2 overflow-x-auto">
        {tabs.map((tab) => {
          const tabTitle = (tab.props as any).title;
          const isActive = tabTitle === activeTab;
          return (
            <button
              key={tabTitle}
              type="button"
              onClick={() => setActiveTab(tabTitle)}
              className={`px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-zinc-100 bg-zinc-950/60'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {tabTitle}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-0">
        <CodeBlock
          filename={(currentTab?.props as any)?.filename}
          language={(currentTab?.props as any)?.language}
          showLineNumbers={true}
        >
          {(currentTab?.props as any)?.children}
        </CodeBlock>
      </div>
    </div>
  );
}

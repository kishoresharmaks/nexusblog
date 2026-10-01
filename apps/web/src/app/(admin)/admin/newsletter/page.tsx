'use client';

import React, { useState } from 'react';
import { Mail, Download, Search, CheckCircle2, UserCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  subscribedAt: string;
}

const INITIAL_SUBSCRIBERS: Subscriber[] = [
  { id: 's1', email: 'alex.rivera@techcorp.io', active: true, subscribedAt: '2026-09-28' },
  { id: 's2', email: 'elena.rostova@cloudscale.dev', active: true, subscribedAt: '2026-09-26' },
  { id: 's3', email: 'marcus.v@systemarch.org', active: true, subscribedAt: '2026-09-24' },
  { id: 's4', email: 'sarah.lin@distributed.io', active: true, subscribedAt: '2026-09-22' },
  { id: 's5', email: 'david.chen@dbeng.net', active: true, subscribedAt: '2026-09-20' },
];

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(INITIAL_SUBSCRIBERS);
  const [search, setSearch] = useState('');

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Active,SubscribedAt', ...subscribers.map((s) => `${s.email},${s.active},${s.subscribedAt}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'newsletter_subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscribers CSV exported');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Newsletter Subscribers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage subscribers to the NexusBlog Engineering Dispatch weekly newsletter.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-all self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Total Active Subscribers</span>
          <p className="text-2xl font-mono font-extrabold text-foreground">1,482</p>
          <span className="text-[11px] font-mono text-emerald-500 font-semibold">+8.4% this month</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">Average Open Rate</span>
          <p className="text-2xl font-mono font-extrabold text-foreground">54.2%</p>
          <span className="text-[11px] font-mono text-muted-foreground">Tech industry avg: 28%</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2">
          <span className="text-xs font-mono text-muted-foreground">CTR (Click-Through Rate)</span>
          <p className="text-2xl font-mono font-extrabold text-foreground">19.8%</p>
          <span className="text-[11px] font-mono text-muted-foreground">Across code links & diagrams</span>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground font-mono">
            Subscriber Directory ({filtered.length})
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 font-mono text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                    {item.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    {item.subscribedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

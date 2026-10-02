'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Mail,
  Download,
  Search,
  CheckCircle2,
  Send,
  Trash2,
  Eye,
  Edit3,
  X,
  Sparkles,
  Users,
  TrendingUp,
  Inbox,
  AlertTriangle,
  Loader2,
  Sliders,
  FileText,
  ShieldAlert,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { newsletterApi } from '@/lib/api-client';

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt?: string;
  subscribedAt?: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  inactive: number;
  estimatedOpenRate: number;
  estimatedCtr: number;
}

const TEMPLATES = [
  {
    name: 'Weekly Dispatch',
    subject: 'NexusBlog #42: Designing Multi-Region Active-Active CockroachDB',
    preview: 'Zero-loss priority queues, sliding window Lua scripts, and eBPF tracing.',
    content: `Hi engineers,\n\nIn this week's issue of **NexusBlog Engineering Dispatch**:\n\n## 1. Multi-Region Consensus at Scale\nWe dive into CockroachDB range leaseholder election mechanisms and how to minimize cross-continental Raft latencies under WAN partition events.\n\n\`\`\`go\n// Range leaseholder rebalancing under network partition\ntype LeaseholderGroup struct {\n    RangeID   uint64\n    Replicas  []NodeID\n    LeaseEpoch uint64\n}\n\`\`\`\n\n## 2. Low-Latency Sliding Window Counters\nImplementing distributed sliding window rate limiters in Redis using atomic Lua evaluation with sub-millisecond execution guarantees.\n\n> "Consistency is not just an algorithm; it is the contract between your distributed storage and your users."\n\nRead the full technical guides at https://nexusnation.in\n\nHappy building,\n**NexusBlog Core Architecture Team**`,
  },
  {
    name: 'Architecture Deep Dive',
    subject: 'Deep Dive: Zero-Copy Serialization & Memory Models in Rust and Go',
    preview: 'Exploring FlatBuffers, Cap\'n Proto, and memory safety without GC overhead.',
    content: `Hi engineers,\n\nWelcome to an architectural deep-dive into **Zero-Copy Serialization and Memory Models**.\n\n## Why Traditional JSON / Protobuf Fall Short\nWhen serving 500,000 requests/sec, CPU cache misses and byte allocation in serialization layers become the primary bottleneck.\n\n### Key Takeaways:\n- **Direct Buffer Offsets**: Reading nested structures without unmarshaling bytes.\n- **Zero Heap Allocations**: Memory alignment strategies for SIMD vectorization.\n- **Benchmarking Results**: 14x latency reduction over standard JSON parsers.\n\nExplore the interactive architecture blueprint on NexusBlog: https://nexusnation.in/articles/zero-copy-serialization\n\nBest,\n**NexusBlog Systems Group**`,
  },
  {
    name: 'Security Advisory',
    subject: 'Security Notice: Mitigating Replay Attacks in Distributed Token Validation',
    preview: 'Critical recommendations for microservice JWT replay attack prevention.',
    content: `Hi engineers,\n\nHere is an essential security brief on **Distributed Token Security and Nonce Rotation**.\n\n## Threat Modeling\nStateless JWT tokens without distributed revocation allow replay attacks during key compromise windows.\n\n### Recommended Mitigations:\n1. Implement Bloom filter-backed short-lived token caches in Redis.\n2. Enforce strict DPoP (Demonstrating Proof-of-Possession) bindings.\n3. Rotate asymmetric verification keys automatically every 24 hours.\n\nRead our complete mitigation blueprint at https://nexusnation.in/articles/jwt-replay-mitigation\n\nStay secure,\n**NexusBlog Security Architecture**`,
  },
];

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    inactive: 0,
    estimatedOpenRate: 54.2,
    estimatedCtr: 19.8,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastPreview, setBroadcastPreview] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastTab, setBroadcastTab] = useState<'write' | 'preview'>('write');

  // Test Dispatch inside Compose Modal
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Delete Subscriber State
  const [deleteConfirmSub, setDeleteConfirmSub] = useState<Subscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subsRes, statsRes] = await Promise.all([
        newsletterApi.getSubscribers(100, 0).catch(() => []),
        newsletterApi.getStats().catch(() => ({
          total: 0,
          active: 0,
          inactive: 0,
          estimatedOpenRate: 54.2,
          estimatedCtr: 19.8,
        })),
      ]);

      const items = Array.isArray(subsRes) ? subsRes : subsRes?.items || [];
      setSubscribers(items);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load newsletter data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Email,Active,SubscribedAt',
        ...subscribers.map((s) => `${s.email},${s.active},${s.createdAt || s.subscribedAt || ''}`),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'newsletter_subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscribers CSV exported');
  };

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setBroadcastSubject(tmpl.subject);
    setBroadcastPreview(tmpl.preview);
    setBroadcastContent(tmpl.content);
    toast.info(`Loaded "${tmpl.name}" template`);
  };

  const handleSendTest = async () => {
    if (!testRecipient.trim() || !testRecipient.includes('@')) {
      toast.error('Please enter a valid test recipient email address');
      return;
    }
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      toast.error('Please enter subject and content before sending a test dispatch');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await newsletterApi.broadcast({
        subject: broadcastSubject.trim(),
        previewText: broadcastPreview.trim() || undefined,
        content: broadcastContent.trim(),
        testEmail: testRecipient.trim(),
      });

      if (res.success) {
        toast.success(res.message || `Test dispatch sent to ${testRecipient}`);
      } else {
        toast.error(res.message || 'Failed to dispatch test email');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send test dispatch');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      toast.error('Please provide both subject and dispatch content');
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const res = await newsletterApi.broadcast({
        subject: broadcastSubject.trim(),
        previewText: broadcastPreview.trim() || undefined,
        content: broadcastContent.trim(),
      });

      toast.success(res.message || 'Newsletter broadcast dispatched successfully via Brevo!');
      setIsBroadcastOpen(false);
      setBroadcastSubject('');
      setBroadcastPreview('');
      setBroadcastContent('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch broadcast');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!deleteConfirmSub) return;
    setIsDeleting(true);
    try {
      await newsletterApi.deleteSubscriber(deleteConfirmSub.id);
      setSubscribers((prev) => prev.filter((s) => s.id !== deleteConfirmSub.id));
      toast.success(`Removed ${deleteConfirmSub.email}`);
      setDeleteConfirmSub(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove subscriber');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Newsletter & Engineering Dispatch
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-1">
            Manage subscriber lists, monitor delivery metrics, and dispatch Brevo broadcasts to engineers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/dev-config"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-colors"
          >
            <Sliders className="h-4 w-4 text-primary" />
            <span>Dev Config</span>
          </Link>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Compose Dispatch</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-2 shadow-xs">
          <span className="text-xs font-mono text-muted-foreground">Total Active Subscribers</span>
          <p className="text-2xl font-mono font-extrabold text-foreground">
            {stats.active > 0 ? stats.active.toLocaleString() : subscribers.length.toLocaleString()}
          </p>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            {stats.inactive > 0 ? `${stats.inactive} unsubscribed` : '100% Active retention'}
          </span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-2 shadow-xs">
          <span className="text-xs font-mono text-muted-foreground">Average Open Rate</span>
          <p className="text-2xl font-mono font-extrabold text-sky-400">{stats.estimatedOpenRate}%</p>
          <span className="text-[11px] font-mono text-muted-foreground">Engineering benchmark: 32%</span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-2 shadow-xs">
          <span className="text-xs font-mono text-muted-foreground">CTR (Click-Through Rate)</span>
          <p className="text-2xl font-mono font-extrabold text-primary">{stats.estimatedCtr}%</p>
          <span className="text-[11px] font-mono text-muted-foreground">Across GitHub repos & architecture specs</span>
        </div>
      </div>

      {/* Subscribers Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-foreground font-mono">
            Subscriber Directory ({filtered.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none font-mono"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-2 text-muted-foreground font-mono text-xs">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p>Loading subscriber directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/10">
            <Mail className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No subscribers found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search
                ? 'Try adjusting your search query.'
                : 'New subscribers from the Engineering Dispatch footer form will automatically appear here.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 font-mono text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Subscribed Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        {item.email}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.active !== false ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded">
                            Unsubscribed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.subscribedAt || 'Recently')}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setDeleteConfirmSub(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove subscriber"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Compose & Dispatch Broadcast Modal */}
      {isBroadcastOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBroadcastOpen(false);
          }}
        >
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground font-mono">
                    Compose Engineering Dispatch Broadcast
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Sending to {stats.active || subscribers.length} active engineer subscribers via Brevo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg cursor-pointer"
                aria-label="Close compose modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Template Presets Bar */}
            <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Preset Templates:</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border/60 text-[11px] font-mono font-medium text-foreground transition-colors cursor-pointer"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NexusBlog #42: Designing Multi-Region Active-Active CockroachDB"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                    Inbox Preview Snippet
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">(Optional preheader text)</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Zero-loss priority queues, sliding window Lua scripts, and eBPF tracing."
                  value={broadcastPreview}
                  onChange={(e) => setBroadcastPreview(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Tab Selector for Write vs Live Email Preview */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2 pt-1">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Dispatch Content (Markdown) *
                </label>
                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setBroadcastTab('write')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      broadcastTab === 'write'
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Write Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastTab('preview')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      broadcastTab === 'preview'
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Email Live Preview
                  </button>
                </div>
              </div>

              {broadcastTab === 'write' ? (
                <textarea
                  rows={9}
                  required
                  placeholder={`Hi engineers,\n\nIn this week's issue of NexusBlog Engineering Dispatch:\n\n- **Distributed Consensus**: Deep dive into CockroachDB range leaseholder election.\n- **Performance Tuning**: Zero-loss Redis priority queues.\n\nRead the full technical guides at https://nexusnation.in\n\nHappy building,\nThe NexusBlog Team`}
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none leading-relaxed min-h-[220px]"
                />
              ) : (
                /* True Branded Email Mockup Preview Frame */
                <div className="rounded-2xl border border-border/80 bg-[#090d16] text-[#e2e8f0] overflow-hidden shadow-lg">
                  {/* Email Client Header Bar */}
                  <div className="p-4 bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border-b border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#f8fafc] tracking-tight">
                          Nexus<span className="text-[#0ea5e9]">Blog</span>
                        </span>
                        <span className="bg-[#0ea5e9]/15 text-[#38bdf8] border border-[#0ea5e9]/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                          ENGINEERING DISPATCH
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#64748b]">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/30 text-[11px] font-mono space-y-0.5">
                      <p className="text-[#cbd5e1]">
                        <strong className="text-[#f8fafc]">Subject:</strong> {broadcastSubject || 'Untitled Dispatch'}
                      </p>
                      {broadcastPreview && (
                        <p className="text-[#94a3b8]">
                          <strong className="text-[#cbd5e1]">Preheader:</strong> {broadcastPreview}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 bg-[#0f172a] text-xs leading-relaxed space-y-3 font-sans max-h-72 overflow-y-auto">
                    <h1 className="text-base font-extrabold text-[#f8fafc] pb-1">
                      {broadcastSubject || 'Untitled Dispatch'}
                    </h1>
                    <div className="prose prose-invert prose-xs max-w-none text-[#cbd5e1] whitespace-pre-wrap font-sans">
                      {broadcastContent || 'No markdown content written yet. Switch to "Write Markdown" to compose your newsletter.'}
                    </div>
                  </div>

                  {/* Email Footer */}
                  <div className="p-4 bg-[#090d16] border-t border-border/40 text-center space-y-1">
                    <p className="text-[10px] text-[#64748b]">
                      You received this email because you subscribed to NexusBlog Engineering Dispatch.
                    </p>
                    <p className="text-[9px] font-mono text-[#475569]">
                      NexusBlog &bull; High-scale Technical Publishing &bull; Unsubscribe
                    </p>
                  </div>
                </div>
              )}

              {/* Send Test Email Section inside Compose */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">Send Test Dispatch First</p>
                  <p className="text-[11px] text-muted-foreground">
                    Test live rendering in your personal inbox via Brevo before sending to all subscribers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="w-48 sm:w-56 rounded-lg border border-border bg-background py-1.5 px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={isSendingTest}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono font-medium text-foreground transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSendingTest ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span>Send Test</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Ready to send to {stats.active || subscribers.length} active engineer subscribers
                </span>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border bg-muted/30 hover:bg-muted text-xs font-mono font-medium text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingBroadcast}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {isSendingBroadcast ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Dispatching via Brevo...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Broadcast Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subscriber Confirmation Modal */}
      {deleteConfirmSub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmSub(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Remove Subscriber?</h3>
                <p className="text-xs text-muted-foreground">This action removes the email from the mailing list.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently unsubscribe <strong className="text-foreground">{deleteConfirmSub.email}</strong>?
            </p>

            <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmSub(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-mono text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubscriber}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-mono font-bold hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Removing...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Clock,
  User,
  Globe,
  Code,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  Filter,
  Calendar,
  ShieldCheck,
  Terminal,
  Activity,
} from 'lucide-react';
import { auditLogsApi } from '@/lib/api-client';

interface AuditLogUser {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  user?: AuditLogUser | null;
  userName?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface PaginationMeta {
  total: number;
  limit: number;
  hasNextPage: boolean;
  nextCursor?: string | null;
  retentionDays: number;
}

function cleanIp(ip?: string): string {
  if (!ip) return '127.0.0.1';
  let clean = ip.trim();
  if (clean.startsWith('::ffff:')) {
    clean = clean.substring(7);
  }
  if (clean === '::1' || clean === '::') {
    return '127.0.0.1';
  }
  return clean;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 45) return 'just now';
    if (diffSec < 90) return '1m ago';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 7200) return '1h ago';
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    const days = Math.floor(diffSec / 86400);
    return `${days}d ago`;
  } catch {
    return dateStr;
  }
}

function formatFullDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getActionBadgeStyle(action: string) {
  const upper = action.toUpperCase();
  if (upper.includes('FAILED') || upper.includes('ERROR') || upper.includes('DELETE') || upper.includes('REVOKE')) {
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  }
  if (upper.includes('LOGIN') || upper.includes('REGISTER') || upper.includes('VERIF')) {
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  }
  if (upper.includes('PASSWORD') || upper.includes('UPDATE') || upper.includes('ROLE')) {
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  }
  if (upper.includes('ARTICLE') || upper.includes('PUBLISH') || upper.includes('CREATE')) {
    return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
  }
  return 'bg-primary/10 text-primary border-primary/20';
}

const COMMON_ACTIONS = [
  { label: 'All Actions', value: 'ALL' },
  { label: 'Login (Success)', value: 'AUTH_LOGIN' },
  { label: 'Login (Failed)', value: 'AUTH_LOGIN_FAILED' },
  { label: 'Registration', value: 'AUTH_REGISTER' },
  { label: 'Session Refresh', value: 'AUTH_REFRESH' },
  { label: 'Password Changed', value: 'PASSWORD_CHANGED' },
  { label: 'Email Verified', value: 'EMAIL_VERIFIED' },
  { label: 'Role Updated', value: 'USER_ROLE_UPDATED' },
  { label: 'Article Published', value: 'ARTICLE_PUBLISHED' },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    limit: 50,
    hasNextPage: false,
    nextCursor: null,
    retentionDays: 7,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState(50);

  // Cursor navigation stack: array of cursor strings for previous pages
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);

  const [activeJsonModal, setActiveJsonModal] = useState<AuditLogEntry | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCursorHistory([]);
    setCurrentCursor(undefined);
  }, [debouncedSearch, actionFilter, pageSize]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await auditLogsApi.getAll({
        limit: pageSize,
        cursor: currentCursor,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        search: debouncedSearch.trim() || undefined,
      });

      setLogs(res.items || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, currentCursor, actionFilter, debouncedSearch]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Forward cursor navigation
  const handleNextPage = () => {
    if (!meta.nextCursor || !meta.hasNextPage) return;
    setCursorHistory((prev) => [...prev, currentCursor]);
    setCurrentCursor(meta.nextCursor);
  };

  // Backward cursor navigation
  const handlePreviousPage = () => {
    if (cursorHistory.length === 0) return;
    const prevHistory = [...cursorHistory];
    const prevCursor = prevHistory.pop();
    setCursorHistory(prevHistory);
    setCurrentCursor(prevCursor);
  };

  const handleCopyJson = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const currentPageNumber = cursorHistory.length + 1;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner with Retention Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Security & Audit Logs
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Immutable system audit trail tracking authentication events, authorization changes, and administrative actions.
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Retention Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>7-Day Retention Policy (Auto-Purged)</span>
          </div>
          <button
            onClick={() => loadLogs()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh logs"
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, resource, IP, user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action filter dropdown */}
        <div className="sm:col-span-4 relative">
          <div className="relative">
            <Filter className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-8 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-all cursor-pointer shadow-xs"
            >
              {COMMON_ACTIONS.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page size selector */}
        <div className="sm:col-span-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-card py-2 px-3 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-all cursor-pointer shadow-xs text-center"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 font-mono text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Action & Resource</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Activity className="h-6 w-6 animate-pulse text-primary" />
                      <span className="text-xs font-mono">Loading security audit trail...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="h-7 w-7 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-foreground">No audit logs found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        No security actions matched your current filters within the 7-day retention window.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const userName =
                    item.user?.name ||
                    item.user?.username ||
                    (item.details?.name as string) ||
                    (item.userId ? `User #${item.userId.substring(item.userId.length - 6)}` : 'System / Service');

                  const userEmail =
                    item.user?.email ||
                    (item.details?.email as string) ||
                    (item.user ? '' : 'internal-process');

                  const clientIpStr = cleanIp(item.ipAddress);

                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                      {/* Action & Resource */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md border font-mono font-semibold text-[10px] tracking-wide ${getActionBadgeStyle(
                                item.action,
                              )}`}
                            >
                              {item.action}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                            <span>{item.resource}</span>
                            {item.resourceId && (
                              <span className="text-[10px] text-muted-foreground/70 bg-muted px-1.5 py-0.2 rounded">
                                #{item.resourceId.slice(-6)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* User Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold font-mono">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate max-w-[160px] text-xs">
                              {userName}
                            </span>
                            {userEmail && (
                              <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                {userEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span className="px-2 py-0.5 rounded-md border border-border/80 bg-muted/50 text-[11px] font-medium text-foreground">
                            {clientIpStr}
                          </span>
                        </div>
                        {item.userAgent && (
                          <span
                            className="block text-[10px] text-muted-foreground/60 truncate max-w-[180px] font-mono mt-0.5"
                            title={item.userAgent}
                          >
                            {item.userAgent}
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col" title={formatFullDateTime(item.createdAt)}>
                          <div className="flex items-center gap-1 font-mono text-foreground font-medium text-xs">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatFullDateTime(item.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Payload Inspector Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setActiveJsonModal(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted font-mono text-[11px] text-foreground transition-all shadow-2xs hover:border-primary/40"
                        >
                          <Code className="h-3.5 w-3.5 text-primary" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Cursor Pagination Controls */}
        <div className="border-t border-border/60 bg-muted/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-muted-foreground flex items-center gap-2">
            <span className="font-mono">Page {currentPageNumber}</span>
            <span>•</span>
            <span>
              Showing <strong className="text-foreground">{logs.length}</strong> logs (Total in 7-day window:{' '}
              <strong className="text-foreground">{meta.total}</strong>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={cursorHistory.length === 0 || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted font-medium text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNextPage}
              disabled={!meta.hasNextPage || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted font-medium text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      {activeJsonModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveJsonModal(null);
          }}
        >
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground font-mono">
                    {activeJsonModal.action}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    ID: {activeJsonModal.id} • {formatFullDateTime(activeJsonModal.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveJsonModal(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Summary Metadata */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-muted/30 p-3 rounded-xl border border-border/60">
              <div>
                <span className="text-muted-foreground block">Client IP:</span>
                <span className="text-foreground font-semibold">{cleanIp(activeJsonModal.ipAddress)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Resource:</span>
                <span className="text-foreground font-semibold">{activeJsonModal.resource}</span>
              </div>
              {activeJsonModal.user && (
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Triggered By:</span>
                  <span className="text-foreground">
                    {activeJsonModal.user.name || activeJsonModal.user.username} ({activeJsonModal.user.email}) - {activeJsonModal.user.role}
                  </span>
                </div>
              )}
            </div>

            {/* JSON Code Viewer */}
            <div className="relative rounded-xl border border-border bg-background p-4 font-mono text-xs overflow-x-auto max-h-80 shadow-inner">
              <pre className="text-foreground leading-relaxed">
                {JSON.stringify(
                  {
                    details: activeJsonModal.details || {},
                    metadata: activeJsonModal.metadata || {},
                    userAgent: activeJsonModal.userAgent,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  handleCopyJson({
                    id: activeJsonModal.id,
                    action: activeJsonModal.action,
                    resource: activeJsonModal.resource,
                    resourceId: activeJsonModal.resourceId,
                    userId: activeJsonModal.userId,
                    ipAddress: activeJsonModal.ipAddress,
                    userAgent: activeJsonModal.userAgent,
                    createdAt: activeJsonModal.createdAt,
                    details: activeJsonModal.details,
                    metadata: activeJsonModal.metadata,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-mono text-foreground transition-colors"
              >
                {copiedJson ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Full Record</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveJsonModal(null)}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

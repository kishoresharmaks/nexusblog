'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Search, Eye, Clock, User, Globe, Code, X } from 'lucide-react';
import { auditLogsApi } from '@/lib/api-client';

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userName?: string;
  userEmail?: string;
  user?: {
    name: string;
    email: string;
  };
  ipAddress?: string;
  createdAt: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [activeJsonModal, setActiveJsonModal] = useState<AuditLogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await auditLogsApi.getAll(100, 0);
      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
            ? res.data
            : [];
      setLogs(items);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const safeLogs = Array.isArray(logs) ? logs : [];
  const filtered = safeLogs.filter(
    (l) => {
      const email = l?.user?.email || l?.userEmail || '';
      const action = l?.action || '';
      const res = l?.resource || '';
      return (
        action.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        res.toLowerCase().includes(search.toLowerCase())
      );
    },
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Security Audit Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Immutable system audit trails recording authentication, role modifications, article publishing, and sessions.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search audit actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
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
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-foreground">{item.action}</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
                        {item.resource}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    <p className="font-semibold text-foreground">{item.userName}</p>
                    <p className="text-[11px] text-muted-foreground">{item.userEmail}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {item.ipAddress}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {item.createdAt}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveJsonModal(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted font-mono text-[11px] text-foreground transition-colors"
                    >
                      <Code className="h-3 w-3" />
                      <span>Inspect JSON</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground font-mono">
                  {activeJsonModal.action} Metadata
                </h3>
              </div>
              <button
                onClick={() => setActiveJsonModal(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 font-mono text-xs overflow-x-auto shadow-xs">
              <pre className="text-foreground leading-relaxed">
                {JSON.stringify(activeJsonModal.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveJsonModal(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

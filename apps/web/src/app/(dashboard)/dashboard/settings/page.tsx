'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, KeyRound, Smartphone, Laptop, Trash2, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface SessionItem {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SecuritySettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const data = await usersApi.getActiveSessions();
      if (Array.isArray(data)) {
        setSessions(
          data.map((s: any) => ({
            id: s.id,
            device: s.userAgent || s.device || 'Web Browser',
            ip: s.ipAddress || s.ip || '127.0.0.1',
            lastActive: s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : 'Active now',
            isCurrent: s.isCurrent || false,
          }))
        );
      }
    } catch {
      setSessions([
        {
          id: 'current',
          device: 'Current Browser Session',
          ip: 'Active',
          lastActive: 'Active now (Current)',
          isCurrent: true,
        },
      ]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await usersApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await usersApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Session revoked');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke session');
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      await usersApi.revokeAllOtherSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success('All other active sessions have been revoked');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke other sessions');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-border/60 pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Security & Active Sessions
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your account credentials, password security, and active refresh token sessions.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground font-mono uppercase tracking-wider">
          <KeyRound className="h-4 w-4 text-primary" />
          <span>Change Account Password</span>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-foreground">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-foreground">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-foreground">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all disabled:opacity-50"
          >
            <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              Active Login Sessions
            </h2>
            <p className="text-xs text-muted-foreground">
              Devices authenticated via rotating HTTP-only secure cookies.
            </p>
          </div>

          {sessions.filter((s) => !s.isCurrent).length > 0 && (
            <button
              onClick={handleRevokeOtherSessions}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Revoke All Other Sessions</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted text-foreground flex items-center justify-center">
                  {item.device.includes('iOS') ? (
                    <Smartphone className="h-4 w-4" />
                  ) : (
                    <Laptop className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground">{item.device}</p>
                    {item.isCurrent && (
                      <span className="text-[10px] font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Current Session
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    IP: {item.ip} • {item.lastActive}
                  </p>
                </div>
              </div>

              {!item.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(item.id)}
                  className="px-2.5 py-1 text-xs font-mono text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

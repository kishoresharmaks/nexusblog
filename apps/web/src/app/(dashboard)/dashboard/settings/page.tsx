'use client';

import React, { useState } from 'react';
import { Shield, KeyRound, Smartphone, Laptop, Trash2, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SecuritySettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [sessions, setSessions] = useState([
    {
      id: 's1',
      device: 'Windows 11 / Chrome 124',
      ip: '192.168.1.45',
      lastActive: 'Active now (Current)',
      isCurrent: true,
    },
    {
      id: 's2',
      device: 'macOS Sonoma / Safari 17.4',
      ip: '10.0.0.12',
      lastActive: 'Yesterday, 14:30',
      isCurrent: false,
    },
    {
      id: 's3',
      device: 'iOS 17 / Mobile Safari',
      ip: '172.56.21.90',
      lastActive: '3 days ago',
      isCurrent: false,
    },
  ]);

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
    await new Promise((r) => setTimeout(r, 600));
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Password changed successfully');
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success('Session revoked');
  };

  const handleRevokeOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success('All other active sessions have been revoked');
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

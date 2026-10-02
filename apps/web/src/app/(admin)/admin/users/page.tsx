'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  KeyRound,
  FileText,
  MessageSquare,
  Bookmark,
  X,
  Save,
  UserCheck,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';

interface UserDirectoryItem {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'MODERATOR' | 'ANALYST' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  articlesCount?: number;
  commentsCount?: number;
  guestPostsCount?: number;
  bookmarksCount?: number;
}

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { value: 'ADMIN', label: 'Admin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { value: 'EDITOR', label: 'Editor', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { value: 'AUTHOR', label: 'Author / Contributor', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { value: 'USER', label: 'Reader / Community', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDirectoryItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('USER');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserDirectoryItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        limit: 100,
      });
      setUsers(Array.isArray(res?.items) ? res.items : []);
    } catch (err) {
      console.error('Failed to load admin users:', err);
      toast.error('Failed to load user directory');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleOpenEdit = (u: UserDirectoryItem) => {
    setEditingUser(u);
    setSelectedRole(u.role);
    setSelectedStatus(u.status || 'ACTIVE');
  };

  const handleSaveRoleAndStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      if (selectedRole !== editingUser.role) {
        await usersApi.updateUserRole(editingUser.id, selectedRole);
      }
      if (selectedStatus !== editingUser.status) {
        await usersApi.updateUserStatus(editingUser.id, selectedStatus);
      }
      toast.success(`User @${editingUser.username} privileges updated`);
      await loadUsers();
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user privileges');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    try {
      await usersApi.deleteUser(deleteConfirmUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id));
      toast.success(`User account @${deleteConfirmUser.username} removed`);
      setDeleteConfirmUser(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove user account');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleStyle = (role: string) => {
    const match = ROLES.find((r) => r.value === role);
    return match ? match.color : 'text-muted-foreground bg-muted border-border';
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Staff & User Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage editorial permissions, promote authors and editors, and audit user access.
          </p>
        </div>
      </div>

      {/* Role Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'USER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === r
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/50'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, @username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2 text-muted-foreground font-mono text-xs">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p>Loading user directory...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/10">
          <Users className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No users match your criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or role filter.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 font-mono text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">User Identity</th>
                  <th className="py-3 px-4">Role & Access</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-center">Activity Metrics</th>
                  <th className="py-3 px-4 text-right">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs font-mono shrink-0">
                          {u.name?.charAt(0) || u.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.id === currentUser?.id && (
                              <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            @{u.username} • {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${getRoleStyle(
                          u.role,
                        )}`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                          u.status === 'SUSPENDED'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        <span title="Published Articles" className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-primary" />
                          {u.articlesCount || 0}
                        </span>
                        <span title="Guest Posts" className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-amber-500" />
                          {u.guestPostsCount || 0}
                        </span>
                        <span title="Comments" className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-emerald-500" />
                          {u.commentsCount || 0}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground text-right whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Change Role & Status"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Role & Status Modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground font-mono">
                    Manage Access Privileges
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    @{editingUser.username} ({editingUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleAndStatus} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Select Staff Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} ({r.value})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">
                  Admins and Editors can publish technical articles, moderate guest posts, and manage taxonomies.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Account Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Full Portal Access)</option>
                  <option value="SUSPENDED">SUSPENDED (Locked from commenting/posting)</option>
                  <option value="DEACTIVATED">DEACTIVATED</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-mono font-medium text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Update Privileges'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteConfirmUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmUser(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Remove User Account?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete user account <strong className="text-foreground">@{deleteConfirmUser.username}</strong> ({deleteConfirmUser.email})?
            </p>

            <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-mono text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-mono font-bold hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { User, CheckCircle2, Save, Globe } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/public/brand-icons';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || 'Staff Infrastructure & Distributed Systems Engineer.',
    avatar: user?.avatar || '',
    website: 'https://nexusblog.dev',
    github: 'https://github.com/nexusdev',
    linkedin: 'https://linkedin.com/in/nexusdev',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call to PATCH /api/users/profile
    await new Promise((res) => setTimeout(res, 600));
    setIsSaving(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-border/60 pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Profile Information
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your public author persona, biography, and social accounts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar and Basic Details */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            Basic Credentials
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono font-bold text-2xl shrink-0">
              {formData.name.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">{formData.name}</p>
              <p className="text-xs text-muted-foreground font-mono">@{formData.username}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3" /> Email Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-foreground">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-foreground">Username</label>
              <input
                type="text"
                value={formData.username}
                disabled
                className="w-full rounded-lg border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono font-semibold text-foreground">Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-lg border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Bio & Social Links */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            Author Biography & Socials
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-foreground">Bio / Engineering Focus</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Tell readers about your systems engineering background, technical interests, and focus areas..."
              className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" /> Personal Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-foreground" /> GitHub Profile
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                <LinkedinIcon className="h-3.5 w-3.5 text-sky-500" /> LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs font-mono hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

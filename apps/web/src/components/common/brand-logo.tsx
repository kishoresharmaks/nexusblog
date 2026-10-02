import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@nexus/config';

export interface BrandLogoProps {
  variant?: 'default' | 'icon' | 'navbar' | 'footer' | 'admin' | 'reader' | 'auth' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  showPulse?: boolean;
  pulseColor?: 'emerald' | 'cyan' | 'amber';
  withContainer?: boolean;
  asLink?: boolean;
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  subtitle?: string;
}

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 38,
  lg: 46,
  xl: 56,
  '2xl': 72,
};

export function BrandLogo({
  variant = 'default',
  size = 'md',
  showPulse = false,
  pulseColor = 'emerald',
  withContainer = true,
  asLink = false,
  href = '/',
  className = '',
  imageClassName = '',
  priority = false,
  subtitle,
}: BrandLogoProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 38;

  // Select optimal transparent PNG based on size
  const logoSrc =
    pixelSize <= 32
      ? '/brand/png/transparent-background/nexus-64px-transparent.png'
      : pixelSize <= 64
      ? '/brand/png/transparent-background/nexus-128px-transparent.png'
      : pixelSize <= 128
      ? '/brand/png/transparent-background/nexus-256px-transparent.png'
      : '/brand/png/transparent-background/nexus-512px-transparent.png';

  const containerClasses = withContainer
    ? 'bg-zinc-950 border border-zinc-800/90 shadow-sm shadow-zinc-950/20 p-1 group-hover:border-zinc-700'
    : '';

  const logoIcon = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-visible group-hover:scale-105 transition-all duration-200 ${containerClasses} ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <Image
        src={logoSrc}
        alt={siteConfig.name}
        width={pixelSize}
        height={pixelSize}
        priority={priority}
        className={`h-full w-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] select-none pointer-events-none ${imageClassName}`}
      />

      {showPulse && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              pulseColor === 'emerald'
                ? 'bg-emerald-400'
                : pulseColor === 'cyan'
                ? 'bg-sky-400'
                : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ring-2 ring-background ${
              pulseColor === 'emerald'
                ? 'bg-emerald-500'
                : pulseColor === 'cyan'
                ? 'bg-sky-500'
                : 'bg-amber-500'
            }`}
          />
        </span>
      )}
    </div>
  );

  let content = logoIcon;

  if (variant === 'navbar') {
    content = (
      <div className={`flex items-center space-x-2.5 group ${className}`}>
        {logoIcon}
        <div className="flex flex-col">
          <span className="font-mono font-extrabold text-base tracking-tight text-foreground leading-none">
            {siteConfig.name}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider leading-tight pt-0.5 flex items-center gap-1">
            <span>{subtitle || 'SYSTEMS'}</span>
            <span className="inline-block h-1 w-1 rounded-full bg-primary/60" />
            <span>DEV</span>
          </span>
        </div>
      </div>
    );
  } else if (variant === 'compact') {
    content = (
      <div className={`flex items-center space-x-2 group ${className}`}>
        {logoIcon}
        <div className="flex flex-col">
          <span className="font-mono font-extrabold text-sm tracking-tight text-foreground leading-none">
            {siteConfig.name}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-tight pt-0.5">
            {subtitle || 'SYSTEMS PORTAL'}
          </span>
        </div>
      </div>
    );
  } else if (variant === 'footer') {
    content = (
      <div className={`inline-flex items-center gap-2.5 group ${className}`}>
        {logoIcon}
        <span className="font-mono font-extrabold text-lg text-foreground tracking-tight">
          {siteConfig.name}
        </span>
      </div>
    );
  } else if (variant === 'admin') {
    content = (
      <div className={`flex items-center space-x-2.5 group ${className}`}>
        {logoIcon}
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-base text-foreground tracking-tight">
            Nexus<span className="text-primary font-light">Admin</span>
          </span>
          <span className="rounded bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-mono text-rose-400 font-bold">
            CMS
          </span>
        </div>
      </div>
    );
  } else if (variant === 'reader') {
    content = (
      <div className={`flex items-center space-x-2.5 group ${className}`}>
        {logoIcon}
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-base text-foreground tracking-tight">
            Nexus<span className="text-primary font-light">Reader</span>
          </span>
          <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-mono text-primary font-bold">
            DASHBOARD
          </span>
        </div>
      </div>
    );
  } else if (variant === 'auth') {
    content = (
      <div className={`flex flex-col items-center justify-center space-y-2 group ${className}`}>
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/5 to-transparent blur-md opacity-60" />
          {logoIcon}
        </div>
      </div>
    );
  }

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none"
        aria-label={`${siteConfig.name} Home`}
      >
        {content}
      </Link>
    );
  }

  return content;
}

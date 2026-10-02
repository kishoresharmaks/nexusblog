'use client';

import React from 'react';
import {
  Cpu,
  Database,
  Server,
  Cloud,
  Layers,
  Shield,
  ShieldCheck,
  Terminal,
  Code,
  Code2,
  Zap,
  GitBranch,
  Boxes,
  Workflow,
  Network,
  HardDrive,
  Lock,
  Key,
  Scale,
  Activity,
  Flame,
  Sparkles,
  Globe,
  Radio,
  FileCode,
  FileCode2,
  Compass,
  Rocket,
  Search,
  Share2,
  BookOpen,
  Sliders,
  FolderTree,
  Bookmark,
  Eye,
  Archive,
  Save,
  Bell,
  Gauge,
  Shuffle,
  LucideProps,
} from 'lucide-react';

export const LUCIDE_ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Cpu,
  Database,
  Server,
  Cloud,
  Layers,
  Shield,
  ShieldCheck,
  Terminal,
  Code,
  Code2,
  Zap,
  GitBranch,
  Boxes,
  Workflow,
  Network,
  HardDrive,
  Lock,
  Key,
  Scale,
  Activity,
  Flame,
  Sparkles,
  Globe,
  Radio,
  FileCode,
  FileCode2,
  Compass,
  Rocket,
  Search,
  Share2,
  BookOpen,
  Sliders,
  FolderTree,
  Bookmark,
  Eye,
  Archive,
  Save,
  Bell,
  Gauge,
  Shuffle,
};

// Curated SVG Brand Vectors for popular infrastructure & developer technologies
export const TECH_SVG_MAP: Record<string, { name: string; color: string; svg: React.ReactNode }> = {
  docker: {
    name: 'Docker',
    color: '#2496ED',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.929 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m21.656 1.488a4.99 4.99 0 00-1.666-.884 6.786 6.786 0 00-2.316-.407c-.439 0-.877.037-1.311.11a.348.348 0 00-.285.342v1.547a.35.35 0 00.347.349c.408.01.815.044 1.22.102a4.42 4.42 0 011.696.671.35.35 0 00.472-.09c.394-.523.864-.997 1.402-1.405a.35.35 0 00.441-.335M.052 14.133a10.985 10.985 0 003.58 4.298c4.27 2.928 10.43 2.909 14.68-.047 3.013-2.095 4.887-5.597 5.033-9.255a.35.35 0 00-.472-.328c-.808.318-1.659.502-2.528.547a.35.35 0 00-.332.35 6.945 6.945 0 01-2.036 4.92 6.953 6.953 0 01-4.92 2.036H3.652a.35.35 0 00-.35.35c.01.89-.17 1.774-.53 2.585a.35.35 0 01-.482.164 10.02 10.02 0 01-2.238-1.579.35.35 0 01-.001-.498" />
      </svg>
    ),
  },
  kubernetes: {
    name: 'Kubernetes',
    color: '#326CE5',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M11.666.082a.853.853 0 00-.46.128L2.092 5.485a.862.862 0 00-.43.746v9.06c0 .313.167.6.43.747l9.114 5.275a.86.86 0 00.86 0l9.114-5.275a.862.862 0 00.43-.746v-9.06a.862.862 0 00-.43-.746L12.096.21a.853.853 0 00-.43-.128zm.334 2.016l7.784 4.505-2.613 1.512-5.17-2.993v-3.024zm-1.71 0v3.024L5.12 8.115 2.507 6.603 10.29 2.098zm8.718 5.753v5.992l-2.618-1.514v-2.966l2.618-1.512zm-15.727 0l2.618 1.512v2.966L3.28 13.843V7.851zm7.863 1.503l4.316 2.496-4.316 2.497-4.316-2.497 4.316-2.496zm6.155 3.558l2.613 1.511-7.784 4.505v-3.024l5.17-2.992zm-12.31 0l5.17 2.992v3.024L3.708 14.423l2.613-1.511z" />
      </svg>
    ),
  },
  kafka: {
    name: 'Apache Kafka',
    color: '#231F20',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v-2.09l4.5 2.6V12l-4.5-2.6V7.31L17.5 10v4l-4.5 2.5zM6.5 10l4.5-2.6v2.09L6.5 12l4.5 2.6v2.09L6.5 14v-4z" />
      </svg>
    ),
  },
  redis: {
    name: 'Redis',
    color: '#DC382D',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M22.95 9.07l-9.9-5.72a2.09 2.09 0 00-2.1 0L1.05 9.07a1.05 1.05 0 000 1.82l9.9 5.72a2.09 2.09 0 002.1 0l9.9-5.72a1.05 1.05 0 000-1.82zM12 5.09l7.77 4.49L12 14.07 4.23 9.58 12 5.09zm10.95 7.45l-2.1-1.21-8.85 5.11-8.85-5.11-2.1 1.21a1.05 1.05 0 000 1.82l9.9 5.72a2.09 2.09 0 002.1 0l9.9-5.72a1.05 1.05 0 000-1.82z" />
      </svg>
    ),
  },
  mongodb: {
    name: 'MongoDB',
    color: '#47A248',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12.001 0c-.394 0-.742.203-.941.516C10.05 2.11 5.92 8.784 5.92 14.332c0 4.14 2.723 7.828 6.081 9.668.21.115.467.115.677 0 3.358-1.84 6.082-5.528 6.082-9.668 0-5.548-4.13-12.222-5.14-13.816A1.08 1.08 0 0012.001 0zm.014 2.454c.783 1.34 3.738 6.643 3.738 10.92 0 2.94-1.782 5.688-3.738 7.072V2.454z" />
      </svg>
    ),
  },
  nestjs: {
    name: 'NestJS',
    color: '#E0234E',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 .397L1.6 6.4v11.206l10.4 6 10.4-6.002V6.4L12 .397zm8.4 15.803L12 21.002l-8.4-4.802V7.798L12 2.996l8.4 4.802v8.402zM12 5.196L5.6 8.89v6.22l6.4 3.693 6.4-3.693V8.89L12 5.196z" />
      </svg>
    ),
  },
  nextjs: {
    name: 'Next.js',
    color: '#000000',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M18.665 21.978l-12.443-16.146a.81.81 0 00-.642-.317H4.04v16.97h2.464V8.406l11.025 14.305c.376.488.948.774 1.556.774h.133a1.986 1.986 0 001.98-1.987V5.515h-2.533v16.463z" />
      </svg>
    ),
  },
  postgresql: {
    name: 'PostgreSQL',
    color: '#4169E1',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    ),
  },
  graphql: {
    name: 'GraphQL',
    color: '#E10098',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2L2 7.773v11.547L12 25.093l10-5.773V7.773L12 2zm7.98 15.867l-7.98 4.607-7.98-4.607V8.906l7.98-4.607 7.98 4.607v8.961z" />
      </svg>
    ),
  },
  typescript: {
    name: 'TypeScript',
    color: '#3178C6',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M1.5 0h21A1.5 1.5 0 0124 1.5v21a1.5 1.5 0 01-1.5 1.5h-21A1.5 1.5 0 010 22.5v-21A1.5 1.5 0 011.5 0zM12 14.5v-7H9.5V6h7v1.5H14v7h-2zm5.5 0c1.5 0 2.5-.8 2.5-2.2 0-2.3-3.2-1.7-3.2-3.1 0-.6.5-.9 1.2-.9.8 0 1.6.3 2.1.8l.9-1.2c-.8-.6-1.8-1-3-1-1.6 0-2.7.9-2.7 2.3 0 2.3 3.2 1.7 3.2 3.2 0 .6-.6 1-1.4 1-.9 0-1.9-.4-2.5-1.1l-1 1.2c.9 1 2.2 1.6 3.9 1.6z" />
      </svg>
    ),
  },
  python: {
    name: 'Python',
    color: '#3776AB',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M11.914 0C5.781 0 6.164 2.662 6.164 2.662l.007 2.76h5.82v.828H3.844S0 5.8 0 11.967c0 6.168 3.352 5.957 3.352 5.957h2.002v-2.812s-.109-3.352 3.297-3.352h5.652v-.809H8.652v-2.79H19.5s3.844.441 3.844-5.719c0-6.16-3.461-6.442-3.461-6.442h-7.969zm-1.75 1.727a.992.992 0 110 1.984.992.992 0 010-1.984z" />
      </svg>
    ),
  },
  rust: {
    name: 'Rust',
    color: '#000000',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5a7.5 7.5 0 110 15 7.5 7.5 0 010-15zm-2 3v9h2v-3.5h2c1.38 0 2.5-1.12 2.5-2.5S15.38 7.5 14 7.5h-4zm2 2h2c.28 0 .5.22.5.5s-.22.5-.5.5h-2v-1z" />
      </svg>
    ),
  },
  golang: {
    name: 'Go',
    color: '#00ADD8',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm5.5 11.5h-4v-2h4v2zm0-4h-4v-2h4v2zM6.5 13.5h4v2h-4v-2zm0-4h4v2h-4v-2z" />
      </svg>
    ),
  },
  aws: {
    name: 'AWS',
    color: '#FF9900',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v8l8 4 8-4v-8l-8 4z" />
      </svg>
    ),
  },
  linux: {
    name: 'Linux',
    color: '#FCC624',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>
    ),
  },
  'spring-boot': {
    name: 'Spring Boot',
    color: '#6DB33F',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M21.503 17.067a9.92 9.92 0 01-4.086 4.382c-.89.516-1.892.836-2.924.938a9.42 9.42 0 01-5.068-.962 10.02 10.02 0 01-4.14-4.358A10.218 10.218 0 014.07 12a10.218 10.218 0 011.215-5.067 10.02 10.02 0 014.14-4.358 9.42 9.42 0 015.068-.962c1.032.102 2.034.422 2.924.938a9.92 9.92 0 014.086 4.382 10.2 10.2 0 011.215 5.067 10.2 10.2 0 01-1.215 5.067zM11.95 5.518a6.438 6.438 0 00-4.62 1.956 6.55 6.55 0 00-1.884 4.676c0 1.76.685 3.42 1.884 4.676a6.438 6.438 0 004.62 1.956c1.762 0 3.39-.686 4.62-1.956a6.55 6.55 0 001.885-4.676 6.55 6.55 0 00-1.885-4.676 6.438 6.438 0 00-4.62-1.956z" />
      </svg>
    ),
  },
  react: {
    name: 'React',
    color: '#61DAFB',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 9a3 3 0 100 6 3 3 0 000-6zm0-7c-4.41 0-8 2.24-8 5 0 1.25.75 2.4 2.03 3.33-.29.54-.53 1.13-.7 1.76C3.39 12.63 2 14.15 2 16c0 2.76 3.59 5 8 5s8-2.24 8-5c0-1.85-1.39-3.37-3.33-3.91-.17-.63-.41-1.22-.7-1.76C19.25 9.4 20 8.25 20 7c0-2.76-3.59-5-8-5z" />
      </svg>
    ),
  },
  nodejs: {
    name: 'Node.js',
    color: '#339933',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2l10 5.8v11.6L12 25.2 2 19.4V7.8L12 2zm0 3.2L4.5 9.5v8.9L12 22.7l7.5-4.3V9.5L12 5.2z" />
      </svg>
    ),
  },
  git: {
    name: 'Git',
    color: '#F05032',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M21.7 10.7L13.3 2.3c-.4-.4-1-.4-1.4 0L9.5 4.7l2.8 2.8c.4-.1.9 0 1.2.3.4.4.4 1 0 1.4L11 11.7v4.6c.3.1.6.4.8.7.4.7.1 1.6-.6 2-.7.4-1.6.1-2-.6-.3-.5-.2-1.1.1-1.5v-4.5c-.3-.2-.6-.4-.8-.7-.4-.7-.1-1.6.6-2L11.8 7 9 4.2 2.3 10.9c-.4.4-.4 1 0 1.4l8.4 8.4c.4.4 1 .4 1.4 0l9.6-9.6c.4-.4.4-1 0-1.4z" />
      </svg>
    ),
  },
  mysql: {
    name: 'MySQL',
    color: '#4479A1',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
      </svg>
    ),
  },
};

interface IconRendererProps {
  value?: string | null;
  className?: string;
  defaultIcon?: string;
}

export function IconRenderer({
  value,
  className = 'h-5 w-5',
  defaultIcon = 'Cpu',
}: IconRendererProps) {
  if (!value) {
    const DefaultComponent = LUCIDE_ICON_MAP[defaultIcon] || Cpu;
    return <DefaultComponent className={className} />;
  }

  const rawVal = value.trim();

  // 1. Check if it's an image URL or media path
  if (
    rawVal.startsWith('http://') ||
    rawVal.startsWith('https://') ||
    rawVal.startsWith('/uploads/') ||
    rawVal.startsWith('data:image/')
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={rawVal}
        alt="Icon"
        crossOrigin="anonymous"
        className={`${className} object-contain`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // 2. Check if it's a tech brand SVG
  let normalizedKey = rawVal.toLowerCase().replace(/^(tech:|lucide:)/, '').trim();
  const aliasMap: Record<string, string> = {
    spring: 'spring-boot',
    springboot: 'spring-boot',
    postgres: 'postgresql',
    k8s: 'kubernetes',
    mongo: 'mongodb',
    node: 'nodejs',
  };
  if (aliasMap[normalizedKey]) {
    normalizedKey = aliasMap[normalizedKey];
  }

  if (TECH_SVG_MAP[normalizedKey]) {
    const techItem = TECH_SVG_MAP[normalizedKey];
    return <div className={`${className} flex items-center justify-center`}>{techItem.svg}</div>;
  }

  // 3. Check if it's a Lucide icon
  const iconName = rawVal.replace(/^lucide:/i, '').trim();
  const matchedKey = Object.keys(LUCIDE_ICON_MAP).find(
    (k) => k.toLowerCase() === iconName.toLowerCase()
  );

  if (matchedKey && LUCIDE_ICON_MAP[matchedKey]) {
    const LucideComponent = LUCIDE_ICON_MAP[matchedKey];
    return <LucideComponent className={className} />;
  }

  // 4. Default fallback
  const FallbackComponent = LUCIDE_ICON_MAP[defaultIcon] || Cpu;
  return <FallbackComponent className={className} />;
}

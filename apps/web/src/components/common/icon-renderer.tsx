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

// Curated authentic SVG Brand Vectors for popular infrastructure & developer technologies
export const TECH_SVG_MAP: Record<string, { name: string; color: string; svg: React.ReactNode }> = {
  docker: {
    name: 'Docker',
    color: '#2496ED',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#2496ED" d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.929 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m21.656 1.488a4.99 4.99 0 00-1.666-.884 6.786 6.786 0 00-2.316-.407c-.439 0-.877.037-1.311.11a.348.348 0 00-.285.342v1.547a.35.35 0 00.347.349c.408.01.815.044 1.22.102a4.42 4.42 0 011.696.671.35.35 0 00.472-.09c.394-.523.864-.997 1.402-1.405a.35.35 0 00.441-.335M.052 14.133a10.985 10.985 0 003.58 4.298c4.27 2.928 10.43 2.909 14.68-.047 3.013-2.095 4.887-5.597 5.033-9.255a.35.35 0 00-.472-.328c-.808.318-1.659.502-2.528.547a.35.35 0 00-.332.35 6.945 6.945 0 01-2.036 4.92 6.953 6.953 0 01-4.92 2.036H3.652a.35.35 0 00-.35.35c.01.89-.17 1.774-.53 2.585a.35.35 0 01-.482.164 10.02 10.02 0 01-2.238-1.579.35.35 0 01-.001-.498" />
      </svg>
    ),
  },
  kubernetes: {
    name: 'Kubernetes',
    color: '#326CE5',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#326CE5" d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0z" />
        <path fill="#FFFFFF" d="M11.666 2.082a.853.853 0 00-.46.128L3.092 6.485a.862.862 0 00-.43.746v8.06c0 .313.167.6.43.747l8.114 4.775a.86.86 0 00.86 0l8.114-4.775a.862.862 0 00.43-.746v-8.06a.862.862 0 00-.43-.746L12.096 2.21a.853.853 0 00-.43-.128zm.334 2.016l6.784 3.905-2.613 1.512-4.17-2.393v-3.024zm-1.71 0v3.024L6.12 7.115 3.507 5.603 10.29 2.098zm7.718 4.753v5.192l-2.618-1.514v-2.166l2.618-1.512zm-13.727 0l2.618 1.512v2.166L4.28 11.843V6.851zm6.863 1.503l3.316 1.896-3.316 1.897-3.316-1.897 3.316-1.896zm5.155 2.758l2.613 1.511-6.784 3.905v-3.024l4.17-2.392zm-10.31 0l4.17 2.392v3.024L4.708 12.423l2.613-1.511z" />
      </svg>
    ),
  },
  kafka: {
    name: 'Apache Kafka',
    color: '#231F20',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#231F20" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />
        <path fill="#FFFFFF" d="M11.8 5a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zm-4.4 4.6a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zm8.8 0a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zm-4.4 4.6a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8z" />
        <path stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" d="M11.8 7.4L7.4 12m4.4-4.6l4.4 4.6m-4.4 4.6L7.4 12m4.4 4.6l4.4-4.6" />
      </svg>
    ),
  },
  redis: {
    name: 'Redis',
    color: '#DC382D',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#DC382D" d="M22.95 9.07l-9.9-5.72a2.09 2.09 0 00-2.1 0L1.05 9.07a1.05 1.05 0 000 1.82l9.9 5.72a2.09 2.09 0 002.1 0l9.9-5.72a1.05 1.05 0 000-1.82z" />
        <path fill="#A3241C" d="M12 5.09l7.77 4.49L12 14.07 4.23 9.58 12 5.09z" />
        <path fill="#DC382D" d="M22.95 16.52l-9.9-5.72a2.09 2.09 0 00-2.1 0l-9.9 5.72a1.05 1.05 0 000 1.82l9.9 5.72a2.09 2.09 0 002.1 0l9.9-5.72a1.05 1.05 0 000-1.82z" />
        <path fill="#A3241C" d="M12 12.54l7.77 4.49L12 21.52l-7.77-4.49 7.77-4.49z" />
        <circle cx="12" cy="9.5" r="1.1" fill="#FFFFFF" />
        <circle cx="12" cy="17" r="1.1" fill="#FFFFFF" />
      </svg>
    ),
  },
  mongodb: {
    name: 'MongoDB',
    color: '#13AA52',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#13AA52" d="M12.001 0c-.394 0-.742.203-.941.516C10.05 2.11 5.92 8.784 5.92 14.332c0 4.14 2.723 7.828 6.081 9.668.21.115.467.115.677 0 3.358-1.84 6.082-5.528 6.082-9.668 0-5.548-4.13-12.222-5.14-13.816A1.08 1.08 0 0012.001 0z" />
        <path fill="#00ED64" d="M12.015 2.454c.783 1.34 3.738 6.643 3.738 10.92 0 2.94-1.782 5.688-3.738 7.072V2.454z" />
        <path fill="#001E2B" d="M12 15.5c-.3 0-.6-.2-.6-.6 0-2 1-3.6 2.4-4.8.4-.3 1-.3 1.3.1.3.4.3 1-.1 1.3-1.1 1-1.8 2.2-1.8 3.4 0 .4-.5.6-1.2.6z" />
      </svg>
    ),
  },
  nestjs: {
    name: 'NestJS',
    color: '#E0234E',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E0234E" d="M20.9 4.3c-.6-.7-1.5-1.1-2.5-1.1-.7 0-1.4.2-2 .6L14 2.2c-.3-.2-.7-.2-1 0L10.6 4c-.3-.2-.7-.3-1.1-.3-.6 0-1.2.2-1.7.5L5.7 3c-.4-.3-1-.3-1.4 0L1.7 5.2c-.4.3-.6.8-.5 1.3l1.8 11.2c.1.7.6 1.3 1.3 1.6l7.2 3.1c.3.1.6.1.9 0l7.2-3.1c.7-.3 1.2-.9 1.3-1.6l1.8-11.2c.1-.8-.2-1.6-.9-2.2zM12 20.3l-6.4-2.8-1.5-9.4 2.3-1.6 2.3 1.6c.4.3 1 .3 1.4 0l1.9-1.3 1.9 1.3c.4.3 1 .3 1.4 0l2.3-1.6 2.3 1.6-1.5 9.4L12 20.3z" />
      </svg>
    ),
  },
  nextjs: {
    name: 'Next.js',
    color: '#000000',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#000000" />
        <path fill="#FFFFFF" d="M14.88 17.5l-6.28-8.5v8.5H7V6.5h1.68l6.44 8.7V6.5h1.6v11h-1.84z" />
      </svg>
    ),
  },
  postgresql: {
    name: 'PostgreSQL',
    color: '#336791',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#336791" d="M12 1.5c-5.8 0-10.5 4.7-10.5 10.5 0 2.8 1.1 5.3 2.9 7.2.3-.6.6-1.3 1-1.9-.3-.5-.4-1.1-.4-1.8 0-2.2 1.8-4 4-4 .6 0 1.2.1 1.7.4.8-1.5 2.4-2.4 4.3-2.4 2.5 0 4.6 1.8 4.9 4.2 1.5.3 2.6 1.6 2.6 3.2 0 1.8-1.5 3.3-3.3 3.3H8.5c-.8 0-1.5-.4-1.9-1-.4.5-.8 1-1.1 1.6 1.8 1.8 4.3 2.9 7 2.9 5.8 0 10.5-4.7 10.5-10.5S17.8 1.5 12 1.5zm-3 8c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z" />
      </svg>
    ),
  },
  'spring-boot': {
    name: 'Spring Boot',
    color: '#6DB33F',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#6DB33F" d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.4 2.7 8.2 6.6 9.7.8.3 1.6-.2 1.6-1.1v-2.3c0-.6.4-1.1 1-1.1h1.6c.6 0 1 .4 1 1v2.4c0 .8.8 1.4 1.6 1.1 3.9-1.5 6.6-5.3 6.6-9.7 0-5.8-4.7-10.5-10.5-10.5z" />
        <path fill="#FFFFFF" d="M12 5.5a6.5 6.5 0 00-6.5 6.5c0 2.3 1.2 4.3 3 5.5l1.5-1.5a4.5 4.5 0 114 0l1.5 1.5c1.8-1.2 3-3.2 3-5.5a6.5 6.5 0 00-6.5-6.5zm-1 3.5h2v4h-2z" />
      </svg>
    ),
  },
  typescript: {
    name: 'TypeScript',
    color: '#3178C6',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path fill="#FFFFFF" d="M5.5 10.5h5v2H8.8v6H6.7v-6H5.5v-2zm7.2 4.6c.7.5 1.6.8 2.5.8 1 0 1.5-.4 1.5-1 0-.6-.5-.9-1.8-1.3-1.8-.6-2.9-1.5-2.9-3 0-1.7 1.3-3 3.3-3 1.1 0 2.1.3 2.9.9l-.7 1.8c-.7-.5-1.4-.7-2.2-.7-.9 0-1.4.4-1.4 1 0 .6.5.9 1.8 1.3 1.9.6 2.9 1.5 2.9 3 0 1.8-1.4 3.1-3.6 3.1-1.3 0-2.5-.4-3.4-1.1l.9-1.8z" />
      </svg>
    ),
  },
  golang: {
    name: 'Go',
    color: '#00ADD8',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#00ADD8" />
        <path fill="#FFFFFF" d="M7.5 7.5h4v1.8H9.5v5.4h-2V7.5zm5.5 4.5c0-2.8 2-4.8 4.8-4.8 1.4 0 2.5.4 3.2 1.1l-1.2 1.5c-.5-.5-1.2-.8-2-.8-1.6 0-2.7 1.2-2.7 2.9 0 1.7 1.1 2.9 2.7 2.9.8 0 1.5-.3 2-.8v-1.2h-2v-1.8h4.1v4c-1 .9-2.4 1.5-4.1 1.5-2.8.1-4.8-1.8-4.8-4.5z" />
      </svg>
    ),
  },
  python: {
    name: 'Python',
    color: '#3776AB',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#3776AB" d="M11.914 1C6.2 1 6.55 3.48 6.55 3.48l.007 2.57h5.43v.77H4.4S.8 6.4.8 12.16c0 5.75 3.13 5.56 3.13 5.56h1.87v-2.62s-.1-3.13 3.08-3.13h5.27v-.76H8.87V8.62h10.12s3.59.41 3.59-5.34c0-5.7-3.23-5.96-3.23-5.96h-7.44zm-1.63 1.61a.93.93 0 110 1.85.93.93 0 010-1.85z" />
        <path fill="#FFD43B" d="M12.086 23c5.71 0 5.36-2.48 5.36-2.48l-.007-2.57h-5.43v-.77h7.58s3.6.4 3.6-5.36c0-5.75-3.13-5.56-3.13-5.56h-1.87v2.62s.1 3.13-3.08 3.13H9.87v.76h5.27v2.62H5.01s-3.59-.41-3.59 5.34c0 5.7 3.23 5.96 3.23 5.96h7.44zm1.63-1.61a.93.93 0 110-1.85.93.93 0 010 1.85z" />
      </svg>
    ),
  },
  rust: {
    name: 'Rust',
    color: '#000000',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#000000" />
        <path fill="#DEA584" d="M12 3a9 9 0 100 18 9 9 0 000-18zm-2 4h4.5c1.7 0 3 1.1 3 2.8 0 1.3-.8 2.2-1.9 2.6l2.4 4.6h-2.5l-2.1-4H12v4h-2V7zm2 4h2.2c.7 0 1.3-.4 1.3-1s-.6-1-1.3-1H12v2z" />
      </svg>
    ),
  },
  aws: {
    name: 'AWS',
    color: '#FF9900',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#232F3E" />
        <path fill="#FF9900" d="M6.2 10.5c0-.8.5-1.5 1.5-1.5 1.2 0 1.5.8 1.5 2v2.5H7.7v-.6c-.3.4-.8.7-1.4.7-.9 0-1.6-.6-1.6-1.5 0-1.1.9-1.5 1.5-1.6zm1.5 1.5c-.3 0-.6.2-.6.6 0 .3.3.5.6.5.3 0 .6-.2.6-.5v-.6zm4.8-3v4.5h-1.5V9h1.5zm4.8 0l-1.3 4.5h-1.5l-1-3.2-1 3.2h-1.5L9 9h1.5l.8 3.1.9-3.1h1.4l.9 3.1.8-3.1h1.5zM4.5 16.5c3.5 2 8.5 2 12 0l-.5-.7c-3.1 1.7-7.7 1.7-11 0l-.5.7z" />
      </svg>
    ),
  },
  nodejs: {
    name: 'Node.js',
    color: '#339933',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#5FA04E" d="M12 1L2 6.8v11.4L12 24l10-5.8V6.8L12 1z" />
        <path fill="#333333" d="M12 5.5l6.5 3.8v7.4L12 20.5l-6.5-3.8V9.3L12 5.5z" />
        <path fill="#5FA04E" d="M11 9.5h2v5h-2z" />
      </svg>
    ),
  },
  react: {
    name: 'React',
    color: '#61DAFB',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#20232A" />
        <ellipse cx="12" cy="12" rx="8.5" ry="3.3" fill="none" stroke="#61DAFB" strokeWidth="1.2" />
        <ellipse cx="12" cy="12" rx="8.5" ry="3.3" fill="none" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="8.5" ry="3.3" fill="none" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.6" fill="#61DAFB" />
      </svg>
    ),
  },
  graphql: {
    name: 'GraphQL',
    color: '#E10098',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E10098" d="M12 1.5L2.2 7.2v11.4L12 24.3l9.8-5.7V7.2L12 1.5zm0 2.4l7.7 4.5v9L12 21.9l-7.7-4.5v-9L12 3.9z" />
        <circle cx="12" cy="2" r="2" fill="#E10098" />
        <circle cx="21.5" cy="7.5" r="2" fill="#E10098" />
        <circle cx="21.5" cy="18.5" r="2" fill="#E10098" />
        <circle cx="12" cy="23.5" r="2" fill="#E10098" />
        <circle cx="2.5" cy="18.5" r="2" fill="#E10098" />
        <circle cx="2.5" cy="7.5" r="2" fill="#E10098" />
      </svg>
    ),
  },
  git: {
    name: 'Git',
    color: '#F05032',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path fill="#F05032" d="M21.7 10.7L13.3 2.3c-.4-.4-1-.4-1.4 0L9.5 4.7l2.8 2.8c.4-.1.9 0 1.2.3.4.4.4 1 0 1.4L11 11.7v4.6c.3.1.6.4.8.7.4.7.1 1.6-.6 2-.7.4-1.6.1-2-.6-.3-.5-.2-1.1.1-1.5v-4.5c-.3-.2-.6-.4-.8-.7-.4-.7-.1-1.6.6-2L11.8 7 9 4.2 2.3 10.9c-.4.4-.4 1 0 1.4l8.4 8.4c.4.4 1 .4 1.4 0l9.6-9.6c.4-.4.4-1 0-1.4z" />
      </svg>
    ),
  },
  mysql: {
    name: 'MySQL',
    color: '#00758F',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#00758F" />
        <path fill="#F29111" d="M12 4c-3.5 0-6.5 2-8 5 1.5-1 3.5-1.5 5.5-1.5 3 0 5.5 1.5 7 4 1-1.5 1.5-3.5 1.5-5.5 0-.7-.1-1.3-.3-2H12z" />
        <path fill="#FFFFFF" d="M6 14.5c.8 1.8 2.5 3.2 4.5 3.5-1.5-.5-2.8-1.5-3.5-2.8l-1-.7zm10.5-2c-.5 2-2 3.5-4 4 1.8-.2 3.2-1.2 4-2.8l0-1.2z" />
      </svg>
    ),
  },
  linux: {
    name: 'Linux',
    color: '#FCC624',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#000000" />
        <path fill="#FCC624" d="M12 4c-2 0-3.5 1.5-3.5 3.5 0 1 .4 2 1 2.7-.8 1-1.5 2.5-1.5 4.3 0 2.5 1.8 4.5 4 4.5s4-2 4-4.5c0-1.8-.7-3.3-1.5-4.3.6-.7 1-1.7 1-2.7C15.5 5.5 14 4 12 4z" />
        <circle cx="10.5" cy="7" r="1" fill="#FFFFFF" />
        <circle cx="13.5" cy="7" r="1" fill="#FFFFFF" />
        <circle cx="10.8" cy="7.2" r=".4" fill="#000000" />
        <circle cx="13.2" cy="7.2" r=".4" fill="#000000" />
        <path fill="#FF8800" d="M11 8.5h2l-1 1.5z" />
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
  const normalizedKey = rawVal
    .toLowerCase()
    .replace(/^(tech:|lucide:)/, '')
    .trim()
    .replace(/[\s_.-]+/g, '');

  const techMapKeys = Object.keys(TECH_SVG_MAP);
  const matchedTechKey = techMapKeys.find(
    (k) => k.replace(/[\s_.-]+/g, '') === normalizedKey
  );

  const aliasMap: Record<string, string> = {
    spring: 'spring-boot',
    springboot: 'spring-boot',
    postgres: 'postgresql',
    postgresql: 'postgresql',
    k8s: 'kubernetes',
    kube: 'kubernetes',
    kubernetes: 'kubernetes',
    mongo: 'mongodb',
    mongodb: 'mongodb',
    node: 'nodejs',
    nodejs: 'nodejs',
    golang: 'golang',
    go: 'golang',
    next: 'nextjs',
    nextjs: 'nextjs',
    nest: 'nestjs',
    nestjs: 'nestjs',
    docker: 'docker',
    redis: 'redis',
    kafka: 'kafka',
    apachekafka: 'kafka',
  };

  const finalKey = matchedTechKey || aliasMap[normalizedKey];

  if (finalKey && TECH_SVG_MAP[finalKey]) {
    const techItem = TECH_SVG_MAP[finalKey];
    return (
      <div className={`${className} flex items-center justify-center shrink-0`}>
        {techItem.svg}
      </div>
    );
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

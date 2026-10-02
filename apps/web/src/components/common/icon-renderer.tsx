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

import {
  SiRedis,
  SiApachekafka,
  SiPostgresql,
  SiMongodb,
  SiNestjs,
  SiSpringboot,
  SiDocker,
  SiKubernetes,
  SiNextdotjs,
  SiTypescript,
  SiGo,
  SiPython,
  SiRust,
  SiNodedotjs,
  SiReact,
  SiGraphql,
  SiGit,
  SiMysql,
  SiLinux,
  SiElasticsearch,
  SiRabbitmq,
  SiNginx,
  SiPrometheus,
  SiGrafana,
  SiApachecassandra,
  SiClickhouse,
  SiApachespark,
  SiApacheflink,
  SiApachepulsar,
  SiTerraform,
  SiOpenjdk,
  SiCplusplus,
  SiKotlin,
  SiSwift,
  SiFlutter,
  SiGooglecloud,
  SiCloudflare,
} from '@icons-pack/react-simple-icons';

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

// Curated authentic, official SVG Brand Vectors for popular infrastructure & developer technologies
export const TECH_SVG_MAP: Record<string, { name: string; color: string; svg: React.ReactNode }> = {
  redis: {
    name: 'Redis',
    color: '#DC382D',
    svg: <SiRedis color="#DC382D" className="w-full h-full" />,
  },
  kafka: {
    name: 'Apache Kafka',
    color: '#231F20',
    svg: <SiApachekafka color="#231F20" className="w-full h-full dark:invert" />,
  },
  postgresql: {
    name: 'PostgreSQL',
    color: '#4169E1',
    svg: <SiPostgresql color="#4169E1" className="w-full h-full" />,
  },
  mongodb: {
    name: 'MongoDB',
    color: '#47A248',
    svg: <SiMongodb color="#47A248" className="w-full h-full" />,
  },
  nestjs: {
    name: 'NestJS',
    color: '#E0234E',
    svg: <SiNestjs color="#E0234E" className="w-full h-full" />,
  },
  'spring-boot': {
    name: 'Spring Boot',
    color: '#6DB33F',
    svg: <SiSpringboot color="#6DB33F" className="w-full h-full" />,
  },
  docker: {
    name: 'Docker',
    color: '#2496ED',
    svg: <SiDocker color="#2496ED" className="w-full h-full" />,
  },
  kubernetes: {
    name: 'Kubernetes',
    color: '#326CE5',
    svg: <SiKubernetes color="#326CE5" className="w-full h-full" />,
  },
  nextjs: {
    name: 'Next.js',
    color: '#000000',
    svg: <SiNextdotjs color="#000000" className="w-full h-full dark:invert" />,
  },
  typescript: {
    name: 'TypeScript',
    color: '#3178C6',
    svg: <SiTypescript color="#3178C6" className="w-full h-full" />,
  },
  golang: {
    name: 'Go',
    color: '#00ADD8',
    svg: <SiGo color="#00ADD8" className="w-full h-full" />,
  },
  python: {
    name: 'Python',
    color: '#3776AB',
    svg: <SiPython color="#3776AB" className="w-full h-full" />,
  },
  rust: {
    name: 'Rust',
    color: '#000000',
    svg: <SiRust color="#000000" className="w-full h-full dark:invert" />,
  },
  aws: {
    name: 'AWS',
    color: '#FF9900',
    svg: (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.2 10.4c0-.8.5-1.5 1.5-1.5 1.2 0 1.5.8 1.5 2v2.6H7.7v-.6c-.3.4-.8.7-1.4.7-.9 0-1.6-.6-1.6-1.5 0-1.1.9-1.5 1.5-1.7zm1.5 1.6c-.3 0-.6.2-.6.6 0 .3.3.5.6.5.3 0 .6-.2.6-.5v-.6zm4.8-3.1v4.6h-1.5V8.9h1.5zm4.8 0l-1.3 4.6h-1.5l-1-3.3-1 3.3h-1.5L9 8.9h1.5l.8 3.2.9-3.2h1.4l.9 3.2.8-3.2h1.5z"
          fill="#232F3E"
          className="dark:fill-white"
        />
        <path d="M4.5 16.8c3.5 2 8.5 2 12 0" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 15l2 2-2.5.8z" fill="#FF9900" />
      </svg>
    ),
  },
  nodejs: {
    name: 'Node.js',
    color: '#5FA04E',
    svg: <SiNodedotjs color="#5FA04E" className="w-full h-full" />,
  },
  react: {
    name: 'React',
    color: '#61DAFB',
    svg: <SiReact color="#61DAFB" className="w-full h-full" />,
  },
  graphql: {
    name: 'GraphQL',
    color: '#E10098',
    svg: <SiGraphql color="#E10098" className="w-full h-full" />,
  },
  git: {
    name: 'Git',
    color: '#F05032',
    svg: <SiGit color="#F05032" className="w-full h-full" />,
  },
  mysql: {
    name: 'MySQL',
    color: '#4479A1',
    svg: <SiMysql color="#4479A1" className="w-full h-full" />,
  },
  linux: {
    name: 'Linux',
    color: '#FCC624',
    svg: <SiLinux color="#FCC624" className="w-full h-full" />,
  },
  elasticsearch: {
    name: 'Elasticsearch',
    color: '#005571',
    svg: <SiElasticsearch color="#005571" className="w-full h-full" />,
  },
  rabbitmq: {
    name: 'RabbitMQ',
    color: '#FF6600',
    svg: <SiRabbitmq color="#FF6600" className="w-full h-full" />,
  },
  nginx: {
    name: 'Nginx',
    color: '#009639',
    svg: <SiNginx color="#009639" className="w-full h-full" />,
  },
  prometheus: {
    name: 'Prometheus',
    color: '#E6522C',
    svg: <SiPrometheus color="#E6522C" className="w-full h-full" />,
  },
  grafana: {
    name: 'Grafana',
    color: '#F46800',
    svg: <SiGrafana color="#F46800" className="w-full h-full" />,
  },
  cassandra: {
    name: 'Apache Cassandra',
    color: '#1287B1',
    svg: <SiApachecassandra color="#1287B1" className="w-full h-full" />,
  },
  clickhouse: {
    name: 'ClickHouse',
    color: '#FEE000',
    svg: <SiClickhouse color="#FEE000" className="w-full h-full" />,
  },
  spark: {
    name: 'Apache Spark',
    color: '#E25A1C',
    svg: <SiApachespark color="#E25A1C" className="w-full h-full" />,
  },
  flink: {
    name: 'Apache Flink',
    color: '#E6526F',
    svg: <SiApacheflink color="#E6526F" className="w-full h-full" />,
  },
  pulsar: {
    name: 'Apache Pulsar',
    color: '#188FFF',
    svg: <SiApachepulsar color="#188FFF" className="w-full h-full" />,
  },
  terraform: {
    name: 'Terraform',
    color: '#844FBA',
    svg: <SiTerraform color="#844FBA" className="w-full h-full" />,
  },
  java: {
    name: 'Java (OpenJDK)',
    color: '#5382A1',
    svg: <SiOpenjdk color="#5382A1" className="w-full h-full" />,
  },
  cplusplus: {
    name: 'C++',
    color: '#00599C',
    svg: <SiCplusplus color="#00599C" className="w-full h-full" />,
  },
  kotlin: {
    name: 'Kotlin',
    color: '#7F52FF',
    svg: <SiKotlin color="#7F52FF" className="w-full h-full" />,
  },
  swift: {
    name: 'Swift',
    color: '#F05138',
    svg: <SiSwift color="#F05138" className="w-full h-full" />,
  },
  flutter: {
    name: 'Flutter',
    color: '#02569B',
    svg: <SiFlutter color="#02569B" className="w-full h-full" />,
  },
  googlecloud: {
    name: 'Google Cloud',
    color: '#4285F4',
    svg: <SiGooglecloud color="#4285F4" className="w-full h-full" />,
  },
  cloudflare: {
    name: 'Cloudflare',
    color: '#F38020',
    svg: <SiCloudflare color="#F38020" className="w-full h-full" />,
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
    'spring-boot': 'spring-boot',
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
    'apache-kafka': 'kafka',
    aws: 'aws',
    amazon: 'aws',
    react: 'react',
    reactjs: 'react',
    graphql: 'graphql',
    git: 'git',
    mysql: 'mysql',
    linux: 'linux',
    elasticsearch: 'elasticsearch',
    elastic: 'elasticsearch',
    rabbitmq: 'rabbitmq',
    nginx: 'nginx',
    prometheus: 'prometheus',
    grafana: 'grafana',
    cassandra: 'cassandra',
    apachecassandra: 'cassandra',
    clickhouse: 'clickhouse',
    spark: 'spark',
    apachespark: 'spark',
    flink: 'flink',
    apacheflink: 'flink',
    pulsar: 'pulsar',
    apachepulsar: 'pulsar',
    terraform: 'terraform',
    java: 'java',
    openjdk: 'java',
    cpp: 'cplusplus',
    cplusplus: 'cplusplus',
    kotlin: 'kotlin',
    swift: 'swift',
    flutter: 'flutter',
    gcp: 'googlecloud',
    googlecloud: 'googlecloud',
    cloudflare: 'cloudflare',
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

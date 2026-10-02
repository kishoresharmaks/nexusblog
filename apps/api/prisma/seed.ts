import { PrismaClient, Role, ArticleStatus, DifficultyLevel, ArticleType, GuestPostStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  console.log('🌱 Starting Comprehensive NexusBlog Database Seeding...');

  // 1. Seed Users (Super Admin, Lead Authors, Contributors, Reader)
  const defaultPasswordHash = await hashPassword('NexusSuperAdmin2026!');
  const authorPasswordHash = await hashPassword('NexusAuthor2026!');

  const usersData = [
    {
      name: 'Nexus Lead Architect',
      username: 'nexusadmin',
      email: 'admin@nexusblog.dev',
      passwordHash: defaultPasswordHash,
      bio: 'Lead Architect & Core Contributor to NexusBlog Engineering Platform.',
      role: Role.SUPER_ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      website: 'https://nexusblog.dev',
      github: 'nexusadmin',
    },
    {
      name: 'Alex Rivera',
      username: 'alexdev',
      email: 'alex@nexusblog.dev',
      passwordHash: authorPasswordHash,
      bio: 'Principal Distributed Systems Engineer. Specializing in high-throughput caching and message brokers.',
      role: Role.AUTHOR,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      github: 'alexrivera',
    },
    {
      name: 'Elena Rostova',
      username: 'erostova',
      email: 'elena@nexusblog.dev',
      passwordHash: authorPasswordHash,
      bio: 'Database Internals Specialist & PostgreSQL Performance Consultant.',
      role: Role.AUTHOR,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      github: 'erostova',
    },
    {
      name: 'Marcus Vance',
      username: 'marcusv',
      email: 'marcus@nexusblog.dev',
      passwordHash: authorPasswordHash,
      bio: 'JVM Performance & Concurrency Researcher. Author of Spring Boot scaling guides.',
      role: Role.AUTHOR,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      github: 'marcusv',
    },
    {
      name: 'David Chen',
      username: 'davidchen',
      email: 'david@nexusblog.dev',
      passwordHash: authorPasswordHash,
      bio: 'Staff Cloud Infrastructure Architect & Guest Contributor.',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      github: 'davidchen',
    },
    {
      name: 'Sarah Lin',
      username: 'sarahlin',
      email: 'sarah@nexusblog.dev',
      passwordHash: authorPasswordHash,
      bio: 'Distributed Systems Enthusiast & Golang Engineer.',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      github: 'sarahlin',
    },
  ];

  const userMap: Record<string, string> = {};

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          ...u,
          status: 'ACTIVE',
          emailVerified: true,
        },
      });
      userMap[u.username] = created.id;
      console.log(`✅ Seeded User: ${u.name} (@${u.username}, ${u.role})`);
    } else {
      userMap[u.username] = existing.id;
      console.log(`ℹ️ User exists: ${existing.email}`);
    }
  }

  // 2. Seed 10 Core Categories
  const categoriesData = [
    {
      name: 'System Design',
      slug: 'system-design',
      description: 'Architectural patterns, high-level blueprints, and distributed designs.',
      image: 'lucide:Layers',
      order: 1,
    },
    {
      name: 'Backend Engineering',
      slug: 'backend-engineering',
      description: 'Deep dives into server-side development, concurrency, and clean architecture.',
      image: 'lucide:Server',
      order: 2,
    },
    {
      name: 'Distributed Systems',
      slug: 'distributed-systems',
      description: 'Consensus protocols, partitioning, replication, and fault tolerance.',
      image: 'lucide:Workflow',
      order: 3,
    },
    {
      name: 'Databases',
      slug: 'databases',
      description: 'Query optimization, indexing strategies, schema modeling, and scaling storage.',
      image: 'lucide:Database',
      order: 4,
    },
    {
      name: 'APIs',
      slug: 'apis',
      description: 'REST, gRPC, GraphQL, WebSocket patterns, and API gateway engineering.',
      image: 'lucide:Zap',
      order: 5,
    },
    {
      name: 'DevOps',
      slug: 'devops',
      description: 'CI/CD pipelines, containerization, infrastructure as code, and automation.',
      image: 'lucide:HardDrive',
      order: 6,
    },
    {
      name: 'Cloud',
      slug: 'cloud',
      description: 'Serverless, edge computing, AWS/GCP architecture, and cloud networking.',
      image: 'lucide:Cloud',
      order: 7,
    },
    {
      name: 'Performance',
      slug: 'performance',
      description: 'Memory profiling, low-latency optimization, and benchmarking.',
      image: 'lucide:Activity',
      order: 8,
    },
    {
      name: 'Observability',
      slug: 'observability',
      description: 'Metrics, OpenTelemetry distributed tracing, alerting, and structured logging.',
      image: 'lucide:Eye',
      order: 9,
    },
    {
      name: 'AI Engineering',
      slug: 'ai-engineering',
      description: 'LLM infrastructure, vector databases, embeddings, and autonomous agent systems.',
      image: 'lucide:Sparkles',
      order: 10,
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      const created = await prisma.category.create({ data: cat });
      categoryMap[cat.slug] = created.id;
      console.log(`  + Category: ${cat.name}`);
    } else {
      if (!existing.image) {
        await prisma.category.update({
          where: { id: existing.id },
          data: { image: cat.image },
        });
      }
      categoryMap[cat.slug] = existing.id;
    }
  }

  // 3. Seed 9 Technologies
  const technologiesData = [
    {
      name: 'Redis',
      slug: 'redis',
      description: 'In-memory data structure store used as a database, cache, and message broker.',
      logo: 'tech:redis',
      officialUrl: 'https://redis.io',
      docsUrl: 'https://redis.io/docs',
    },
    {
      name: 'Kafka',
      slug: 'kafka',
      description: 'Distributed event streaming platform for high-performance data pipelines.',
      logo: 'tech:kafka',
      officialUrl: 'https://kafka.apache.org',
      docsUrl: 'https://kafka.apache.org/documentation',
    },
    {
      name: 'PostgreSQL',
      slug: 'postgresql',
      description: 'Advanced open-source relational database with powerful indexing and extensions.',
      logo: 'tech:postgresql',
      officialUrl: 'https://www.postgresql.org',
      docsUrl: 'https://www.postgresql.org/docs',
    },
    {
      name: 'MongoDB',
      slug: 'mongodb',
      description: 'Document database designed for flexibility, scalability, and developer ergonomics.',
      logo: 'tech:mongodb',
      officialUrl: 'https://www.mongodb.com',
      docsUrl: 'https://www.mongodb.com/docs',
    },
    {
      name: 'NestJS',
      slug: 'nestjs',
      description: 'Progressive Node.js framework for building efficient and scalable server-side apps.',
      logo: 'tech:nestjs',
      officialUrl: 'https://nestjs.com',
      docsUrl: 'https://docs.nestjs.com',
    },
    {
      name: 'Spring Boot',
      slug: 'spring-boot',
      description: 'Enterprise Java framework for building stand-alone production-grade applications.',
      logo: 'tech:spring-boot',
      officialUrl: 'https://spring.io/projects/spring-boot',
      docsUrl: 'https://docs.spring.io/spring-boot/docs/current/reference/html',
    },
    {
      name: 'Next.js',
      slug: 'nextjs',
      description: 'React framework for building full-stack web applications with Server Components.',
      logo: 'tech:nextjs',
      officialUrl: 'https://nextjs.org',
      docsUrl: 'https://nextjs.org/docs',
    },
    {
      name: 'Kubernetes',
      slug: 'kubernetes',
      description: 'Open-source container orchestration system for automating application deployment.',
      logo: 'tech:kubernetes',
      officialUrl: 'https://kubernetes.io',
      docsUrl: 'https://kubernetes.io/docs',
    },
    {
      name: 'Docker',
      slug: 'docker',
      description: 'Platform for developing, shipping, and running applications in lightweight containers.',
      logo: 'tech:docker',
      officialUrl: 'https://www.docker.com',
      docsUrl: 'https://docs.docker.com',
    },
  ];

  const techMap: Record<string, string> = {};

  for (const tech of technologiesData) {
    const existing = await prisma.technology.findUnique({ where: { slug: tech.slug } });
    if (!existing) {
      const created = await prisma.technology.create({ data: tech });
      techMap[tech.slug] = created.id;
      console.log(`  + Technology: ${tech.name}`);
    } else {
      if (!existing.logo) {
        await prisma.technology.update({
          where: { id: existing.id },
          data: { logo: tech.logo },
        });
      }
      techMap[tech.slug] = existing.id;
    }
  }

  // 4. Seed Core Tags
  const tagsData = [
    { name: 'Rate Limiting', slug: 'rate-limiting', description: 'Techniques for controlling traffic rate' },
    { name: 'Caching', slug: 'caching', description: 'Multi-layer cache architectures and invalidation' },
    { name: 'Sharding', slug: 'sharding', description: 'Database partitioning and horizontal scaling' },
    { name: 'Message Queue', slug: 'message-queue', description: 'Asynchronous task queuing and worker pools' },
    { name: 'Microservices', slug: 'microservices', description: 'Service decomposition and domain boundary design' },
    { name: 'Event-Driven', slug: 'event-driven', description: 'Event sourcing, CQRS, and pub/sub patterns' },
    { name: 'Indexing', slug: 'indexing', description: 'B-Trees, LSM trees, and query optimization' },
    { name: 'CI/CD', slug: 'cicd', description: 'Continuous integration and automated delivery pipelines' },
    { name: 'Consensus', slug: 'consensus', description: 'Raft, Paxos, and distributed state coordination' },
  ];

  const tagMap: Record<string, string> = {};

  for (const tag of tagsData) {
    const existing = await prisma.tag.findUnique({ where: { slug: tag.slug } });
    if (!existing) {
      const created = await prisma.tag.create({ data: tag });
      tagMap[tag.slug] = created.id;
      console.log(`  + Tag: ${tag.name}`);
    } else {
      tagMap[tag.slug] = existing.id;
    }
  }

  // 5. Seed Series
  const seriesSlug = 'system-design-zero-to-production';
  let seriesId = '';
  const existingSeries = await prisma.series.findUnique({ where: { slug: seriesSlug } });

  if (!existingSeries) {
    const createdSeries = await prisma.series.create({
      data: {
        title: 'System Design: From Zero to Production',
        slug: seriesSlug,
        description: 'A comprehensive engineering series guiding backend developers from single-node instances to highly resilient distributed architectures.',
        published: true,
      },
    });
    seriesId = createdSeries.id;
    console.log(`✅ Seeded Series: System Design: From Zero to Production`);
  } else {
    seriesId = existingSeries.id;
  }

  // 6. Seed Technical Articles with Full MDX Content
  const articlesData = [
    {
      title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
      slug: 'designing-distributed-rate-limiter',
      excerpt:
        'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
      categorySlug: 'system-design',
      authorUsername: 'alexdev',
      techSlugs: ['redis', 'nestjs'],
      tagSlugs: ['rate-limiting', 'caching', 'microservices'],
      difficulty: DifficultyLevel.ADVANCED,
      type: ArticleType.SYSTEM_DESIGN,
      status: ArticleStatus.PUBLISHED,
      featured: true,
      readingTime: 12,
      viewsCount: 14200,
      likesCount: 284,
      bookmarksCount: 340,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
      seoTitle: 'Designing a Distributed Rate Limiter with Redis and Lua | NexusBlog',
      seoDescription: 'Learn how to build sub-millisecond sliding window rate limiters with Redis and Lua scripts.',
      seriesOrder: 1,
      content: `## Introduction

Rate limiting is critical for protecting upstream services, preventing cascading failures, and enforcing API tier quotas. When scaling API gateways handling hundreds of thousands of concurrent requests, in-memory rate limiting on individual instances falls short because traffic is load-balanced across multiple nodes.

<Callout type="tip" title="Core Objective">
Coordinating rate limit counters across horizontally scaled NestJS instances with sub-millisecond overhead using Redis and atomic Lua scripts.
</Callout>

## Architecture

\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>Gateway: HTTP GET /api/v1/resource
    Gateway->>Redis: EVALSHA sliding_window.lua (Key, Limit, Window)
    Redis-->>Gateway: [Allowed: 1, Remaining: 42, Reset: 15000]
    Gateway->>Backend: Forward Request
    Backend-->>Client: HTTP 200 OK
\`\`\`

<Callout type="warning" title="Distributed Clock Skew">
Ensure all Redis nodes and API gateway instances synchronize via NTP. Time drift beyond 50ms will distort sliding window bucket calculation.
</Callout>

## Benchmark Results

<Benchmark
  title="Sliding Window vs Token Bucket (1M ops/sec)"
  description="Measured p99 latency under simulated 20ms network jitter."
  metrics={[
    { label: "Sliding Window (Lua)", value: "0.84ms", change: "-42% latency", trend: "up" },
    { label: "Token Bucket (Redis)", value: "1.12ms", change: "-28% latency", trend: "up" },
    { label: "Memory Footprint", value: "64MB", change: "O(1) memory", trend: "neutral" }
  ]}
/>

## Implementation Code

\`\`\`typescript
export async function acquireRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const clearBefore = now - windowMs;
  
  const result = await redis.eval(
    SLIDING_WINDOW_SCRIPT,
    1,
    key,
    now,
    clearBefore,
    limit
  );
  return result === 1;
}
\`\`\`
`,
    },
    {
      title: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
      slug: 'zero-downtime-postgresql-migrations',
      excerpt:
        'Understanding lock queues, ACCESS EXCLUSIVE table locks, expand-contract patterns, and executing safe DDL operations on production databases under heavy concurrency.',
      categorySlug: 'databases',
      authorUsername: 'erostova',
      techSlugs: ['postgresql', 'docker'],
      tagSlugs: ['indexing', 'sharding'],
      difficulty: DifficultyLevel.ADVANCED,
      type: ArticleType.DEEP_DIVE,
      status: ArticleStatus.PUBLISHED,
      featured: true,
      readingTime: 9,
      viewsCount: 22400,
      likesCount: 430,
      bookmarksCount: 512,
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
      seoTitle: 'Zero-Downtime PostgreSQL Schema Migrations | NexusBlog',
      seoDescription: 'Master safe lock-free DDL migrations in PostgreSQL for high-traffic applications.',
      seriesOrder: 2,
      content: `## Introduction

Performing schema migrations on a PostgreSQL database with hundreds of millions of records and thousands of write transactions per second requires strict avoidance of blocking table locks.

<Callout type="danger" title="The Dangerous Lock Queue">
Even a simple \`ALTER TABLE ADD COLUMN ... DEFAULT ...\` or \`CREATE INDEX\` can acquire an \`ACCESS EXCLUSIVE\` lock. If a long-running read query is currently active, the migration query gets blocked in the lock queue—subsequently blocking all succeeding SELECT, INSERT, and UPDATE queries!
</Callout>

## The Expand and Contract Pattern

To avoid locking tables and breaking running application instances during rolling deployments, we utilize the phased **Expand-Contract (Parallel Run)** strategy:

\`\`\`mermaid
stateDiagram-v2
    [*] --> Phase1_Expand: Add nullable column or index CONCURRENTLY
    Phase1_Expand --> Phase2_DualWrite: Deploy App v2 (Writes to both old and new columns)
    Phase2_DualWrite --> Phase3_Backfill: Asynchronous batch backfill historical rows
    Phase3_Backfill --> Phase4_Contract: Deploy App v3 (Reads only new column)
    Phase4_Contract --> Phase5_Cleanup: Drop deprecated old column asynchronously
    Phase5_Cleanup --> [*]
\`\`\`

## Safe vs Dangerous PostgreSQL DDL Commands

<Benchmark
  title="Lock Duration & Impact on 50M Row Table"
  description="Comparison of traditional vs non-blocking migration patterns."
  metrics={[
    { label: "Standard CREATE INDEX", value: "48s table lock", change: "100% blocked queries", trend: "down" },
    { label: "CREATE INDEX CONCURRENTLY", value: "0ms table lock", change: "Zero read/write blocking", trend: "up" },
    { label: "Lock Timeout Guard", value: "2000ms max", change: "Instant abort on lock wait", trend: "up" }
  ]}
/>

## Safe DDL Script Template

Always set a strict lock timeout and statement timeout before running DDL:

\`\`\`sql
-- Set aggressive lock timeout to fail fast if table is busy
SET lock_timeout = '2s';
SET statement_timeout = '30s';

-- Step 1: Add new column without default
ALTER TABLE users ADD COLUMN phone_normalized VARCHAR(32);

-- Step 2: Create index concurrently outside transaction block
-- Note: CONCURRENTLY cannot run inside a multi-statement transaction
CREATE INDEX CONCURRENTLY idx_users_phone_normalized ON users(phone_normalized);
\`\`\`
`,
    },
    {
      title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
      slug: 'kafka-partitioning-zero-data-loss',
      excerpt:
        'Guaranteed message ordering, consumer group rebalancing internals, and handling backpressure in distributed event stream pipelines.',
      categorySlug: 'distributed-systems',
      authorUsername: 'alexdev',
      techSlugs: ['kafka', 'docker'],
      tagSlugs: ['event-driven', 'consensus'],
      difficulty: DifficultyLevel.ADVANCED,
      type: ArticleType.SYSTEM_DESIGN,
      status: ArticleStatus.PUBLISHED,
      featured: false,
      readingTime: 15,
      viewsCount: 9800,
      likesCount: 160,
      bookmarksCount: 180,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      seoTitle: 'Kafka Partitioning Strategies for Zero Data Loss | NexusBlog',
      seoDescription: 'Design resilient Kafka producer, partitioner, and consumer architectures with strict ordering.',
      seriesOrder: 3,
      content: `## Overview

Apache Kafka enables petabyte-scale stream processing, but achieving **exactly-once semantics (EOS)** and zero message loss requires careful configuration across brokers, partition keys, and consumers.

<Callout type="tip" title="Key Guarantees">
Kafka guarantees message order strictly within a single partition, never across partitions. Choosing the right partition key is paramount.
</Callout>

## Partitioning Topology

\`\`\`mermaid
flowchart LR
    P[Event Producer] -->|Hash Partition Key: order_id| K[Kafka Broker Cluster]
    subgraph Partitions [Topic: orders.v1]
      P0[Partition 0: Leader Broker 1]
      P1[Partition 1: Leader Broker 2]
      P2[Partition 2: Leader Broker 3]
    end
    K --> P0
    K --> P1
    K --> P2
    P0 --> C0[Consumer Instance A]
    P1 --> C1[Consumer Instance B]
    P2 --> C2[Consumer Instance C]
\`\`\`

## Zero-Loss Producer Configuration

\`\`\`typescript
import { Kafka, CompressionTypes, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'order-processing-gateway',
  brokers: ['kafka-1.internal:9092', 'kafka-2.internal:9092', 'kafka-3.internal:9092'],
  logLevel: logLevel.WARN,
});

export const producer = kafka.producer({
  // Idempotent producer prevents duplicate message writes
  idempotent: true,
  maxInFlightRequests: 1,
  transactionTimeout: 30000,
});

export async function publishOrderEvent(orderId: string, payload: Record<string, unknown>) {
  await producer.send({
    topic: 'orders.v1',
    compression: CompressionTypes.GZIP,
    messages: [
      {
        key: orderId, // Guarantees all state transitions for this order land on same partition
        value: JSON.stringify({ ...payload, emittedAt: new Date().toISOString() }),
        headers: { correlationId: crypto.randomUUID() },
      },
    ],
    acks: -1, // acks=all: Wait for full In-Sync Replica (ISR) quorum commit
  });
}
\`\`\`
`,
    },
    {
      title: 'Benchmarking Reactive WebFlux vs Virtual Threads in Spring Boot 3.3',
      slug: 'benchmarking-webflux-vs-virtual-threads',
      excerpt:
        'Benchmarking throughput, context-switching overhead, and memory consumption of reactive WebFlux vs blocking I/O with carrier thread pin avoidance.',
      categorySlug: 'performance',
      authorUsername: 'marcusv',
      techSlugs: ['spring-boot'],
      tagSlugs: ['caching', 'microservices'],
      difficulty: DifficultyLevel.ADVANCED,
      type: ArticleType.DEEP_DIVE,
      status: ArticleStatus.DRAFT,
      featured: false,
      readingTime: 11,
      viewsCount: 7600,
      likesCount: 92,
      bookmarksCount: 110,
      publishedAt: null,
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      seoTitle: 'Spring Boot Virtual Threads vs WebFlux Benchmark | NexusBlog',
      seoDescription: 'Detailed performance analysis comparing Java 21 Project Loom virtual threads against reactive Spring WebFlux.',
      seriesOrder: null,
      content: `## Introduction

With the release of Java 21 and Spring Boot 3.2+, **Virtual Threads (Project Loom)** provide lightweight concurrency without the cognitive complexity of reactive programming models like Project Reactor and RxJava.

<Callout type="info" title="The Core Question">
Can imperative, blocking code running on virtual threads match the throughput and memory efficiency of reactive WebFlux under 50,000 concurrent websocket and HTTP connections?
</Callout>

## Benchmark Results (50K Concurrent Requests)

<Benchmark
  title="Virtual Threads vs Reactive WebFlux"
  description="Measured on AWS c6i.4xlarge with 16 vCPUs and 32GB RAM under 25ms database latency."
  metrics={[
    { label: "WebFlux Throughput", value: "42,800 req/s", change: "Reactive Non-Blocking", trend: "up" },
    { label: "Virtual Threads Throughput", value: "41,950 req/s", change: "98% of WebFlux", trend: "up" },
    { label: "p99 Latency (Virtual Threads)", value: "28.4ms", change: "Minimal jitter", trend: "neutral" },
    { label: "Developer Cognitive Load", value: "-75% complexity", change: "Clean stack traces", trend: "up" }
  ]}
/>

## Enabling Virtual Threads in Spring Boot

\`\`\`yaml
# application.yml
spring:
  threads:
    virtual:
      enabled: true
server:
  tomcat:
    threads:
      max: 200 # Serves as upper bound on carrier platform threads
\`\`\`

## Avoiding Carrier Thread Pinning

<Callout type="warning" title="Avoid Synchronized Blocks">
Avoid \`synchronized\` methods or blocks around blocking I/O operations as this pins the virtual thread to its underlying OS carrier thread. Migrate to \`java.util.concurrent.locks.ReentrantLock\` instead.
</Callout>
`,
    },
  ];

  const createdArticles: any[] = [];

  for (const art of articlesData) {
    const authorId = userMap[art.authorUsername] || userMap['nexusadmin'];
    const categoryId = categoryMap[art.categorySlug] || Object.values(categoryMap)[0];
    const techIds = art.techSlugs.map((s) => techMap[s]).filter(Boolean);
    const tagIds = art.tagSlugs.map((s) => tagMap[s]).filter(Boolean);

    const existing = await prisma.article.findUnique({ where: { slug: art.slug } });

    if (!existing) {
      const created = await prisma.article.create({
        data: {
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          content: art.content,
          coverImage: art.coverImage,
          difficulty: art.difficulty,
          type: art.type,
          status: art.status,
          featured: art.featured,
          readingTime: art.readingTime,
          viewsCount: art.viewsCount,
          likesCount: art.likesCount,
          bookmarksCount: art.bookmarksCount,
          publishedAt: art.publishedAt,
          seoTitle: art.seoTitle,
          seoDescription: art.seoDescription,
          author: { connect: { id: authorId } },
          category: { connect: { id: categoryId } },
          series: art.seriesOrder && seriesId ? { connect: { id: seriesId } } : undefined,
          seriesOrder: art.seriesOrder,
          technologies: {
            connect: techIds.map((id) => ({ id })),
          },
          tags: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
      });
      createdArticles.push(created);
      console.log(`✅ Seeded Article: ${created.title} (${created.status})`);
    } else {
      createdArticles.push(existing);
      console.log(`ℹ️ Article exists: ${existing.title}`);
    }
  }

  // 7. Seed Guest Posts (Moderation Queue)
  const guestPostsData = [
    {
      title: 'Designing Multi-Region Active-Active Postgres with CockroachDB & Raft',
      slug: 'multi-region-active-active-cockroachdb-raft',
      excerpt: 'Evaluating cross-region latency, quorum leases, and conflict-free transactional guarantees across three cloud regions.',
      categorySlug: 'databases',
      authorUsername: 'davidchen',
      status: GuestPostStatus.CHANGES_REQUESTED,
      editorialFeedback: 'Please add concrete benchmark metrics comparing p99 latency between local and multi-region quorum consensus.',
      content: `## Architecture Overview\n\nActive-active replication requires strict consensus protocols like Raft to avoid split-brain scenarios.\n\n<Callout type="warning" title="WAN Jitter">\nEnsure inter-region latencies remain under 60ms to prevent lease timeout churn.\n</Callout>\n`,
    },
    {
      title: 'Building a High-Performance Redis-Backed Priority Queue with Zero-Loss Semantics',
      slug: 'redis-backed-priority-queue-zero-loss',
      excerpt: 'Leveraging sorted sets, atomic Lua pop-and-ack transactions, and dead-letter queues in Node.js worker pools.',
      categorySlug: 'system-design',
      authorUsername: 'sarahlin',
      status: GuestPostStatus.UNDER_REVIEW,
      content: `## Introduction\n\nPriority queues in distributed architectures ensure SLA-critical background tasks execute ahead of bulk background jobs.\n\n\`\`\`typescript\nconsole.log('Priority Queue Lua Script');\n\`\`\`\n`,
    },
  ];

  for (const gp of guestPostsData) {
    const existing = await prisma.guestPost.findUnique({ where: { slug: gp.slug } });
    if (!existing) {
      const authorId = userMap[gp.authorUsername] || userMap['nexusadmin'];
      const categoryId = categoryMap[gp.categorySlug] || Object.values(categoryMap)[0];

      await prisma.guestPost.create({
        data: {
          title: gp.title,
          slug: gp.slug,
          excerpt: gp.excerpt,
          content: gp.content,
          status: gp.status,
          editorialFeedback: gp.editorialFeedback,
          author: { connect: { id: authorId } },
          category: { connect: { id: categoryId } },
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      });
      console.log(`✅ Seeded Guest Post: ${gp.title} (${gp.status})`);
    }
  }

  // 8. Seed Sample Comments
  if (createdArticles.length > 0) {
    const targetArticle = createdArticles[0];
    const commenterId = userMap['davidchen'] || userMap['nexusadmin'];

    const existingComment = await prisma.comment.findFirst({
      where: { articleId: targetArticle.id, userId: commenterId },
    });

    if (!existingComment) {
      await prisma.comment.create({
        data: {
          content: 'Excellent deep dive on sliding window Lua scripts! How does this compare in latency against the generic token bucket implementation in Redis?',
          articleId: targetArticle.id,
          userId: commenterId,
          status: 'APPROVED',
        },
      });
      console.log(`✅ Seeded Comment on Article: ${targetArticle.title}`);
    }
  }

  // 9. Seed Newsletter Subscribers
  const subscribers = [
    'lead.architect@netflix.com',
    'infrastructure@stripe.com',
    'backend.eng@uber.com',
    'developer@cloud.google.com',
    'dev@github.com',
  ];

  for (const email of subscribers) {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (!existing) {
      await prisma.newsletterSubscriber.create({ data: { email, active: true } });
      console.log(`  + Newsletter Subscriber: ${email}`);
    }
  }

  console.log('🎉 Comprehensive Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

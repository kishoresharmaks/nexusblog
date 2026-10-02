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

  // 10. Seed Legal & Informational CMS Pages
  const pagesData = [
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      excerpt: 'Learn how NexusBlog protects, processes, and respects user personal data.',
      seoTitle: 'Privacy Policy | NexusBlog',
      seoDescription: 'Read our transparent privacy policy, data protection standards, and GDPR/CCPA compliance commitments.',
      content: `# Privacy Policy

**Last updated:** October 2, 2026

At NexusBlog, we are committed to respecting your privacy and protecting any personal data you share with our platform. This Privacy Policy outlines what information we collect, how it is used, and the choices you have regarding your data.

---

### 1. Information We Collect

- **Account Information:** When you register, we collect your name, username, email address, password hash, and optional profile bio or social links.
- **Reading & Engagement Data:** When logged in, your reading progress, bookmarks, and posted comments are stored to personalize your developer dashboard experience.
- **Telemetry & Logs:** Standard server access logs (IP address, user agent, requested URL) are collected strictly for security auditing, DDoS prevention, and platform reliability.
- **Newsletter Subscription:** If you subscribe to our Technical Dispatch, we collect your email address solely to deliver weekly architecture blueprints.

---

### 2. How We Use Your Information

- To authenticate your account securely using cryptographic session tokens.
- To display your verified author persona when contributing blueprints or guest articles.
- To send essential transactional emails (email verification, password reset, account security alerts).
- To maintain, optimize, and diagnose platform performance.

We **never** sell, rent, or monetize your personal information to third-party data brokers or advertising networks.

---

### 3. Cookies and Local Storage

We use essential HTTP-only cookies and local storage exclusively for:
- Persisting secure authentication state across sessions.
- Remembering your chosen color theme preference (dark / light mode).

---

### 4. Data Retention & Your Rights

You have the right to:
- Access and download your stored account profile and reading history.
- Update or correct your profile details via your [Dashboard Profile Settings](/dashboard/profile).
- Request complete deletion of your account and associated session records.

---

### 5. Contact Us

If you have questions regarding this Privacy Policy or wish to exercise your data protection rights, please reach out via our [Contact Page](/contact) or email **privacy@nexusblog.dev**.`,
    },
    {
      title: 'Terms of Service',
      slug: 'terms-of-service',
      excerpt: 'General terms and conditions governing the access and use of NexusBlog.',
      seoTitle: 'Terms of Service | NexusBlog',
      seoDescription: 'Understand the terms, responsibilities, and intellectual property conditions for using NexusBlog.',
      content: `# Terms of Service

**Last updated:** October 2, 2026

Welcome to NexusBlog. By accessing or using our website, APIs, or published engineering content, you agree to be bound by these Terms of Service.

---

### 1. User Accounts & Security

- You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
- You must provide accurate, current, and complete registration information.
- Accounts that engage in automated scraping, spam, security exploitation, or malicious conduct will be suspended immediately.

---

### 2. Intellectual Property & Author Rights

- **Published Articles:** Authors retain moral and intellectual ownership of their original contributed blueprints and case studies. By publishing on NexusBlog, authors grant the platform a non-exclusive license to host, format, and syndicate the content.
- **Code Snippets:** Code samples and architecture recipes published on NexusBlog are provided under the MIT License unless explicitly annotated otherwise.

---

### 3. Acceptable Use Policy

When engaging with the platform (submitting guest posts, leaving comments, or interacting with authors), you agree not to:
- Post defamatory, abusive, harassing, or discriminatory content.
- Upload unauthorized copyrighted material or intellectual property without proper permission.
- Attempt to circumvent rate limiters, session authentication, or API endpoints.

---

### 4. Disclaimer of Warranties

All engineering guides, architecture blueprints, and benchmarks are provided on an "as-is" and "as-available" basis for educational and technical reference. NexusBlog makes no warranties regarding fitness for a particular production workload.

---

### 5. Modifications to Terms

We reserve the right to modify these terms at any time. Significant updates will be communicated via our newsletter or platform notification banner.`,
    },
    {
      title: 'Disclaimer',
      slug: 'disclaimer',
      excerpt: 'Technical reference, architectural accuracy, and liability disclaimer for published guides.',
      seoTitle: 'Disclaimer | NexusBlog',
      seoDescription: 'Read the technical and liability disclaimer for architecture patterns and benchmarks published on NexusBlog.',
      content: `# Disclaimer & Technical Notice

**Last updated:** October 2, 2026

The articles, benchmarks, architecture diagrams, and code implementations published on **NexusBlog** are created by distributed systems engineers and technical contributors for informational, educational, and reference purposes.

---

### 1. No Production Guarantee

While our editorial team rigorously verifies code snippets and benchmark methodologies:
- Infrastructure topologies and workload characteristics vary drastically between operating environments.
- Code samples should always be evaluated, audited, load-tested, and security-reviewed before deploying into mission-critical production environments.
- NexusBlog and its contributing authors shall not be held liable for system downtime, data loss, performance degradation, or security incidents resulting from applying techniques described on this portal.

---

### 2. External Links & Third-Party Tools

Our articles frequently reference open-source libraries, cloud infrastructure providers (AWS, GCP, Azure), database engines, and external documentation. We do not endorse or assume responsibility for third-party software changes, license alterations, or upstream security advisories.

---

### 3. Trademarks & Brand Names

All product names, logos, and brands (e.g., Redis, Kafka, Kubernetes, Docker, MongoDB, NestJS, Next.js, PostgreSQL) are property of their respective owners. Their mention on this platform is strictly for identification, technical critique, and educational comparison.`,
    },
    {
      title: 'Content Policy & Editorial Standards',
      slug: 'content-policy',
      excerpt: 'Our rigorous technical editorial standards, plagiarism rules, and code verification policies.',
      seoTitle: 'Content Policy & Editorial Standards | NexusBlog',
      seoDescription: 'Discover how NexusBlog ensures high-signal, peer-reviewed engineering content.',
      content: `# Content Policy & Editorial Standards

NexusBlog is dedicated to maintaining high-signal, rigorous, and actionable engineering content. We hold every article to stringent technical standards.

---

### Core Editorial Principles

1. **High Technical Signal:** We prioritize deep architectural understanding over superficial introductory overviews. We value real benchmarks, failure mode analyses, and production post-mortems.
2. **Original Research & Insights:** Submissions must reflect genuine first-hand engineering experience or rigorous independent benchmarking.
3. **Plagiarism Zero-Tolerance:** All content must be original. Direct copying, unauthorized paraphrasing, or unverified AI-generated text without human domain expertise will result in immediate disqualification.
4. **Runnable & Transparent Code:** All code listings must be syntactically valid, reproducible, and accompanied by prerequisite version specifications.
5. **Honest Trade-off Analysis:** Every architectural choice has trade-offs. Articles must explain where a solution excels and where it introduces complexity, cost, or operational burden.

---

### Reporting Violations

If you discover an article that infringes copyright, contains technical inaccuracies, or violates these standards, please submit a report to **editorial@nexusblog.dev**.`,
    },
    {
      title: 'Cookie Policy',
      slug: 'cookie-policy',
      excerpt: 'Explanation of cookies, storage tokens, and session management on NexusBlog.',
      seoTitle: 'Cookie Policy | NexusBlog',
      seoDescription: 'Learn about how NexusBlog uses cookies and session storage.',
      content: `# Cookie Policy

**Last updated:** October 2, 2026

This Cookie Policy explains how NexusBlog uses cookies and similar storage technologies when you visit our website.

---

### 1. What Are Cookies?

Cookies are small text files placed on your device by websites that you visit. They are widely used to make websites work efficiently, provide secure authentication, and remember user preferences.

---

### 2. Categories of Cookies We Use

- **Strictly Necessary Cookies:** Required for session authentication, CSRF mitigation, and user login state (`refreshToken`, `nexus_access_token`).
- **Preference Cookies:** Store user interface customizations, such as dark/light theme choice.

We do **not** use tracking cookies, third-party advertising pixels, or cross-site tracking beacons.

---

### 3. Managing Cookies

You can configure your web browser to block or alert you about cookies. However, disabling strictly necessary cookies will prevent you from signing in to your reader dashboard or admin panel.`,
    },
    {
      title: 'Author Guidelines & Posting Rules',
      slug: 'author-guidelines',
      excerpt: 'Comprehensive rules, formatting guidelines, code conventions, and submission workflow for authors.',
      seoTitle: 'Author Guidelines & Posting Rules | NexusBlog',
      seoDescription: 'Step-by-step contributor rules, MDX formatting guide, diagram standards, and review lifecycle for NexusBlog authors.',
      content: `# Author Guidelines & Posting Rules

Thank you for contributing to NexusBlog! We welcome software architects, backend engineers, and infrastructure leads who want to share battle-tested blueprints with our developer community.

---

## 1. Submission Rules & Eligibility

- **Original Content Only:** Articles must be 100% original work authored by you or your engineering team.
- **Tone & Style:** Objective, precise, and practical. Write engineer-to-engineer. Avoid aggressive marketing copy, hyperbole, or self-promotional link spam.
- **Depth Requirement:** Articles should provide substantive technical depth (typically 1,200 to 3,500 words) with architecture diagrams and concrete code examples.

---

## 2. Article Structure & Formatting Standards

Every technical blueprint must include:

1. **Problem Statement:** Clear articulation of the engineering problem, scalability limit, or latency constraint being solved.
2. **Architecture Breakdown:** System diagram (Mermaid flowcharts, sequence diagrams, or vector schemas) explaining data flow and component topology.
3. **Implementation & Code:** Clean, syntax-highlighted code blocks with explanatory comments.
4. **Benchmarks & Metrics:** Real p50/p95/p99 latency numbers, throughput (RPS), memory footprints, or cost comparisons where applicable.
5. **Key Takeaways & Caveats:** Summary of what works, what fails, and operational prerequisites.

---

## 3. Code Conventions

- Specify the code language on every fenced block (e.g., \`\`\`typescript, \`\`\`go, \`\`\`rust, \`\`\`sql).
- Highlight critical lines and keep snippets self-contained.
- Provide dependencies and framework version numbers explicitly.

---

## 4. Editorial Review Lifecycle

1. **Submission:** Submit your draft via the [Guest Post Editor](/guest-post/submit).
2. **Technical Review (2-4 business days):** Staff reviewers inspect architecture validity, code accuracy, and diagram clarity.
3. **Revisions:** If necessary, editors will provide inline feedback markers for minor clarifications.
4. **Publication:** Once approved, your article goes live with verified author badge, canonical link, and inclusion in our Weekly Engineering Dispatch.

Ready to publish? [Submit your draft now](/guest-post/submit).`,
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      excerpt: 'Get in touch with the NexusBlog editorial, engineering, and support team.',
      seoTitle: 'Contact Us | NexusBlog',
      seoDescription: 'Reach out to the NexusBlog editorial and infrastructure team for inquiries, feedback, or partnerships.',
      content: `# Contact Us

Have a question, technical feedback, or editorial inquiry? We would love to hear from you.

---

### Editorial & Contributor Inquiries
- **Guest Posts & Blueprints:** [Submit Draft](/guest-post/submit) or email **editorial@nexusblog.dev**
- **Author Inquiries:** **authors@nexusblog.dev**

---

### Platform Support & Security
- **General Support:** **support@nexusblog.dev**
- **Security Vulnerability Reporting:** **security@nexusblog.dev**
- **Privacy & Data Requests:** **privacy@nexusblog.dev**

---

### Office Location
Nexus Engineering Group  
Bangalore / San Francisco / Distributed Worldwide  
Website: [nexusblog.dev](https://nexusblog.dev)`,
    },
  ];

  for (const page of pagesData) {
    const existing = await prisma.page.findUnique({ where: { slug: page.slug } });
    if (!existing) {
      await prisma.page.create({ data: page });
      console.log(`  + Seeded CMS Page: ${page.title} (/${page.slug})`);
    } else {
      console.log(`  ℹ️ CMS Page exists: ${page.title}`);
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

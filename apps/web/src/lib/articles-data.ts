export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categoryId: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  type: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  featured: boolean;
  views: number;
  bookmarks: number;
  publishedAt: string;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export const INITIAL_ARTICLES: ArticleData[] = [
  {
    id: '1',
    title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    slug: 'designing-distributed-rate-limiter',
    excerpt:
      'A deep dive into sub-millisecond sliding window counter algorithms, token buckets, and coordinating distributed rate limiting across multi-region API gateways.',
    categoryId: 'system-design',
    category: 'System Design',
    difficulty: 'ADVANCED',
    type: 'SYSTEM_DESIGN',
    status: 'PUBLISHED',
    featured: true,
    views: 14200,
    bookmarks: 340,
    publishedAt: '2026-09-28',
    author: 'Alex Rivera',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    seoTitle: 'Designing a Distributed Rate Limiter with Redis and Lua | NexusBlog',
    seoDescription: 'Learn how to build sub-millisecond sliding window rate limiters with Redis and Lua scripts.',
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
    id: '2',
    title: 'Zero-Downtime PostgreSQL Schema Migrations at Scale',
    slug: 'zero-downtime-postgresql-migrations',
    excerpt:
      'Understanding lock queues, ACCESS EXCLUSIVE table locks, expand-contract patterns, and executing safe DDL operations on production databases under heavy concurrency.',
    categoryId: 'databases',
    category: 'Databases',
    difficulty: 'ADVANCED',
    type: 'DEEP_DIVE',
    status: 'PUBLISHED',
    featured: true,
    views: 22400,
    bookmarks: 512,
    publishedAt: '2026-09-25',
    author: 'Elena Rostova',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
    seoTitle: 'Zero-Downtime PostgreSQL Schema Migrations | NexusBlog',
    seoDescription: 'Master safe lock-free DDL migrations in PostgreSQL for high-traffic applications.',
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
    id: '3',
    title: 'Kafka Partitioning Strategies for Zero-Data-Loss Architectures',
    slug: 'kafka-partitioning-zero-data-loss',
    excerpt:
      'Guaranteed message ordering, consumer group rebalancing internals, and handling backpressure in distributed event stream pipelines.',
    categoryId: 'distributed-systems',
    category: 'Distributed Systems',
    difficulty: 'ADVANCED',
    type: 'SYSTEM_DESIGN',
    status: 'PUBLISHED',
    featured: false,
    views: 9800,
    bookmarks: 180,
    publishedAt: '2026-09-20',
    author: 'Alex Rivera',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    seoTitle: 'Kafka Partitioning Strategies for Zero Data Loss | NexusBlog',
    seoDescription: 'Design resilient Kafka producer, partitioner, and consumer architectures with strict ordering.',
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
    id: '4',
    title: 'Benchmarking Reactive WebFlux vs Virtual Threads in Spring Boot 3.3',
    slug: 'benchmarking-webflux-vs-virtual-threads',
    excerpt:
      'Benchmarking throughput, context-switching overhead, and memory consumption of reactive WebFlux vs blocking I/O with carrier thread pin avoidance.',
    categoryId: 'performance',
    category: 'Performance',
    difficulty: 'ADVANCED',
    type: 'DEEP_DIVE',
    status: 'DRAFT',
    featured: false,
    views: 0,
    bookmarks: 0,
    publishedAt: 'Unpublished',
    author: 'Marcus Vance',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    seoTitle: 'Spring Boot Virtual Threads vs WebFlux Benchmark | NexusBlog',
    seoDescription: 'Detailed performance analysis comparing Java 21 Project Loom virtual threads against reactive Spring WebFlux.',
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

const STORAGE_KEY = 'nexus_articles_store';

// In-memory cache synced with localStorage
let articlesCache: ArticleData[] = [...INITIAL_ARTICLES];

function initFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        articlesCache = parsed;
        return;
      }
    }
    // Initialize storage if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
  }
}

function persistToStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articlesCache));
    window.dispatchEvent(new CustomEvent('nexus_articles_updated', { detail: articlesCache }));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

export function getAllArticles(): ArticleData[] {
  initFromStorage();
  return [...articlesCache];
}

export function getArticleById(id: string): ArticleData {
  initFromStorage();
  const found = articlesCache.find((a) => a.id === id || a.slug === id);
  if (found) return { ...found };

  // Fallback if custom ID is requested
  return {
    id,
    title: `Technical Article #${id}`,
    slug: `article-${id}`,
    excerpt: 'Detailed technical guide and architecture documentation.',
    categoryId: 'system-design',
    category: 'System Design',
    difficulty: 'ADVANCED',
    type: 'DEEP_DIVE',
    status: 'DRAFT',
    featured: false,
    views: 0,
    bookmarks: 0,
    publishedAt: 'Unpublished',
    author: 'Alex Rivera',
    content: `## Technical Overview\n\nStart writing your technical article #${id} here.\n\n\`\`\`typescript\nconsole.log('Hello NexusBlog #${id}');\n\`\`\`\n`,
  };
}

export function getArticleBySlug(slug: string): ArticleData | undefined {
  initFromStorage();
  const item = articlesCache.find((a) => a.slug === slug);
  return item ? { ...item } : undefined;
}

export function saveArticle(data: Partial<ArticleData> & { id?: string; title: string }): ArticleData {
  initFromStorage();

  const existingIndex = articlesCache.findIndex(
    (a) => (data.id && a.id === data.id) || (data.slug && a.slug === data.slug),
  );

  let updatedArticle: ArticleData;

  if (existingIndex >= 0) {
    const existing = articlesCache[existingIndex];
    updatedArticle = {
      ...existing,
      ...data,
      id: existing.id,
      title: data.title || existing.title,
      slug: data.slug || existing.slug,
      excerpt: data.excerpt !== undefined ? data.excerpt : existing.excerpt,
      content: data.content !== undefined ? data.content : existing.content,
      status: data.status || existing.status,
      publishedAt:
        data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED'
          ? new Date().toISOString().split('T')[0]
          : data.publishedAt || existing.publishedAt,
    };
    articlesCache[existingIndex] = updatedArticle;
  } else {
    const newId = data.id || String(Date.now());
    updatedArticle = {
      id: newId,
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      excerpt: data.excerpt || 'Technical guide and architecture overview.',
      content: data.content || '## Introduction\n\nStart writing here...',
      categoryId: data.categoryId || 'system-design',
      category: data.category || 'System Design',
      difficulty: data.difficulty || 'ADVANCED',
      type: data.type || 'SYSTEM_DESIGN',
      status: data.status || 'DRAFT',
      featured: data.featured ?? false,
      views: data.views || 0,
      bookmarks: data.bookmarks || 0,
      publishedAt:
        data.status === 'PUBLISHED'
          ? new Date().toISOString().split('T')[0]
          : 'Unpublished',
      author: data.author || 'Alex Rivera',
      coverImage: data.coverImage,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    };
    articlesCache.unshift(updatedArticle);
  }

  persistToStorage();
  return updatedArticle;
}

export function deleteArticle(id: string): void {
  initFromStorage();
  articlesCache = articlesCache.filter((a) => a.id !== id);
  persistToStorage();
}

export function togglePublishArticle(id: string): ArticleData {
  initFromStorage();
  const existing = getArticleById(id);
  const nextStatus: ArticleData['status'] = existing.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  const updated = saveArticle({
    ...existing,
    status: nextStatus,
    publishedAt: nextStatus === 'PUBLISHED' ? new Date().toISOString().split('T')[0] : 'Unpublished',
  });
  return updated;
}

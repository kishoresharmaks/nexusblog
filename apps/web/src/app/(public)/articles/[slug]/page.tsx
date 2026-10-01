import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@nexus/config';
import { MdxRenderer } from '@/components/mdx';
import { TableOfContents } from '@/components/public/table-of-contents';
import { ReadingProgress } from '@/components/public/reading-progress';
import { ShareButtons } from '@/components/public/share-buttons';
import { ArticleActions } from '@/components/public/article-actions';
import { ArticleCard } from '@/components/public/article-card';
import {
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';

export const revalidate = 60;

// Sample rich technical article with full MDX features
const SAMPLE_RATE_LIMITER_MDX = `
## Introduction

A distributed rate limiter is a fundamental component of high-throughput distributed systems. When scaling API gateways handling hundreds of thousands of concurrent requests, in-memory rate limiting on individual instances falls short because traffic is load-balanced across multiple nodes.

<Callout type="tip" title="Core Objective">
Coordinating rate limit counters across horizontally scaled NestJS instances with sub-millisecond overhead using Redis and atomic Lua scripts.
</Callout>

---

## High-Level Architecture

The following sequence outlines how incoming API requests are evaluated by the gateway before reaching downstream microservices:

<MermaidDiagram
  caption="Distributed Rate Limiting Gateway Request Flow"
  code={\`
sequenceDiagram
    autonumber
    actor Client as Client App
    participant GW as API Gateway (NestJS)
    participant Redis as Redis Cluster
    participant Svc as Downstream Service

    Client->>GW: HTTP Request (Bearer Token)
    GW->>Redis: Execute Sliding Window Lua Script
    Redis-->>GW: Return { allowed: true, remaining: 84, resetIn: 450ms }
    alt Allowed
        GW->>Svc: Forward Request
        Svc-->>GW: Response
        GW-->>Client: 200 OK + Rate-Limit Headers
    else Rate Limited
        GW-->>Client: 429 Too Many Requests + Retry-After
    end
\`}
/>

---

## Interactive Topology

Below is an interactive view of the multi-tier microservice cluster coordinating with Redis and MongoDB:

<InteractiveDiagram
  title="Distributed Microservice & Cache Cluster Topology"
  caption="Drag nodes, zoom, or pan to explore service interconnections."
/>

---

## Multi-Language Implementation

Here is how rate limiting interceptors are implemented across different server frameworks:

<CodeTabs defaultValue="TypeScript">
  <CodeTab title="TypeScript" language="typescript" filename="rate-limiter.guard.ts">
{\`import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class DistributedRateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = \`rate_limit:\${req.ip}:\${req.route.path}\`;
    
    // Execute atomic Lua sliding window script
    const result = await this.redis.evalSlidingWindow(key, 100, 60); // 100 req per 60s
    if (!result.allowed) {
      throw new HttpException({
        status: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        retryAfter: result.resetIn,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}\`}
  </CodeTab>

  <CodeTab title="Java" language="java" filename="RateLimiterFilter.java">
{\`@Component
public class DistributedRateLimitFilter implements WebFilter {
    private final ReactiveRedisTemplate<String, String> redisTemplate;

    public DistributedRateLimitFilter(ReactiveRedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String clientIp = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        String key = "rate_limit:" + clientIp;
        
        return redisTemplate.execute(new RedisLuaScript(), Collections.singletonList(key))
            .flatMap(allowed -> allowed ? chain.filter(exchange) : Mono.error(new RateLimitException()));
    }
}\`}
  </CodeTab>
</CodeTabs>

---

## Database Schema for Audit Logs

<DatabaseSchema
  tableName="rate_limit_audit_logs"
  description="Captures rate limit violations and anomalous spike patterns for DDoS forensics."
  columns={[
    { name: "id", type: "ObjectId", primaryKey: true, description: "Unique log identifier" },
    { name: "clientId", type: "String", indexed: true, description: "API Key or IP identifier" },
    { name: "endpoint", type: "String", indexed: true, description: "Target REST route" },
    { name: "requestsCount", type: "Int", description: "Number of attempts in window" },
    { name: "blockedAt", type: "DateTime", description: "Timestamp of 429 response" }
  ]}
/>

---

## Performance Benchmarking

We tested our Redis Lua script implementation under 100,000 requests/sec concurrent load:

<Benchmark
  title="Rate Limiter Latency & Overhead Benchmark"
  description="Comparison of local memory vs Redis Sliding Window vs Token Bucket across 100K RPS."
  rows={[
    { name: "In-Memory Local Token Bucket", metric: "0.08 ms", percentage: 95, status: "optimal", note: "Fastest, but cannot synchronize across nodes." },
    { name: "Redis Lua Sliding Window (Single Region)", metric: "0.64 ms", percentage: 80, status: "optimal", note: "Sub-millisecond latency with multi-instance accuracy." },
    { name: "Redis Multi-Region Replication", metric: "3.20 ms", percentage: 40, status: "acceptable", note: "Cross-region network overhead." }
  ]}
/>

---

## Mathematical Formulation

The sliding window log algorithm computes the weighted request count \\( C \\) as:

<KaTeX block={true}>
{\`C = \\text{count}(\\text{current window}) + \\text{count}(\\text{previous window}) \\times \\left(1 - \\frac{\\text{time in current window}}{\\text{window size}}\\right)\`}
</KaTeX>

---

## Conclusion & Key Takeaways

1. **Avoid In-Memory State on Gateways**: State must live in a centralized, low-latency datastore like Redis.
2. **Atomic Lua Execution**: Executing window checks inside Redis Lua scripts eliminates race conditions without distributed locks.
3. **Graceful 429 Responses**: Always send \`Retry-After\` headers to prevent clients from aggressive retry loops.
`;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Placeholder static article metadata for demonstration
  const article = {
    id: '1',
    title: 'Designing a Distributed Rate Limiter with Redis and Lua Scripts',
    slug,
    excerpt:
      'A production deep-dive into token bucket algorithms, Redis sliding window counters, and sub-millisecond API rate limiting across scaled NestJS gateways.',
    content: SAMPLE_RATE_LIMITER_MDX,
    difficulty: 'ADVANCED' as const,
    readingTime: 12,
    viewsCount: 14200,
    likesCount: 384,
    publishedAt: new Date(),
    author: {
      name: 'Alex Rivera',
      username: 'alexdev',
      avatar: undefined,
      bio: 'Staff Distributed Systems Engineer @ Nexus. Specializes in Redis, Kafka event streaming, and high-concurrency NestJS backends.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    category: {
      name: 'System Design',
      slug: 'system-design',
    },
    technologies: [
      { name: 'Redis', slug: 'redis' },
      { name: 'NestJS', slug: 'nestjs' },
      { name: 'Docker', slug: 'docker' },
    ],
  };

  const publishedDate = format(new Date(article.publishedAt), 'MMMM dd, yyyy');

  return (
    <div className="relative pb-20">
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        slug={article.slug}
        datePublished={new Date(article.publishedAt).toISOString()}
        authorName={article.author.name}
        category={article.category.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://nexusblog.dev' },
          { name: 'Articles', item: 'https://nexusblog.dev/articles' },
          { name: article.category.name, item: `https://nexusblog.dev/categories/${article.category.slug}` },
          { name: article.title, item: `https://nexusblog.dev/articles/${article.slug}` },
        ]}
      />
      <ReadingProgress />

      {/* Hero / Header Section */}
      <div className="border-b border-border/40 bg-muted/5 py-10 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Back link & Breadcrumbs */}
          <div className="mb-6 flex items-center space-x-2 text-xs text-muted-foreground font-mono">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Articles</span>
            </Link>
            <span>/</span>
            <Link
              href={`/categories/${article.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {article.category.name}
            </Link>
          </div>

          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 font-mono text-[11px] font-semibold">
                {article.category.name}
              </span>
              <span className="rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 px-2 py-0.5 font-mono text-[10px] uppercase font-semibold">
                {article.difficulty}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>

            {/* Author & Meta Row */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/30 text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                  {article.author.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{article.author.name}</div>
                  <div className="text-[11px] font-mono">@{article.author.username}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {publishedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {article.readingTime} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Reading Layout */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
              <TableOfContents content={article.content} />
            </div>
          </aside>

          {/* Center Column: Main Article MDX Content */}
          <main className="lg:col-span-6 min-w-0">
            <MdxRenderer source={article.content} />

            {/* Bottom Actions Bar */}
            <div className="mt-12 pt-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
              <ArticleActions
                articleId={article.id}
                initialLikes={article.likesCount}
              />
              <ShareButtons
                title={article.title}
                url={`${siteConfig.url}/articles/${article.slug}`}
              />
            </div>

            {/* Author Bio Box */}
            <div className="mt-10 rounded-xl border border-border/80 bg-card/60 p-6 space-y-3 font-sans">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                  {article.author.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{article.author.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">@{article.author.username}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {article.author.bio}
              </p>
            </div>
          </main>

          {/* Right Column: Article Utilities & Technologies */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            <div className="sticky top-20 space-y-6">
              {/* Technologies in this guide */}
              <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                  Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {article.technologies.map((tech) => (
                    <Link
                      key={tech.slug}
                      href={`/technologies/${tech.slug}`}
                      className="rounded bg-muted/60 px-2 py-1 font-mono text-xs text-foreground hover:bg-muted transition-colors"
                    >
                      #{tech.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter CTA Box */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Weekly Architecture Dispatch
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join 25,000+ engineers receiving system design deep dives every Tuesday.
                </p>
                <Link
                  href="/#newsletter"
                  className="inline-block w-full text-center rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors shadow"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

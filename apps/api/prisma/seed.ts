import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NexusBlog Database Seeding...');

  // 1. Seed Super Admin Account
  const adminEmail = 'admin@nexusblog.dev';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash('NexusSuperAdmin2026!', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const admin = await prisma.user.create({
      data: {
        name: 'Nexus Lead Architect',
        username: 'nexusadmin',
        email: adminEmail,
        passwordHash,
        bio: 'Lead Architect & Core Contributor to NexusBlog Engineering Platform.',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    console.log(`✅ Seeded Super Admin: ${admin.email} (Username: ${admin.username})`);
  } else {
    console.log(`ℹ️ Super Admin already exists: ${existingAdmin.email}`);
  }

  // 2. Seed 10 Core Categories
  const categories = [
    {
      name: 'System Design',
      slug: 'system-design',
      description: 'Architectural patterns, high-level blueprints, and distributed designs.',
      order: 1,
    },
    {
      name: 'Backend Engineering',
      slug: 'backend-engineering',
      description: 'Deep dives into server-side development, concurrency, and clean architecture.',
      order: 2,
    },
    {
      name: 'Distributed Systems',
      slug: 'distributed-systems',
      description: 'Consensus protocols, partitioning, replication, and fault tolerance.',
      order: 3,
    },
    {
      name: 'Databases',
      slug: 'databases',
      description: 'Query optimization, indexing strategies, schema modeling, and scaling storage.',
      order: 4,
    },
    {
      name: 'APIs',
      slug: 'apis',
      description: 'REST, gRPC, GraphQL, WebSocket patterns, and API gateway engineering.',
      order: 5,
    },
    {
      name: 'DevOps',
      slug: 'devops',
      description: 'CI/CD pipelines, containerization, infrastructure as code, and automation.',
      order: 6,
    },
    {
      name: 'Cloud',
      slug: 'cloud',
      description: 'Serverless, edge computing, AWS/GCP architecture, and cloud networking.',
      order: 7,
    },
    {
      name: 'Performance',
      slug: 'performance',
      description: 'Memory profiling, low-latency optimization, and benchmarking.',
      order: 8,
    },
    {
      name: 'Observability',
      slug: 'observability',
      description: 'Metrics, OpenTelemetry distributed tracing, alerting, and structured logging.',
      order: 9,
    },
    {
      name: 'AI / Engineering',
      slug: 'ai-engineering',
      description: 'LLM infrastructure, vector databases, embeddings, and autonomous agent systems.',
      order: 10,
    },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`  + Category: ${cat.name}`);
    }
  }

  // 3. Seed 9 Core Technologies
  const technologies = [
    {
      name: 'Redis',
      slug: 'redis',
      description: 'In-memory data structure store used as a database, cache, and message broker.',
      officialUrl: 'https://redis.io',
      docsUrl: 'https://redis.io/docs',
    },
    {
      name: 'Kafka',
      slug: 'kafka',
      description: 'Distributed event streaming platform for high-performance data pipelines.',
      officialUrl: 'https://kafka.apache.org',
      docsUrl: 'https://kafka.apache.org/documentation',
    },
    {
      name: 'PostgreSQL',
      slug: 'postgresql',
      description: 'Advanced open-source relational database with powerful indexing and extensions.',
      officialUrl: 'https://www.postgresql.org',
      docsUrl: 'https://www.postgresql.org/docs',
    },
    {
      name: 'MongoDB',
      slug: 'mongodb',
      description: 'Document database designed for flexibility, scalability, and developer ergonomics.',
      officialUrl: 'https://www.mongodb.com',
      docsUrl: 'https://www.mongodb.com/docs',
    },
    {
      name: 'NestJS',
      slug: 'nestjs',
      description: 'Progressive Node.js framework for building efficient and scalable server-side apps.',
      officialUrl: 'https://nestjs.com',
      docsUrl: 'https://docs.nestjs.com',
    },
    {
      name: 'Spring Boot',
      slug: 'spring-boot',
      description: 'Enterprise Java framework for building stand-alone production-grade applications.',
      officialUrl: 'https://spring.io/projects/spring-boot',
      docsUrl: 'https://docs.spring.io/spring-boot/docs/current/reference/html',
    },
    {
      name: 'Next.js',
      slug: 'nextjs',
      description: 'React framework for building full-stack web applications with Server Components.',
      officialUrl: 'https://nextjs.org',
      docsUrl: 'https://nextjs.org/docs',
    },
    {
      name: 'Kubernetes',
      slug: 'kubernetes',
      description: 'Open-source container orchestration system for automating application deployment.',
      officialUrl: 'https://kubernetes.io',
      docsUrl: 'https://kubernetes.io/docs',
    },
    {
      name: 'Docker',
      slug: 'docker',
      description: 'Platform for developing, shipping, and running applications in lightweight containers.',
      officialUrl: 'https://www.docker.com',
      docsUrl: 'https://docs.docker.com',
    },
  ];

  for (const tech of technologies) {
    const existing = await prisma.technology.findUnique({
      where: { slug: tech.slug },
    });
    if (!existing) {
      await prisma.technology.create({ data: tech });
      console.log(`  + Technology: ${tech.name}`);
    }
  }

  // 4. Seed Core Starter Tags
  const tags = [
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

  for (const tag of tags) {
    const existing = await prisma.tag.findUnique({
      where: { slug: tag.slug },
    });
    if (!existing) {
      await prisma.tag.create({ data: tag });
      console.log(`  + Tag: ${tag.name}`);
    }
  }

  // 5. Seed Starter Series
  const seriesSlug = 'system-design-zero-to-production';
  const existingSeries = await prisma.series.findUnique({
    where: { slug: seriesSlug },
  });

  if (!existingSeries) {
    await prisma.series.create({
      data: {
        title: 'System Design: From Zero to Production',
        slug: seriesSlug,
        description: 'A comprehensive engineering series guiding backend developers from single-node instances to highly resilient distributed architectures.',
        published: true,
      },
    });
    console.log(`✅ Seeded Starter Series: System Design: From Zero to Production`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

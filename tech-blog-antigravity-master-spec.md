# Technical Blog Platform — Antigravity Master Specification

## 0. Project Goal

Build a production-grade technical publishing platform focused on:

- System Design
- Backend Engineering
- Distributed Systems
- Databases
- APIs
- DevOps
- Cloud
- Performance Engineering
- Observability
- Java / Spring Boot
- Node.js / NestJS
- Next.js
- PostgreSQL / MongoDB / Redis / Kafka
- Architecture case studies
- Technical tutorials and engineering deep dives

The product must feel like a combination of:

- Vercel — minimal, premium visual language
- Linear — polished application UX
- GitHub — technical readability
- Stripe Engineering — article quality and structure
- Mintlify — developer documentation UX

Primary priorities:

1. Excellent reading experience
2. Excellent code readability
3. Fast page loads
4. SEO
5. Excellent system-design diagrams
6. Powerful admin/editor workflow
7. Optimized image delivery
8. Clean responsive mobile UX
9. Maintainable architecture
10. Production-grade security

---

# 1. Core Technology Stack

## Frontend

- Next.js — latest stable version compatible with project requirements
- React
- TypeScript — strict mode
- Tailwind CSS
- shadcn/ui
- Radix UI primitives through shadcn where appropriate
- Lucide React
- Motion for subtle animation
- MDX for article content
- Shiki for code highlighting
- Mermaid for standard architecture diagrams
- React Flow for complex interactive diagrams
- KaTeX for mathematical notation
- TanStack Query for client-side server-state interactions where needed
- TanStack Table for admin tables
- React Hook Form
- Zod
- Sonner for notifications
- cmdk for command palette
- dnd-kit for drag-and-drop interactions
- date-fns for date handling

## Backend

- NestJS
- TypeScript
- Prisma ORM
- MongoDB
- REST API by default
- OpenAPI/Swagger documentation
- Class-validator / Zod where appropriate
- Centralized exception handling
- Structured logging
- Request ID / correlation ID
- Rate limiting
- Helmet/security headers
- CORS configured explicitly

## Database

- MongoDB
- Prisma ORM
- MongoDB indexes designed around actual query patterns
- Avoid unnecessary population-like query patterns
- Paginate all potentially large collections
- Use projections/selects to avoid fetching unnecessary fields
- Use cursor pagination for large article lists and feeds
- Keep analytics/event data separate from editorial data when scale requires it

## Authentication

Preferred:

- Clerk for fast production authentication

Alternative:

- Auth.js if self-managed authentication is preferred

Admin authorization must use role-based access control.

Suggested roles:

- SUPER_ADMIN
- ADMIN
- EDITOR
- AUTHOR
- ANALYST

Never trust the frontend role. Every privileged action must be authorized in NestJS.

---

# 2. Overall Repository Architecture

Use a monorepo.

```text
tech-blog/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   ├── admin/
│   │   │   ├── articles/
│   │   │   ├── categories/
│   │   │   ├── tags/
│   │   │   ├── search/
│   │   │   └── ...
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── styles/
│   │
│   └── api/
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── articles/
│       │   ├── categories/
│       │   ├── tags/
│       │   ├── media/
│       │   ├── search/
│       │   ├── analytics/
│       │   ├── comments/
│       │   ├── settings/
│       │   ├── health/
│       │   └── common/
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   ├── eslint-config/
│   └── tsconfig/
│
├── storage/
│   └── local/
│       └── media/
│
├── docs/
└── ...
```

Use pnpm workspaces.

---

# 3. Design System

## Design Direction

Use a premium technical/editorial interface.

Do NOT create a generic SaaS dashboard.

Do NOT overuse:

- gradients
- glassmorphism
- huge hero animations
- excessive shadows
- excessive rounded cards
- decorative animations

The UI must prioritize content.

## Visual principles

- Strong typography
- Large whitespace
- Clear hierarchy
- Thin borders
- Subtle backgrounds
- Excellent code blocks
- High contrast
- Consistent spacing
- Minimal animations
- Responsive layouts
- Keyboard accessibility

## Suggested visual tokens

Primary background:

```text
#FFFFFF
```

Dark background:

```text
#09090B
```

Primary text:

```text
#18181B
```

Secondary text:

```text
#71717A
```

Borders:

```text
#E4E4E7
```

Dark borders:

```text
#27272A
```

Accent can be configurable.

Do not hard-code colors throughout components.

Use CSS variables/design tokens.

---

# 4. Public Website

## Main routes

```text
/
 /articles
 /articles/[slug]
 /categories
 /categories/[slug]
 /tags/[slug]
 /search
 /about
 /authors/[slug]
 /series/[slug]
 /newsletter
 /rss.xml
 /sitemap.xml
 /robots.txt
```

## Homepage

Sections:

1. Header
2. Hero / latest engineering topic
3. Featured articles
4. Latest articles
5. System design section
6. Backend section
7. Database section
8. DevOps / Cloud section
9. Popular articles
10. Technical series
11. Newsletter
12. Footer

Keep homepage lightweight.

Avoid loading all articles.

Use server-side rendering and paginated data.

---

# 5. Article Page

The article page is the most important public page.

Structure:

```text
Breadcrumb

Category

H1 Article Title

Short description

Author
Published date
Updated date
Reading time

Hero image

Article layout

┌───────────────────────┬──────────────────────────┐
│ Sticky Table of       │ Article Content          │
│ Contents              │                          │
│                       │ Introduction             │
│ 01 Introduction       │ Architecture             │
│ 02 Requirements       │ Diagram                  │
│ 03 Architecture       │ Code                     │
│ 04 Scaling            │ Explanation              │
│ 05 Database           │ Benchmark                │
│ 06 Tradeoffs          │ Conclusion               │
└───────────────────────┴──────────────────────────┘

Related Articles

Next / Previous Article

Author section

Newsletter
```

## Article requirements

Every technical article should support:

- headings
- paragraphs
- lists
- tables
- blockquotes
- callouts
- code blocks
- terminal blocks
- tabs
- images
- image captions
- Mermaid diagrams
- React Flow diagrams
- API examples
- JSON examples
- SQL examples
- benchmark tables
- mathematical formulas
- embedded videos where necessary
- references
- related articles

---

# 6. MDX Architecture

Use MDX as the content format.

Example:

```mdx
# Designing a Distributed Rate Limiter

A distributed rate limiter protects APIs from excessive traffic.

<Callout type="info">
Redis can be used to coordinate rate-limit counters across instances.
</Callout>

<ArchitectureDiagram
  type="mermaid"
  code={`
graph LR
Client --> Gateway
Gateway --> Redis
Gateway --> API
API --> PostgreSQL
`}
/>

<CodeTabs>
  <CodeTab language="typescript" title="NestJS">
    ...
  </CodeTab>
</CodeTabs>
```

Create reusable MDX components.

Required MDX components:

```text
Callout
CodeBlock
CodeTabs
Terminal
ArchitectureDiagram
MermaidDiagram
InteractiveDiagram
Image
Figure
Table
Benchmark
ApiRequest
ApiResponse
DatabaseSchema
Step
Tabs
Accordion
Quote
YouTubeEmbed
TweetEmbed
RelatedArticles
```

---

# 7. Code Highlighting

Use Shiki.

Requirements:

- TypeScript
- JavaScript
- Java
- Python
- Go
- Rust
- SQL
- Bash
- JSON
- YAML
- Dockerfile
- HTML
- CSS
- GraphQL
- Prisma
- Nginx

Features:

- syntax highlighting
- copy button
- line numbers when useful
- highlighted lines
- language label
- filename label
- expandable long blocks
- dark/light themes
- no client-side heavy syntax processing where avoidable

Never render massive code blocks without limits.

---

# 8. System Design Diagrams

## Mermaid

Use Mermaid for normal diagrams.

Examples:

- request flow
- service architecture
- sequence diagrams
- database relationships
- deployment diagrams
- event flows

## React Flow

Use React Flow for interactive diagrams requiring:

- zoom
- pan
- node selection
- expandable nodes
- tooltips
- interactive service details
- animated edges

React Flow should be loaded only when needed.

Do not load React Flow globally on every article.

Use dynamic imports.

---

# 9. Images — Production-Grade Architecture

Images must be treated as a first-class performance concern.

## Storage abstraction

Create a storage provider interface:

```ts
interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  exists(key: string): Promise<boolean>;
}
```

Providers:

```text
StorageProvider
├── LocalStorageProvider
├── S3StorageProvider
├── R2StorageProvider
└── CloudinaryStorageProvider (optional)
```

## Production recommendation

Primary:

```text
Cloudflare R2
+
Cloudflare CDN
```

Why:

- object storage
- high durability
- CDN integration
- suitable for large media
- avoids tying application server disk to production media
- easy to scale

Alternative:

- AWS S3 + CloudFront
- Cloudinary when advanced image transformations/management are needed

## Local development

Use:

```text
storage/local/media/
```

Never store production user-uploaded images permanently inside the Next.js deployment filesystem.

---

# 10. Image Optimization

Original image:

```text
Upload
  ↓
Validate
  ↓
Virus/security validation
  ↓
Extract metadata
  ↓
Generate optimized variants
  ↓
Object storage
  ↓
CDN
  ↓
Next.js Image
```

Generate variants where useful:

```text
original
thumbnail
small
medium
large
og
```

Example widths:

```text
320
640
960
1280
1600
1920
```

Do not blindly generate every size for every image.

Generate based on actual usage.

## Formats

Preferred:

- AVIF
- WebP

Keep original source where required.

Use Next.js `<Image />`.

Requirements:

- width/height or aspect ratio
- responsive sizes
- lazy loading below the fold
- priority only for LCP image
- blur placeholder where useful
- remotePatterns configured securely
- avoid layout shift

---

# 11. Image Upload Strategy

Do not upload large images through the NestJS application server when avoidable.

Preferred production flow:

```text
Admin Browser
     │
     │ request upload authorization
     ▼
NestJS
     │
     │ signed upload URL
     ▼
R2/S3
     ▲
     │ direct upload
     │
Admin Browser
```

Then:

```text
Browser
  ↓
Upload directly to object storage
  ↓
Storage key returned
  ↓
NestJS stores metadata in MongoDB
```

This prevents the API server from becoming an unnecessary file-transfer bottleneck.

---

# 12. Media Database Model

Store metadata, NOT binary image content, in MongoDB.

Example conceptual model:

```text
Media
├── id
├── storageKey
├── provider
├── originalName
├── mimeType
├── size
├── width
├── height
├── alt
├── caption
├── blurHash
├── variants
├── checksum
├── createdBy
├── createdAt
└── updatedAt
```

Binary files belong in object storage.

MongoDB stores metadata and references.

---

# 13. Local + External Storage

Implement provider switching through environment configuration.

```env
STORAGE_PROVIDER=r2
```

Options:

```env
STORAGE_PROVIDER=local
STORAGE_PROVIDER=r2
STORAGE_PROVIDER=s3
STORAGE_PROVIDER=cloudinary
```

Development:

```env
STORAGE_PROVIDER=local
```

Production:

```env
STORAGE_PROVIDER=r2
```

The application code must not directly depend on R2/S3 APIs.

Always use the `StorageProvider` abstraction.

---

# 14. Admin Panel

Route:

```text
/admin
```

Admin layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Logo                              Search     Profile    │
├───────────────┬─────────────────────────────────────────┤
│ Dashboard     │                                         │
│               │                                         │
│ Content       │             Main Content                │
│  Articles     │                                         │
│  Drafts       │                                         │
│  Published    │                                         │
│  Scheduled    │                                         │
│               │                                         │
│ Media         │                                         │
│ Categories    │                                         │
│ Tags          │                                         │
│ Authors       │                                         │
│ Analytics     │                                         │
│ Comments      │                                         │
│ Settings      │                                         │
└───────────────┴─────────────────────────────────────────┘
```

Use:

- shadcn Sidebar
- responsive mobile drawer
- command palette
- keyboard shortcuts
- breadcrumbs
- compact toolbar
- consistent table layouts

---

# 15. Admin Dashboard

Metrics:

- total articles
- published articles
- drafts
- total views
- unique visitors
- average reading time
- top articles
- top categories
- traffic sources
- search queries
- newsletter subscribers
- recent activity

Do not make analytics visually noisy.

Use compact cards and meaningful charts.

---

# 16. Article Management

Table columns:

```text
Title
Status
Author
Category
Views
Published
Updated
Actions
```

Actions:

- edit
- preview
- publish
- unpublish
- schedule
- duplicate
- archive
- delete

Use server-side pagination.

Use filters:

- status
- author
- category
- tag
- date
- search

Use TanStack Table.

---

# 17. Article Editor

Editor must support:

```text
Title
Slug
Excerpt
Cover image
Author
Category
Tags
Content
SEO title
SEO description
Canonical URL
OG image
Twitter/X image
Reading time
Status
Publish date
Featured
Series
```

Buttons:

```text
Save Draft
Preview
Schedule
Publish
```

Autosave:

- debounce
- optimistic UI where appropriate
- conflict protection
- draft versioning

Never lose an article because of a browser refresh.

---

# 18. Editor Choice

For Markdown/MDX authoring:

Use:

- CodeMirror 6

For rich content editing where needed:

- Tiptap

For technical articles, prefer MDX/Markdown-first authoring because code, diagrams and technical components are first-class content.

Do not force technical authors into a generic WYSIWYG editor.

---

# 19. Preview

Provide:

```text
Editor
   │
   ├── Edit
   ├── Preview
   └── Split View
```

Preview must render the same MDX component system used by production.

Avoid having separate content rendering logic for preview and production.

---

# 20. SEO

Every article must support:

- title
- description
- canonical URL
- Open Graph
- Twitter/X metadata
- JSON-LD
- Article schema
- Breadcrumb schema
- author
- published date
- modified date
- sitemap
- robots
- RSS

Generate metadata server-side.

Use Next.js Metadata API.

Avoid client-side SEO metadata.

---

# 21. Search

Primary search:

```text
Orama
```

Search:

- title
- excerpt
- content
- tags
- categories
- author

Features:

- instant search
- keyboard navigation
- highlighted results
- category filtering
- recent searches
- mobile search
- command palette integration

If content grows significantly, abstract search behind an interface so it can later move to:

- Meilisearch
- Typesense
- Elasticsearch/OpenSearch

Do not tightly couple article logic to one search engine.

---

# 22. API Architecture

NestJS modules:

```text
AuthModule
UsersModule
RolesModule
ArticlesModule
CategoriesModule
TagsModule
MediaModule
AuthorsModule
SearchModule
AnalyticsModule
CommentsModule
NewsletterModule
SettingsModule
HealthModule
```

Use:

```text
Controller
   ↓
Service
   ↓
Repository/Data Access
   ↓
Prisma
   ↓
MongoDB
```

Avoid putting business logic inside controllers.

---

# 23. Prisma + MongoDB

Use Prisma for:

- type-safe data access
- schema management
- consistent repository layer
- generated client

Use indexes intentionally.

Important collections:

```text
User
Article
Category
Tag
Author
Media
Comment
Series
NewsletterSubscriber
AnalyticsEvent
AuditLog
```

Indexes should follow actual query patterns.

Examples:

```text
Article:
slug
status + publishedAt
categoryId + publishedAt
authorId + publishedAt
tags + publishedAt
createdAt
```

Avoid indexing every field.

---

# 24. Article Status

Use:

```text
DRAFT
IN_REVIEW
SCHEDULED
PUBLISHED
ARCHIVED
```

Publishing flow:

```text
Draft
 ↓
Review
 ↓
Schedule
 ↓
Publish
 ↓
Archive
```

Publishing must be transactional at the application level.

Invalidate relevant caches after publishing.

---

# 25. Caching

Use multiple caching levels.

```text
Browser
   ↓
CDN
   ↓
Next.js cache
   ↓
NestJS cache
   ↓
MongoDB
```

Cache:

- article pages
- category pages
- tag pages
- popular article lists
- navigation metadata

Do not aggressively cache admin pages.

Cache invalidation must happen when:

- article published
- article updated
- article unpublished
- category changed
- tag changed

---

# 26. Next.js Rendering Strategy

Prefer Server Components.

Use Client Components only when required.

Use:

```text
Server Components
→ article rendering
→ category pages
→ metadata
→ SEO
→ static content
```

Client Components:

```text
search
editor
interactive diagrams
comments
like/bookmark interactions
admin UI
animations
```

Do not make the entire website `"use client"`.

---

# 27. Performance Rules

Target:

- excellent Core Web Vitals
- fast LCP
- low CLS
- low JS shipped
- minimal hydration
- optimized images
- server-rendered content

Rules:

1. Prefer Server Components.
2. Lazy-load heavy interactive components.
3. Dynamically import React Flow.
4. Avoid large client-side dependencies.
5. Use responsive images.
6. Use CDN-backed media.
7. Cache public content.
8. Paginate admin tables.
9. Avoid N+1 database queries.
10. Select only required MongoDB fields.
11. Do not fetch all articles on homepage.
12. Avoid huge JSON responses.
13. Compress responses.
14. Use HTTP caching where appropriate.
15. Monitor slow API endpoints.

---

# 28. Security

Backend must enforce:

- authentication
- RBAC
- input validation
- rate limiting
- CORS
- CSRF protection where applicable
- secure cookies
- security headers
- upload validation
- MIME validation
- file-size limits
- image dimension limits
- malicious file detection
- audit logging
- secret management

Never expose:

- database credentials
- storage secret keys
- admin secrets
- API keys

to the browser.

For direct uploads use signed URLs.

---

# 29. Observability

Use OpenTelemetry-compatible instrumentation.

Track:

- API latency
- database latency
- error rates
- request count
- slow queries
- image processing failures
- storage errors
- publishing failures

Recommended stack:

```text
OpenTelemetry
      ↓
Collector
      ↓
Prometheus / compatible metrics backend
      ↓
Grafana
```

For errors:

```text
Sentry
```

Use correlation/request IDs.

---

# 30. Logging

Structured JSON logs.

Example:

```json
{
  "level": "info",
  "requestId": "req_123",
  "module": "articles",
  "action": "publish",
  "articleId": "article_123",
  "userId": "user_123"
}
```

Never log:

- passwords
- tokens
- cookies
- authorization headers
- private user data
- storage credentials

---

# 31. Image CDN Strategy

Recommended production architecture:

```text
                    ┌──────────────┐
                    │ Admin Browser│
                    └──────┬───────┘
                           │
                    Signed Upload
                           │
                           ▼
                    ┌──────────────┐
                    │ Cloudflare R2│
                    └──────┬───────┘
                           │
                           ▼
                    Cloudflare CDN
                           │
                           ▼
                     Next.js Image
                           │
                           ▼
                         User
```

Keep originals private when required.

Generate public optimized delivery URLs separately.

---

# 32. Media Naming

Never use user filenames as storage keys.

Use:

```text
media/{year}/{month}/{uuid}/original.ext
```

Example:

```text
media/2026/10/8f3b.../original.png
```

Variants:

```text
media/2026/10/8f3b.../large.webp
media/2026/10/8f3b.../medium.webp
media/2026/10/8f3b.../thumbnail.webp
```

---

# 33. Admin Media Library

Features:

- upload
- drag/drop
- search
- filter by type
- filter by date
- preview
- copy URL
- edit alt text
- edit caption
- replace
- delete
- usage references

Before deleting media, check whether an article references it.

Avoid broken images.

---

# 34. Accessibility

Target WCAG 2.2 AA where practical.

Requirements:

- keyboard navigation
- visible focus
- semantic HTML
- accessible labels
- alt text
- sufficient contrast
- reduced-motion support
- accessible dialogs
- accessible dropdowns
- accessible command palette

Never rely only on color to communicate status.

---

# 35. Responsive Design

Breakpoints:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Public article layout:

Mobile:

```text
Article
↓
Inline TOC
↓
Content
```

Desktop:

```text
TOC | Content | optional article utilities
```

Admin:

Mobile:

```text
Header
Drawer
Content
```

Desktop:

```text
Sidebar | Content
```

---

# 36. Animation Rules

Use Motion only for:

- page transitions
- menu opening
- dialogs
- hover states
- subtle card transitions
- reading progress
- command palette
- notifications

Avoid animation on:

- every paragraph
- every article card
- code blocks
- diagrams unnecessarily
- core navigation

Respect:

```css
prefers-reduced-motion
```

---

# 37. Component Library

Create reusable components:

```text
Button
Badge
Card
ArticleCard
FeaturedArticle
AuthorCard
CategoryCard
Tag
Breadcrumbs
Pagination
SearchDialog
CommandPalette
Navbar
Footer
Sidebar
TableOfContents
ReadingProgress
CodeBlock
CodeTabs
TerminalBlock
Callout
MermaidDiagram
InteractiveDiagram
Figure
ImageWithCaption
ArticleMeta
ShareButtons
RelatedArticles
NewsletterForm
```

Do not duplicate components between pages.

---

# 38. Admin Components

```text
AdminShell
AdminSidebar
AdminHeader
DashboardCard
DataTable
FilterBar
SearchInput
ArticleStatusBadge
ArticleEditor
MarkdownEditor
PreviewPane
MediaPicker
MediaUploader
MediaGrid
CategorySelector
TagSelector
SeoPanel
PublishPanel
ActivityTimeline
ConfirmDialog
EmptyState
ErrorState
LoadingState
```

---

# 39. Error and Loading UX

Every major page must have:

- loading state
- empty state
- error state
- retry action

Avoid blank screens.

Use skeletons where useful.

For article pages, avoid excessive skeleton UI if server rendering can eliminate the wait.

---

# 40. API Response Convention

Use a consistent API structure.

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ARTICLE_NOT_FOUND",
    "message": "Article not found"
  }
}
```

Never expose internal stack traces in production responses.

---

# 41. API Pagination

For large datasets:

Prefer cursor pagination.

Example:

```text
GET /articles?limit=20&cursor=abc123
```

Response:

```json
{
  "data": [],
  "meta": {
    "nextCursor": "xyz789",
    "hasNextPage": true
  }
}
```

Use offset pagination only where appropriate.

---

# 42. Analytics

Track meaningful events:

```text
article_view
article_read
article_complete
search
search_result_click
newsletter_signup
share
code_copy
diagram_interaction
```

Do not track unnecessary personal information.

Keep analytics lightweight.

Avoid blocking page rendering for analytics.

---

# 43. SEO-Friendly URL Structure

Use clean URLs:

```text
/articles/designing-distributed-rate-limiter
/articles/system-design/url-shortener
/articles/backend/nestjs-performance
/categories/system-design
/tags/redis
```

Avoid:

```text
/articles?id=123
```

Use stable slugs.

If slug changes, create redirects.

---

# 44. Content Quality Features

Articles should support:

- estimated reading time
- difficulty level
- prerequisites
- key takeaways
- architecture diagrams
- code examples
- tradeoffs
- benchmarks
- references
- related articles
- series navigation

Optional metadata:

```text
Difficulty:
Beginner / Intermediate / Advanced

Topic:
System Design

Technologies:
Redis, Kafka, PostgreSQL

Reading time:
14 min
```

---

# 45. Article Template

Recommended technical article structure:

```text
# Title

Short introduction

## Key Takeaways

## Problem

## Requirements

### Functional Requirements

### Non-Functional Requirements

## High-Level Architecture

[Diagram]

## Deep Dive

### API Gateway

### Load Balancer

### Cache

### Database

### Message Queue

## Scaling

## Failure Scenarios

## Observability

## Security

## Trade-offs

## Cost Considerations

## Final Architecture

[Diagram]

## Conclusion

## References
```

This structure should be encouraged in the admin editor but not forced.

---

# 46. Deployment

Recommended production architecture:

```text
                     Cloudflare
                         │
                 CDN / DNS / WAF
                         │
              ┌──────────┴──────────┐
              │                     │
           Next.js               NestJS
              │                     │
              │                     │
              └──────────┬──────────┘
                         │
                       Prisma
                         │
                      MongoDB
                         │
                  ┌──────┴──────┐
                  │             │
                R2          Analytics
```

Deploy frontend and backend independently.

Use environment-specific configuration.

---

# 47. Environment Variables

Frontend:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CDN_URL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

Backend:

```env
DATABASE_URL=
CLERK_SECRET_KEY=
STORAGE_PROVIDER=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
SENTRY_DSN=
```

Never expose private credentials through `NEXT_PUBLIC_*`.

---

# 48. Testing

Frontend:

- unit tests
- component tests
- Playwright E2E

Backend:

- unit tests
- integration tests
- API E2E

Critical flows:

```text
Login
Create article
Save draft
Upload image
Preview article
Publish article
Schedule article
Search
Delete media
Role restriction
```

---

# 49. Performance Testing

Test:

- homepage
- article page
- search
- admin article list
- image upload
- publishing
- API latency
- MongoDB query latency

Use realistic concurrency.

Do not optimize based only on local development performance.

---

# 50. Coding Rules for Antigravity

When generating code:

1. TypeScript strict mode.
2. No unnecessary `any`.
3. No giant components.
4. Use feature-based organization.
5. Keep business logic out of controllers.
6. Keep storage provider abstract.
7. Keep search provider abstract.
8. Keep analytics provider abstract.
9. Prefer server components.
10. Minimize client components.
11. Use reusable components.
12. Validate all API inputs.
13. Validate all upload metadata.
14. Never trust client-side authorization.
15. Never expose secrets.
16. Add indexes based on query patterns.
17. Paginate large datasets.
18. Use cursor pagination for feeds.
19. Avoid N+1 queries.
20. Avoid unnecessary database fields.
21. Lazy-load heavy UI.
22. Optimize images before delivery.
23. Use CDN for production media.
24. Add error/loading/empty states.
25. Preserve accessibility.
26. Support dark mode.
27. Support reduced motion.
28. Keep public pages SEO-friendly.
29. Do not introduce a UI library without a clear reason.
30. Keep visual consistency across the entire product.

---

# 51. Antigravity Implementation Order

Implement in this order.

## Phase 1 — Foundation

- monorepo
- Next.js
- NestJS
- Prisma
- MongoDB
- TypeScript
- Tailwind
- shadcn
- ESLint
- Prettier
- environment configuration

## Phase 2 — Authentication

- authentication
- roles
- RBAC
- protected admin routes

## Phase 3 — Content

- Article model
- Category
- Tag
- Author
- Series
- Article CRUD
- Draft/publish workflow

## Phase 4 — MDX

- MDX pipeline
- Shiki
- custom MDX components
- Mermaid
- KaTeX
- code blocks
- article renderer

## Phase 5 — Media

- StorageProvider
- LocalStorageProvider
- R2StorageProvider
- signed uploads
- image metadata
- image variants
- CDN delivery
- Media Library

## Phase 6 — Public Website

- homepage
- article page
- category page
- tag page
- search
- author page
- RSS
- sitemap
- SEO

## Phase 7 — Admin

- dashboard
- article manager
- editor
- media library
- categories
- tags
- authors
- analytics
- settings

## Phase 8 — Performance

- caching
- dynamic imports
- image optimization
- query optimization
- CDN
- Core Web Vitals

## Phase 9 — Observability

- OpenTelemetry
- Sentry
- structured logging
- metrics
- health checks

## Phase 10 — Testing

- unit
- integration
- E2E
- performance
- security

---

# 52. Final Recommended Stack

```text
Frontend
────────
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Radix UI
Lucide React
Motion

Content
───────
MDX
Shiki
Mermaid
React Flow
KaTeX

Admin
─────
shadcn/ui
TanStack Table
TanStack Query
React Hook Form
Zod
Tiptap
CodeMirror 6
cmdk
dnd-kit
Sonner
Recharts

Backend
───────
NestJS
TypeScript
REST
OpenAPI

Data
────
MongoDB
Prisma ORM

Storage
───────
Cloudflare R2
Cloudflare CDN
Local Storage Provider
Optional S3 / Cloudinary Provider

Auth
────
Clerk
RBAC

Search
──────
Orama
Provider abstraction for future Meilisearch/Typesense/OpenSearch

Observability
─────────────
OpenTelemetry
Sentry
Prometheus-compatible metrics
Grafana

Testing
───────
Vitest/Jest
Playwright

Infrastructure
──────────────
Cloudflare
Next.js hosting
NestJS hosting
MongoDB managed cluster
R2 object storage
```

---

# 53. Non-Negotiable Architecture Principles

### Public website

Optimize for:

```text
READABILITY
SEO
SPEED
CONTENT
CODE
DIAGRAMS
```

### Admin

Optimize for:

```text
PRODUCTIVITY
SAFETY
SEARCH
CONTENT MANAGEMENT
PREVIEW
PUBLISHING
```

### Backend

Optimize for:

```text
SECURITY
VALIDATION
OBSERVABILITY
SCALABILITY
MAINTAINABILITY
```

### Storage

Optimize for:

```text
CDN
SPEED
COST
RELIABILITY
IMAGE QUALITY
```

### Database

Optimize for:

```text
QUERY PATTERNS
INDEXES
PAGINATION
SMALL PAYLOADS
```

---

# 54. Final Product Vision

The final platform should feel like a serious engineering publication and developer knowledge platform.

It should NOT feel like:

- a generic WordPress blog
- a generic SaaS dashboard
- a template marketplace
- an over-animated landing page

The target experience is:

```text
                    TECHNICAL BLOG
                          │
         ┌────────────────┼────────────────┐
         │                │                │
       READ              LEARN           EXPLORE
         │                │                │
     Articles          Code          Architecture
         │                │                │
       MDX             Shiki          Mermaid
         │                │                │
      Search          Examples       React Flow
         │                │                │
       SEO             Practice       Interactive
```

Build the system so that adding a new article, diagram type, storage provider, search engine, analytics provider, or UI component does not require rewriting the platform.

The architecture must favor **modularity, speed, content quality, and long-term maintainability** over unnecessary complexity.

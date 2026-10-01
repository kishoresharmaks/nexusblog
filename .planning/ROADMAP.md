# NexusBlog Project Roadmap

## Milestone 1: MVP Core Platform

- [ ] **Phase 1: Foundation Monorepo & UI Architecture**
  - [ ] Monorepo workspace configuration (`pnpm-workspace.yaml`, root scripts)
  - [ ] Shared packages (`@nexus/types`, `@nexus/tsconfig`, `@nexus/config`, `@nexus/ui`)
  - [ ] NestJS application bootstrap (`apps/api`)
  - [ ] Next.js 15 application bootstrap (`apps/web`) with Tailwind CSS & Design Tokens
  - [ ] Verification & typecheck across monorepo

- [ ] **Phase 2: Custom NestJS Auth & Session Engine**
  - [ ] Argon2id password hashing & JWT service
  - [ ] Rotating refresh token session management in MongoDB via HTTP-Only Secure cookies
  - [ ] Email verification & password reset flows
  - [ ] Role-Based Access Control (`RBAC`) guards and decorators (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `USER`)
  - [ ] Frontend Auth context, login/register forms, and middleware guards

- [ ] **Phase 3: Database & Taxonomy Data Layer**
  - [ ] Prisma schema with MongoDB collections (`User`, `Session`, `Article`, `Category`, `Tag`, `Technology`, `Series`, `Comment`, `Bookmark`, `ReadingHistory`, `AuditLog`)
  - [ ] Query-optimized compound indexes
  - [ ] CRUD services for Categories, Tags, Technologies, and Series
  - [ ] Database seed scripts for initial taxonomy and admin account

- [ ] **Phase 4: MDX & Diagram Rendering Pipeline**
  - [ ] Unified MDX compiler with plugins
  - [ ] Shiki syntax highlighter (with light/dark theme, copy button, line highlighting)
  - [ ] Custom MDX components (`<CodeTabs>`, `<Callout>`, `<Terminal>`, `<Benchmark>`, `<DatabaseSchema>`, `<KaTeX>`)
  - [ ] Mermaid diagram SVG renderer
  - [ ] Dynamic on-demand React Flow interactive diagram renderer

- [ ] **Phase 5: Storage Provider & R2 Media Pipeline**
  - [ ] `StorageProvider` interface abstraction
  - [ ] `LocalStorageProvider` for local filesystem dev storage
  - [ ] `R2StorageProvider` / S3 for production cloud storage
  - [ ] Direct-to-storage signed upload endpoints
  - [ ] Image metadata, AVIF/WebP variant generation, and blurhash creation

- [ ] **Phase 6: Public Website & Reading Experience**
  - [ ] Homepage with Hero, Topic carousels, Trending Technologies, and Newsletter CTA
  - [ ] Article listing with multi-facet filtering and pagination
  - [ ] Article detail page with 3-column layout (Sticky dynamic TOC, content, author meta)
  - [ ] Dedicated Category, Tag, and Technology pages
  - [ ] Multi-part Series reader with progress tracking
  - [ ] Orama instant search command palette (`Cmd+K`)

- [ ] **Phase 7: User Dashboard & Guest Post Workflow**
  - [ ] User dashboard (`/dashboard`) with saved bookmarks, reading history %, and comments
  - [ ] Contributor landing page (`/write-for-us`)
  - [ ] Guest post submission wizard (`/guest-post/submit`) with draft autosave
  - [ ] Contributor submissions tracker (`/dashboard/guest-posts`) with feedback viewing and resubmission

- [ ] **Phase 8: Admin Panel & Editorial CMS**
  - [ ] Admin Shell with collapsible sidebar, command palette, and metric overview
  - [ ] Article management with TanStack Table and server pagination
  - [ ] CodeMirror 6 MDX editor with live synchronized preview
  - [ ] Guest post moderation queue with review status transitions & editorial feedback notes
  - [ ] Media Library UI with drag-and-drop and usage inspection
  - [ ] Comment moderation, SEO diagnostics (`/admin/seo`), and Audit log viewer

- [ ] **Phase 9: SEO Engine, Analytics & Performance**
  - [ ] Dynamic OpenGraph image generator (`@vercel/og`)
  - [ ] JSON-LD Article and Breadcrumb schemas
  - [ ] Automatic Sitemap, Robots.txt, and RSS feed generators
  - [ ] Lightweight privacy-friendly analytics tracker
  - [ ] Newsletter subscription system

- [ ] **Phase 10: Observability, Testing & Production Hardening**
  - [ ] OpenTelemetry & Sentry error reporting
  - [ ] Structured JSON logging with request correlation IDs
  - [ ] Rate limiting, Helmet security headers, and CORS lockdown
  - [ ] Vitest unit tests and Playwright E2E test suite for auth and publishing

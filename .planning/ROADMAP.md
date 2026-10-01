# NexusBlog Project Roadmap

## Milestone 1: MVP Core Platform

- [x] **Phase 1: Foundation Monorepo & UI Architecture**
  - [x] Monorepo workspace configuration (`pnpm-workspace.yaml`, root scripts)
  - [x] Shared packages (`@nexus/types`, `@nexus/tsconfig`, `@nexus/config`, `@nexus/ui`)
  - [x] NestJS application bootstrap (`apps/api`)
  - [x] Next.js 15 application bootstrap (`apps/web`) with Tailwind CSS & Design Tokens
  - [x] Verification & typecheck across monorepo

- [x] **Phase 2: Custom NestJS Auth & Session Engine**
  - [x] Argon2id password hashing & JWT service
  - [x] Rotating refresh token session management in MongoDB via HTTP-Only Secure cookies
  - [x] Email verification & password reset flows
  - [x] Role-Based Access Control (`RBAC`) guards and decorators (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `USER`)
  - [x] Frontend Auth context, login/register forms, and middleware guards

- [x] **Phase 3: Database & Taxonomy Data Layer**
  - [x] Prisma schema with MongoDB collections (`User`, `Session`, `Article`, `Category`, `Tag`, `Technology`, `Series`, `Comment`, `Bookmark`, `ReadingHistory`, `AuditLog`)
  - [x] Query-optimized compound indexes
  - [x] CRUD services for Categories, Tags, Technologies, and Series
  - [x] Database seed scripts for initial taxonomy and admin account

- [x] **Phase 4: MDX & Diagram Rendering Pipeline**
  - [x] Unified MDX compiler with plugins
  - [x] Shiki syntax highlighter (with light/dark theme, copy button, line highlighting)
  - [x] Custom MDX components (`<CodeTabs>`, `<Callout>`, `<Terminal>`, `<Benchmark>`, `<DatabaseSchema>`, `<KaTeX>`)
  - [x] Mermaid diagram SVG renderer
  - [x] Dynamic on-demand React Flow interactive diagram renderer

- [x] **Phase 5: Storage Provider & R2 Media Pipeline**
  - [x] `StorageProvider` interface abstraction
  - [x] `LocalStorageProvider` for local filesystem dev storage
  - [x] `R2StorageProvider` / S3 for production cloud storage
  - [x] Direct-to-storage signed upload endpoints
  - [x] Image metadata, AVIF/WebP variant generation, and blurhash creation

- [x] **Phase 6: Public Website & Reading Experience**
  - [x] Homepage with Hero, Topic carousels, Trending Technologies, and Newsletter CTA
  - [x] Article listing with multi-facet filtering and pagination
  - [x] Article detail page with 3-column layout (Sticky dynamic TOC, content, author meta)
  - [x] Dedicated Category, Tag, and Technology pages
  - [x] Multi-part Series reader with progress tracking
  - [x] Search command palette (`Cmd+K`) and dedicated `/search` page

- [x] **Phase 7: User Dashboard & Guest Post Workflow**
  - [x] User dashboard (`/dashboard`) with saved bookmarks, reading history %, and comments
  - [x] Contributor landing page (`/write-for-us`)
  - [x] Guest post submission wizard (`/guest-post/submit`) with draft autosave and live MDX preview
  - [x] Contributor submissions tracker (`/dashboard/guest-posts`) with feedback viewing and resubmission

- [x] **Phase 8: Admin Panel & Editorial CMS**
  - [x] Admin Shell with collapsible sidebar, command palette, and metric overview
  - [x] Article management with server pagination, search, and status controls
  - [x] Dual-mode MDX editor (`/admin/articles/new` & `[id]/edit`) with live synchronized preview
  - [x] Guest post moderation queue with review status transitions & editorial feedback notes
  - [x] Media Library UI with drag-and-drop, WebP variants, and usage inspection
  - [x] Comment moderation, SEO diagnostics (`/admin/seo`), and Security Audit log viewer

- [x] **Phase 9: SEO Engine, Analytics & Performance**
  - [x] Dynamic OpenGraph image generator (`@vercel/og`)
  - [x] JSON-LD Article and Breadcrumb schemas
  - [x] Automatic Sitemap, Robots.txt, and RSS feed generators
  - [x] Lightweight privacy-friendly analytics tracker
  - [x] Newsletter subscription system

- [x] **Phase 10: Observability, Testing & Production Hardening**
  - [x] Structured JSON logging with request correlation IDs (`X-Correlation-Id`)
  - [x] Helmet security headers, cookie encryption, and CORS lockdown
  - [x] Vitest unit test suite (Argon2id hashing, taxonomy validation, UI utilities, site config)
  - [x] Playwright E2E test suite (Auth flow, Article reader, Guest post wizard, Admin CMS)
  - [x] Monorepo full production build & TypeScript validation verification

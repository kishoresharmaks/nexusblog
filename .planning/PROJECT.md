# NexusBlog — Technical Engineering Blog & Knowledge Portal

## 1. Project Overview
A production-grade technical publishing platform and developer knowledge portal focused on System Design, Backend Engineering, Distributed Systems, Databases, Cloud, DevOps, and Architecture Case Studies.

## 2. Core Pillars
- **Aesthetic**: Premium editorial design inspired by Vercel, Linear, GitHub, Stripe Engineering, and Mintlify.
- **Audience Tiers**: Guest Readers, Authenticated Users (`/dashboard`), Guest Post Contributors (`/guest-post/submit`), and Editorial Admins (`/admin`).
- **Authentication**: 100% Self-Managed NestJS AuthModule (Argon2id + Access JWT + Rotating Refresh Tokens in HTTP-Only Cookies + MongoDB Session store).
- **Content Engine**: Unified MDX pipeline with Shiki syntax highlighting, Mermaid diagrams, dynamic React Flow interactive canvases, and KaTeX math formulas.
- **Media Pipeline**: Abstracted `StorageProvider` (Local for development, Cloudflare R2 + CDN for production) with direct-to-storage signed uploads and AVIF/WebP variant generation.
- **SEO & Performance**: Dynamic OpenGraph images, JSON-LD article/breadcrumb schemas, SSR/Server Components by default, and Orama instant search palette.

## 3. Technology Stack
- **Monorepo**: pnpm workspaces
- **Frontend (`apps/web`)**: Next.js 15 (App Router), React 19, TypeScript (Strict), Tailwind CSS, shadcn/ui, Radix UI primitives, Lucide React, Motion, Sonner, cmdk, TanStack Query, TanStack Table, React Hook Form, Zod.
- **Backend (`apps/api`)**: NestJS, TypeScript, Prisma ORM, MongoDB, Swagger/OpenAPI, Argon2, Passport/JWT, Class-Validator.
- **Shared Packages (`packages/*`)**: `@nexus/types`, `@nexus/ui`, `@nexus/config`, `@nexus/tsconfig`.

# Technical Engineering Blog Portal — Pages & Features Specification

## 1. Product Overview

A modern technical publishing portal focused on:

- System Design
- Backend Engineering
- Distributed Systems
- Databases
- APIs
- DevOps
- Cloud
- Performance
- Observability
- AI / Engineering
- Java / Spring Boot
- Node.js / NestJS
- Next.js
- Redis
- Kafka
- MongoDB
- PostgreSQL
- Kubernetes / Docker
- Architecture case studies

The portal supports four main experiences:

1. **Guest**
2. **Registered User**
3. **Guest Post Author / Contributor**
4. **Admin**

The portal must prioritize:

- Technical readability
- Fast article loading
- SEO
- Code readability
- Architecture diagrams
- Excellent search
- Simple publishing workflow
- Strong moderation
- Optimized media
- Responsive UX
- Secure authentication
- Scalable backend architecture

---

# 2. Core Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Motion
- MDX
- Shiki
- Mermaid
- React Flow
- KaTeX
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Sonner
- cmdk
- dnd-kit

## Backend

- NestJS
- TypeScript
- REST API
- Prisma ORM
- MongoDB
- OpenAPI / Swagger
- RBAC
- Rate limiting
- Structured logging

## Authentication — Fully Custom / Self-Managed

Authentication must be implemented inside the NestJS backend. Do NOT use Clerk, Auth0, Firebase Authentication, Auth.js, or another third-party authentication provider.

Use:

- Custom NestJS AuthModule
- Prisma ORM
- MongoDB
- Argon2id for password hashing
- Short-lived JWT access tokens
- Rotating refresh-token sessions
- HTTP-only, Secure cookies
- SameSite cookie protection
- CSRF protection where applicable
- Email verification
- Password reset
- Login rate limiting
- Failed-login protection
- Session management
- Token/session revocation
- RBAC
- Authentication audit logs

Authentication must support:

- Register
- Login
- Logout
- Logout all sessions
- Forgot password
- Password reset
- Email verification
- Change password
- Change email with re-verification
- Profile management
- Active session management
- Role-based access

### Authentication Flow

```text
Browser
   │
   │ Login
   ▼
NestJS Auth API
   │
   ├── Validate input
   ├── Find user
   ├── Verify Argon2id password hash
   └── Create authenticated session
           │
           ├── Short-lived Access JWT
           └── Rotating Refresh Token
                    │
                    ▼
          HTTP-only Secure Cookie
```

### User Authentication Data

```text
User
├── id
├── name
├── username
├── email
├── passwordHash
├── avatar
├── bio
├── role
├── status
├── emailVerified
├── createdAt
└── updatedAt

Session
├── id
├── userId
├── refreshTokenHash
├── userAgent
├── privacy-safe IP metadata
├── expiresAt
├── lastUsedAt
├── createdAt
└── revokedAt

EmailVerification
├── id
├── userId
├── tokenHash
├── expiresAt
└── usedAt

PasswordReset
├── id
├── userId
├── tokenHash
├── expiresAt
└── usedAt
```

### Authentication Security Rules

- Never store plain-text passwords.
- Hash passwords using Argon2id.
- Never store raw password-reset or verification tokens when a secure hash can be stored instead.
- Store refresh-token hashes rather than reusable raw refresh tokens.
- Use short-lived access tokens.
- Rotate refresh tokens on use.
- Revoke the previous refresh session after successful rotation.
- Use HTTP-only cookies so authentication tokens are not accessible to normal client-side JavaScript.
- Use Secure cookies in production.
- Configure SameSite appropriately.
- Rate-limit login, registration, password-reset, and verification endpoints.
- Do not reveal whether an email address exists during password-reset requests.
- Invalidate appropriate sessions after password changes or security-sensitive account changes.
- Enforce authorization in NestJS; never rely only on frontend route protection.
- Record security-sensitive actions in audit logs.

## Storage

Storage abstraction supporting:

- Local storage for development
- Cloudflare R2 for production
- Optional S3
- Optional Cloudinary

Recommended production:

```text
Cloudflare R2 + Cloudflare CDN
```

Never store uploaded image binaries directly in MongoDB.

---

# 3. User Types

## 3.1 Guest

A visitor without an account.

Can:

- Browse homepage
- Browse articles
- Read articles
- Search articles
- Browse categories
- Browse tags
- Browse authors
- Browse series
- View technology pages
- Share articles
- Copy code
- View diagrams
- Subscribe to newsletter
- Submit a guest post
- Register / login

Cannot:

- Bookmark
- Like
- Comment
- Manage profile
- Track reading progress across devices
- Access user dashboard
- Manage guest posts after submission unless logged in

---

# 3.2 Registered User

A normal authenticated reader.

Can do everything a guest can do plus:

- Bookmark articles
- Like/react
- Comment
- Reply to comments
- Manage profile
- Manage reading list
- Track reading progress
- Follow authors/topics if implemented
- Manage newsletter preferences
- View personal activity
- Submit guest posts
- Track their guest post submissions

---

# 3.3 Guest Post Author / Contributor

A registered user who submits an article for publication.

Can:

- Submit guest post
- Save guest-post draft
- Edit unpublished submission
- Upload allowed media
- Add article metadata
- Preview article
- Submit for review
- View submission status
- Receive admin/editor feedback
- Update rejected article
- Resubmit

Cannot:

- Directly publish
- Modify other authors' content
- Access admin dashboard
- Change site-wide settings
- Approve their own article

Possible statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
CHANGES_REQUESTED
APPROVED
SCHEDULED
PUBLISHED
REJECTED
```

---

# 3.4 Admin

Admin has complete portal management access depending on role.

Suggested roles:

```text
SUPER_ADMIN
ADMIN
EDITOR
AUTHOR
MODERATOR
ANALYST
```

Admin capabilities:

- Manage articles
- Manage guest posts
- Manage users
- Manage authors
- Manage categories
- Manage tags
- Manage series
- Manage media
- Manage comments
- Manage newsletter
- Manage SEO
- View analytics
- Manage settings
- View audit logs
- Manage roles/permissions

---

# 4. Public Pages

## 4.1 Homepage

Route:

```text
/
```

Sections:

### Header

- Logo
- Articles
- Categories
- System Design
- Backend
- DevOps / Cloud
- Search
- Theme switcher
- Login
- Register
- User profile when logged in

### Hero

- Main featured article
- Short description
- Category
- Author
- Reading time
- CTA

### Latest Articles

- Article cards
- Pagination/load more

### Featured Articles

- Curated articles selected by admin

### Popular Articles

- Most-read articles

### Topics / Categories

Examples:

```text
System Design
Backend
Databases
DevOps
Cloud
AI
Performance
Security
```

### Trending Technologies

```text
Redis
Kafka
MongoDB
PostgreSQL
NestJS
Spring Boot
Kubernetes
Docker
```

### Technical Series

Show active series.

### Newsletter

Email subscription.

### Footer

- About
- Contact
- Privacy
- Terms
- RSS
- Sitemap
- Social links

---

# 5. Articles Listing Page

Route:

```text
/articles
```

Features:

- Search
- Category filter
- Tag filter
- Technology filter
- Difficulty filter
- Article type filter
- Sort by latest
- Sort by popular
- Pagination
- Responsive cards
- Featured article

Article card:

```text
Cover image
Category
Title
Excerpt
Author
Published date
Reading time
Difficulty
Tags
```

---

# 6. Article Detail Page

Route:

```text
/articles/[slug]
```

This is the most important page.

Structure:

```text
Breadcrumb

Category

H1 Title

Excerpt

Author
Published date
Updated date
Reading time
Difficulty

Tags

Hero Image

Article Layout

┌───────────────┬────────────────────────────┐
│ Table of      │ Article Content             │
│ Contents      │                             │
│               │ Introduction                │
│ 01 ...        │ Architecture                │
│ 02 ...        │ Code                        │
│ 03 ...        │ Diagrams                    │
│               │ Benchmarks                  │
└───────────────┴────────────────────────────┘

Share
Like
Bookmark

Related Articles

Series Navigation

Author

Comments

Newsletter
```

Article features:

- MDX
- Shiki code blocks
- Mermaid diagrams
- React Flow diagrams
- KaTeX
- Tables
- Callouts
- Images
- Image captions
- Code copy
- Code line highlighting
- Terminal blocks
- API examples
- Database schemas
- Benchmarks
- References
- Table of contents
- Reading progress
- Share
- Like
- Bookmark
- Comments
- Related articles
- Previous / next article

---

# 7. Category Pages

Route:

```text
/categories
/categories/[slug]
```

Example:

```text
/categories/system-design
```

Features:

- Category description
- Category cover
- Article count
- Latest articles
- Popular articles
- Subtopics
- Related technologies
- Pagination

---

# 8. Tag Pages

Route:

```text
/tags
/tags/[slug]
```

Example:

```text
/tags/redis
```

Features:

- Tag description
- Related articles
- Technology references
- Article count
- Search/filter
- Pagination

---

# 9. Technology Pages

Route:

```text
/technologies
/technologies/[slug]
```

Example:

```text
/technologies/redis
/technologies/kafka
/technologies/mongodb
```

Show:

- Technology description
- Official documentation link
- Related articles
- System designs
- Tutorials
- Comparisons
- Related technologies

---

# 10. Series Pages

Route:

```text
/series
/series/[slug]
```

Example:

```text
/series/system-design-from-zero
```

Show:

```text
Part 1
Part 2
Part 3
Part 4
...
```

Features:

- Series description
- Progress
- Article list
- Previous / next navigation
- Completion indicator for logged-in users

---

# 11. Author Pages

Route:

```text
/authors
/authors/[slug]
```

Show:

- Avatar
- Name
- Bio
- Social links
- Expertise
- Articles
- Series
- Popular posts
- Contributor status

---

# 12. Search Page

Route:

```text
/search
```

Features:

- Full-text search
- Instant suggestions
- Search history for logged-in users
- Filters
- Highlighted results
- Category filtering
- Technology filtering
- Difficulty filtering
- Article type filtering

Search fields:

```text
Title
Excerpt
Content
Tags
Categories
Technologies
Author
```

Recommended initial search:

```text
Orama
```

Keep search behind an abstraction so it can later migrate to:

- Meilisearch
- Typesense
- OpenSearch
- Elasticsearch

---

# 13. Guest Post Pages

## Guest Post Landing Page

Route:

```text
/write-for-us
```

Explain:

- What topics are accepted
- Writing guidelines
- Technical quality expectations
- Content requirements
- Image requirements
- Originality requirements
- Review process
- Publication process
- Author attribution
- Terms

CTA:

```text
[Submit a Guest Post]
```

---

# 14. Guest Post Submission Page

Route:

```text
/guest-post/submit
```

Requires login/register.

Fields:

```text
Title
Slug
Excerpt
Category
Tags
Technologies
Difficulty
Article Type
Cover Image
Content
Author Bio
Author Avatar
Social Links
References
SEO Title
SEO Description
```

Actions:

```text
Save Draft
Preview
Submit for Review
```

---

# 15. Guest Post Dashboard

Route:

```text
/dashboard/guest-posts
```

For contributors.

Show:

```text
Drafts
Submitted
Under Review
Changes Requested
Approved
Published
Rejected
```

Each submission:

```text
Title
Status
Submitted At
Updated At
Admin Feedback
Actions
```

Actions:

```text
Edit
Preview
Resubmit
View Feedback
```

---

# 16. Authentication Pages

## Login

```text
/login
```

Features:

- Email/password
- OAuth if enabled
- Forgot password
- Register link

## Register

```text
/register
```

Fields:

- Name
- Email
- Password
- Confirm password

Optional:

- Username
- Profile image

## Forgot Password

```text
/forgot-password
```

## Reset Password

```text
/reset-password
```

## Email Verification

```text
/verify-email
```

---

# 17. User Dashboard

Route:

```text
/dashboard
```

Sections:

```text
Overview
Bookmarks
Reading History
Comments
Guest Posts
Profile
Settings
Newsletter
```

Dashboard cards:

```text
Articles Saved
Articles Read
Comments
Guest Posts
```

---

# 18. User Bookmarks

Route:

```text
/dashboard/bookmarks
```

Features:

- Saved articles
- Folders/collections optionally
- Search
- Filter
- Remove bookmark

---

# 19. Reading History

Route:

```text
/dashboard/history
```

Track:

- Article
- Last read position
- Last viewed date
- Completion percentage

Allow:

```text
Continue Reading
Remove
Clear History
```

---

# 20. User Comments

Route:

```text
/dashboard/comments
```

Show:

- Comments
- Article
- Date
- Status
- Replies
- Moderation status

---

# 21. User Profile

Route:

```text
/profile/[username]
```

Public profile can contain:

- Avatar
- Name
- Bio
- Website
- GitHub
- LinkedIn
- Articles
- Guest posts
- Expertise

Private settings:

```text
/dashboard/profile
```

---

# 22. Newsletter

Public:

```text
/newsletter
```

Features:

- Subscribe
- Confirm email
- Unsubscribe
- Preference management

User dashboard:

```text
/dashboard/newsletter
```

Admin:

```text
/admin/newsletter
```

---

# 23. Legal / Utility Pages

Required:

```text
/about
/contact
/privacy
/terms
/cookie-policy
/write-for-us
```

Technical utility:

```text
/rss.xml
/sitemap.xml
/robots.txt
```

---

# 24. Admin Pages

Admin base:

```text
/admin
```

---

## 24.1 Admin Dashboard

```text
/admin
```

Metrics:

```text
Total Articles
Published
Drafts
Guest Posts
Users
Views
Comments
Subscribers
```

Charts:

- Views over time
- Articles published
- Top categories
- Top technologies
- Top articles
- Traffic sources

Recent activity:

```text
New article
Guest post submitted
Comment reported
Article published
User registered
```

---

# 25. Admin Article Management

Route:

```text
/admin/articles
```

Features:

- List
- Search
- Filter
- Sort
- Pagination
- Bulk actions

Columns:

```text
Title
Author
Category
Status
Views
Published
Updated
Actions
```

Actions:

```text
Edit
Preview
Publish
Unpublish
Schedule
Duplicate
Archive
Delete
```

---

# 26. Admin Article Editor

Route:

```text
/admin/articles/new
/admin/articles/[id]/edit
```

Fields:

### Core

```text
Title
Slug
Excerpt
Content
```

### Classification

```text
Category
Tags
Technologies
Difficulty
Article Type
```

### Author

```text
Author
```

### Media

```text
Cover Image
Thumbnail
OG Image
```

### Technical

```text
Prerequisites
Learning Objectives
Key Takeaways
Architecture Components
References
```

### Series

```text
Series
Series Order
```

### SEO

```text
SEO Title
SEO Description
Canonical URL
No Index
OG Image
```

### Publishing

```text
Status
Publish Date
Schedule Date
Featured
```

Actions:

```text
Save Draft
Preview
Save
Schedule
Publish
```

---

# 27. Admin Guest Post Management

Route:

```text
/admin/guest-posts
```

Tabs:

```text
All
Submitted
Under Review
Changes Requested
Approved
Scheduled
Published
Rejected
```

Admin actions:

```text
Open
Review
Edit
Request Changes
Approve
Schedule
Publish
Reject
Delete
```

Feedback field:

```text
Editorial Feedback
```

Author receives feedback in their dashboard.

---

# 28. Admin Category Management

Route:

```text
/admin/categories
```

Features:

- Create
- Edit
- Delete
- Reorder
- Description
- SEO metadata
- Image
- Parent category if required

Fields:

```text
Name
Slug
Description
Image
SEO Title
SEO Description
Order
Status
```

---

# 29. Admin Tag Management

Route:

```text
/admin/tags
```

Features:

- Create
- Edit
- Delete
- Merge tags
- Search
- Article count

---

# 30. Admin Technology Management

Route:

```text
/admin/technologies
```

Fields:

```text
Name
Slug
Description
Logo
Official URL
Documentation URL
SEO metadata
```

---

# 31. Admin Series Management

Route:

```text
/admin/series
```

Features:

- Create series
- Add articles
- Reorder articles
- Edit description
- Publish/unpublish series
- SEO metadata

---

# 32. Admin Author Management

Route:

```text
/admin/authors
```

Features:

- Create author
- Edit profile
- Avatar
- Bio
- Social links
- Expertise
- Author status
- Assign articles

---

# 33. Admin User Management

Route:

```text
/admin/users
```

Features:

- Search users
- View user
- View activity
- Change role
- Suspend user
- Restore user
- Delete user where appropriate

Columns:

```text
Name
Email
Role
Status
Registered
Last Active
```

---

# 34. Admin Comment Management

Route:

```text
/admin/comments
```

Features:

- Pending
- Approved
- Reported
- Spam
- Deleted

Actions:

```text
Approve
Reject
Delete
Mark Spam
Reply
```

---

# 35. Admin Media Library

Route:

```text
/admin/media
```

Features:

- Upload
- Drag/drop
- Search
- Filter
- Preview
- Edit metadata
- Delete
- Replace
- Copy URL
- View usage

Media fields:

```text
File
Alt Text
Caption
Width
Height
Size
Format
Storage Provider
Created By
Created At
```

Storage providers:

```text
Local
R2
S3
Cloudinary
```

Recommended production:

```text
R2 + CDN
```

---

# 36. Admin Newsletter

Route:

```text
/admin/newsletter
```

Features:

- Subscriber count
- Subscribers
- Search
- Filter
- Export
- Unsubscribe
- Campaign integration if added later

---

# 37. Admin Analytics

Route:

```text
/admin/analytics
```

Metrics:

```text
Page Views
Unique Visitors
Article Views
Reading Time
Completion Rate
Bookmarks
Likes
Comments
Code Copies
Searches
Newsletter Signups
```

Views:

```text
Today
7 Days
30 Days
90 Days
Custom
```

---

# 38. Admin SEO

Route:

```text
/admin/seo
```

Features:

- Sitemap status
- Robots configuration
- Metadata defaults
- OG defaults
- Broken links
- Missing descriptions
- Missing alt text
- Duplicate slugs
- Redirect management

---

# 39. Admin Settings

Route:

```text
/admin/settings
```

Sections:

### General

```text
Site name
Description
Logo
Favicon
Domain
Timezone
```

### Branding

```text
Logo
Colors
Typography
Social links
```

### Content

```text
Default category
Default author
Publishing settings
Guest post settings
Comment settings
```

### SEO

```text
Default SEO title
Default description
Default OG image
```

### Storage

```text
Storage provider
CDN URL
Upload limits
```

### Security

```text
Authentication settings
Allowed domains
Rate limits
```

---

# 40. Admin Audit Logs

Route:

```text
/admin/audit-logs
```

Track:

```text
User
Action
Resource
Resource ID
Timestamp
IP metadata where appropriate
```

Actions:

```text
ARTICLE_CREATED
ARTICLE_UPDATED
ARTICLE_PUBLISHED
ARTICLE_DELETED
GUEST_POST_APPROVED
GUEST_POST_REJECTED
USER_ROLE_CHANGED
MEDIA_UPLOADED
MEDIA_DELETED
SETTINGS_UPDATED
```

Do not log secrets, passwords, tokens, or sensitive credentials.

---

# 41. Article Content Features

Every article can support:

```text
Headings
Paragraphs
Lists
Tables
Images
Captions
Links
Code blocks
Terminal blocks
Callouts
Warnings
Tips
Tabs
Accordions
Mermaid
React Flow
API examples
Database schemas
Benchmarks
Quotes
Videos
References
```

---

# 42. Technical Article Metadata

Recommended fields:

```text
Difficulty:
Beginner
Intermediate
Advanced
Expert

Article Type:
Tutorial
System Design
Deep Dive
Case Study
Guide
How-To
Comparison
Reference
News
Opinion
```

Additional:

```text
Prerequisites
Learning Objectives
Key Takeaways
Technologies
Architecture Patterns
```

---

# 43. Article Engagement Features

Logged-in users:

```text
Like
Bookmark
Comment
Reply
Share
Reading Progress
```

Guests:

```text
Read
Share
Copy Code
Subscribe
```

Optional:

```text
Print Article
Download Article PDF
```

---

# 44. Social Sharing

Support:

```text
LinkedIn
X
WhatsApp
Reddit
Copy Link
Email
```

Use dynamic OG images.

OG image should contain:

```text
Article Title
Category
Author
Site Branding
```

---

# 45. Related Content

At article bottom:

```text
Related Articles
More from this Category
More from this Author
More about this Technology
Continue Series
```

Recommendation can initially use:

```text
Tags
Category
Technology
Series
```

Later it can be upgraded to semantic/embedding-based recommendations.

---

# 46. Image Optimization

Upload flow:

```text
Admin / Author
      ↓
Upload validation
      ↓
Direct signed upload
      ↓
Object storage
      ↓
Image processing
      ↓
Optimized variants
      ↓
CDN
      ↓
Next.js Image
```

Formats:

```text
AVIF
WebP
Original
```

Store metadata in MongoDB.

Do not store binary images in MongoDB.

---

# 47. Performance Requirements

Public pages should prioritize:

- Server Components
- SSR/SSG/ISR where appropriate
- CDN caching
- optimized images
- minimal JavaScript
- lazy loading
- dynamic import for React Flow
- cached article content
- paginated article lists
- optimized MongoDB queries

Admin can use more client-side functionality because it is an authenticated application.

---

# 48. SEO Requirements

Every public article should support:

```text
Title
Description
Canonical
OG title
OG description
OG image
Article schema
Breadcrumb schema
Author
Published date
Updated date
```

Global:

```text
Sitemap
Robots
RSS
Canonical URLs
Clean slugs
Internal linking
```

---

# 49. Search Engine Optimization Content Structure

Technical article should ideally contain:

```text
Title
Excerpt
Introduction
Key Takeaways
Main Content
Architecture
Examples
Tradeoffs
Conclusion
References
Related Articles
```

Do not force this structure on every article; allow editors to customize it.

---

# 50. Responsive UX

Desktop:

```text
Header
Sidebar / TOC
Content
```

Tablet:

```text
Header
Content
Collapsible TOC
```

Mobile:

```text
Header
Title
Metadata
Hero
TOC
Content
Sticky article actions
Related content
```

Admin mobile:

```text
Header
Drawer
Content
```

---

# 51. Dark Mode

Support:

```text
Light
Dark
System
```

Code blocks must have dedicated light/dark Shiki themes.

Diagrams must remain readable in both themes.

---

# 52. Notifications

Use Sonner or equivalent.

Examples:

```text
Article saved
Draft published
Guest post submitted
Comment posted
Bookmark saved
Image uploaded
Profile updated
```

---

# 53. Command Palette

Use:

```text
Ctrl/Cmd + K
```

Public:

```text
Search articles
Search technologies
Search categories
Open bookmarks
```

Admin:

```text
Create article
Search articles
Open media
Open guest posts
Open users
Open settings
```

---

# 54. Guest Post Editorial Workflow

```text
User
 ↓
Create Guest Post
 ↓
Save Draft
 ↓
Submit
 ↓
Admin Review
 ↓
 ┌──────────────────┐
 │                  │
 ↓                  ↓
Changes Needed    Approved
 │                  │
 ↓                  ↓
Author Updates    Schedule
 │                  │
 └──────→ Review   ↓
                 Publish
                   ↓
                Published
```

Admin must be able to add editorial feedback.

---

# 55. Permissions

## Guest

```text
READ_PUBLIC
SEARCH_PUBLIC
SUBSCRIBE
SUBMIT_GUEST_POST_AFTER_LOGIN
```

## User

```text
READ_PUBLIC
BOOKMARK
LIKE
COMMENT
MANAGE_PROFILE
SUBMIT_GUEST_POST
MANAGE_OWN_GUEST_POSTS
```

## Author

```text
USER_PERMISSIONS
CREATE_ASSIGNED_ARTICLES
EDIT_OWN_ARTICLES
```

## Editor

```text
MANAGE_ARTICLES
MANAGE_GUEST_POSTS
MANAGE_CATEGORIES
MANAGE_TAGS
MANAGE_SERIES
MODERATE_COMMENTS
```

## Admin

```text
EDITOR_PERMISSIONS
MANAGE_USERS
MANAGE_AUTHORS
MANAGE_MEDIA
MANAGE_ANALYTICS
MANAGE_SETTINGS
```

## Super Admin

```text
ALL_PERMISSIONS
MANAGE_ROLES
MANAGE_ADMINS
```

Never rely only on frontend route protection. NestJS must enforce authorization.

---

# 56. Recommended Route Map

```text
PUBLIC
────────────────────────────────────────

/
 /articles
 /articles/[slug]
 /categories
 /categories/[slug]
 /tags
 /tags/[slug]
 /technologies
 /technologies/[slug]
 /series
 /series/[slug]
 /authors
 /authors/[slug]
 /search
 /about
 /contact
 /newsletter
 /write-for-us
 /guest-post/submit
 /rss.xml
 /sitemap.xml
 /robots.txt


AUTH
────────────────────────────────────────

/login
/register
/forgot-password
/reset-password
/verify-email


USER
────────────────────────────────────────

/dashboard
/dashboard/bookmarks
/dashboard/history
/dashboard/comments
/dashboard/guest-posts
/dashboard/profile
/dashboard/settings
/dashboard/newsletter


ADMIN
────────────────────────────────────────

/admin
/admin/articles
/admin/articles/new
/admin/articles/[id]/edit
/admin/guest-posts
/admin/guest-posts/[id]
/admin/categories
/admin/tags
/admin/technologies
/admin/series
/admin/authors
/admin/users
/admin/comments
/admin/media
/admin/newsletter
/admin/analytics
/admin/seo
/admin/audit-logs
/admin/settings
```

---

# 57. MVP Feature Set

For the first production release, prioritize:

## Public

- Homepage
- Article listing
- Article page
- Categories
- Tags
- Search
- Authors
- Series
- Login/Register
- Guest post landing
- Guest post submission
- Newsletter
- Dark mode
- SEO
- RSS
- Responsive UI

## User

- Profile
- Bookmarks
- Likes
- Comments
- Reading history
- Guest post dashboard
- Guest post submission

## Admin

- Dashboard
- Article CRUD
- MDX editor
- Preview
- Publish/schedule
- Guest post moderation
- Category management
- Tag management
- Technology management
- Series management
- Author management
- User management
- Comment moderation
- Media library
- SEO management
- Basic analytics
- Audit logs
- Settings

---

# 58. V2 Features

After MVP:

- Advanced analytics
- Better recommendation engine
- Reading progress sync
- Article version history
- Scheduled social publishing
- Advanced media transformations
- Advanced search filters
- Technology knowledge pages
- Content health scoring
- Broken-link monitoring
- Internal-link suggestions
- Advanced newsletter campaigns

---

# 59. Product Principle

This is primarily a **technical publishing portal**, not a social network.

Prioritize:

```text
CONTENT
  ↓
READABILITY
  ↓
DISCOVERY
  ↓
SEO
  ↓
PUBLISHING
  ↓
PERFORMANCE
```

Avoid adding features simply because they are common in social platforms.

Every feature should improve one of:

- article quality
- reading experience
- content discovery
- author workflow
- editorial workflow
- SEO
- performance
- maintainability

---

# 60. Final Experience

The final product should feel like:

```text
Vercel
   +
Linear
   +
GitHub
   +
Stripe Engineering
   +
Modern Developer Documentation
```

The public side should be minimal, fast, highly readable, and technical.

The user side should make saving, reading, commenting, and contributing simple.

The guest-post system should provide a complete editorial workflow without giving contributors direct publishing access.

The admin side should provide complete control over content, users, guest posts, media, SEO, analytics, and platform settings.

The technical foundation remains:

```text
Next.js
      +
NestJS
      +
Prisma
      +
MongoDB
      +
MDX
      +
Shiki
      +
Mermaid
      +
React Flow
      +
R2/CDN
```

This specification should be treated as the master product/page/feature reference when implementing the portal in Antigravity.

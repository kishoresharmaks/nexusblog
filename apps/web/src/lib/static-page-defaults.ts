export interface DefaultStaticPage {
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
}

export const DEFAULT_STATIC_PAGES: Record<string, DefaultStaticPage> = {
  'privacy-policy': {
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

  'terms-of-service': {
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

  'disclaimer': {
    title: 'Disclaimer & Technical Notice',
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

  'content-policy': {
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

  'cookie-policy': {
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

- **Strictly Necessary Cookies:** Required for session authentication, CSRF mitigation, and user login state (\`refreshToken\`, \`nexus_access_token\`).
- **Preference Cookies:** Store user interface customizations, such as dark/light theme choice.

We do **not** use tracking cookies, third-party advertising pixels, or cross-site tracking beacons.

---

### 3. Managing Cookies

You can configure your web browser to block or alert you about cookies. However, disabling strictly necessary cookies will prevent you from signing in to your reader dashboard or admin panel.`,
  },

  'author-guidelines': {
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

  'contact': {
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
};

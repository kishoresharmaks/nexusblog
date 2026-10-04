export interface HeroArticlePayload {
  title: string;
  excerpt: string;
  slug: string;
  url: string;
  coverImage?: string;
  category?: string;
  readingTime?: number;
  difficulty?: string;
  authorName?: string;
}

export interface SecondaryArticlePayload {
  title: string;
  excerpt?: string;
  slug: string;
  url: string;
  coverImage?: string;
  category?: string;
  readingTime?: number;
  difficulty?: string;
}

export interface CodeSnippetPayload {
  code: string;
  language?: string;
  title?: string;
}

export interface CalloutPayload {
  type: 'tip' | 'warning' | 'info' | 'quote';
  title?: string;
  content: string;
}

export interface EmailHeaderOptions {
  siteUrl?: string;
  siteName?: string;
  editionTag?: string;
  dateText?: string;
  webVersionUrl?: string;
  tagline?: string;
}

export interface EmailFooterOptions {
  siteUrl?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
  copyrightYear?: number;
  companyName?: string;
  companyPostalAddress?: string;
}

/**
 * Modular Builder Pattern producing pixel-perfect, responsive dark & light theme emails
 * with high-contrast Cyan branding (#22d3ee), cross-client compatibility (Gmail, Apple Mail, Outlook).
 */
export class EmailTemplateBuilder {
  private subject = 'Nexus Engineering Newsletter';
  private previewText = 'Engineering insights, production-grade systems, and tools for modern developers.';
  private headerOptions: EmailHeaderOptions = {
    siteUrl: 'https://nexusnation.in',
    siteName: 'Nexus',
    editionTag: 'Tech. Systems. Engineering.',
    tagline: 'Engineering knowledge for a better internet.',
  };
  private introHtml = '';
  private introMarkdown = '';
  private heroArticle?: HeroArticlePayload;
  private secondaryArticles: SecondaryArticlePayload[] = [];
  private codeSnippet?: CodeSnippetPayload;
  private keyTakeaways: string[] = [];
  private callouts: CalloutPayload[] = [];
  private customBodyHtml = '';
  private customBodyMarkdown = '';
  private footerOptions: EmailFooterOptions = {
    siteUrl: 'https://nexusnation.in',
    companyName: 'Nexus',
    copyrightYear: new Date().getFullYear(),
    companyPostalAddress: 'Nexus Engineering Dispatch • Bangalore, India',
  };

  setSubject(subject: string): this {
    this.subject = subject;
    return this;
  }

  setPreviewText(previewText: string): this {
    this.previewText = previewText;
    return this;
  }

  setHeader(options: EmailHeaderOptions): this {
    this.headerOptions = { ...this.headerOptions, ...options };
    return this;
  }

  setIntro(html: string, markdown?: string): this {
    this.introHtml = html;
    this.introMarkdown = markdown || html;
    return this;
  }

  setHeroArticle(article: HeroArticlePayload): this {
    this.heroArticle = article;
    return this;
  }

  setSecondaryArticles(articles: SecondaryArticlePayload[]): this {
    this.secondaryArticles = articles;
    return this;
  }

  addSecondaryArticle(article: SecondaryArticlePayload): this {
    this.secondaryArticles.push(article);
    return this;
  }

  setCodeSnippet(code: string, language = 'TypeScript', title = 'Code Example'): this {
    this.codeSnippet = { code, language, title };
    return this;
  }

  setKeyTakeaways(takeaways: string[]): this {
    this.keyTakeaways = takeaways;
    return this;
  }

  addCallout(callout: CalloutPayload): this {
    this.callouts.push(callout);
    return this;
  }

  setCustomBody(html: string, markdown?: string): this {
    this.customBodyHtml = html;
    this.customBodyMarkdown = markdown || html;
    return this;
  }

  setFooter(options: EmailFooterOptions): this {
    this.footerOptions = { ...this.footerOptions, ...options };
    return this;
  }

  private resolveImageUrl(url?: string): string | null {
    if (!url || typeof url !== 'string' || url.trim().length === 0) return null;
    const clean = url.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const base = (this.headerOptions.siteUrl || 'https://nexusnation.in').replace(/\/+$/, '');
    return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
  }

  /**
   * Escape HTML utility
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Generates formatted TypeScript / generic code lines with syntax styling
   */
  private formatCodeSnippet(code: string): string {
    const lines = code.split('\n');
    return lines
      .map((line) => {
        let formatted = this.escapeHtml(line);
        // Replace comments
        if (formatted.includes('//')) {
          const parts = formatted.split('//');
          formatted = `${parts[0]}<span style="color:#71717a;">//${parts.slice(1).join('//')}</span>`;
        }
        // Highlight keywords
        formatted = formatted
          .replace(/\b(const|let|var|function|return|import|export|from|class|interface|type|async|await|if|else|switch|case|default|new|try|catch)\b/g, '<span style="color:#f0abfc;">$1</span>')
          .replace(/\b(string|number|boolean|any|void|Promise|Record|Array|null|undefined)\b/g, '<span style="color:#34d399;">$1</span>')
          .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, '<span style="color:#22d3ee;">$1</span>');

        return formatted.replace(/ /g, '&nbsp;');
      })
      .join('<br>');
  }

  /**
   * Compile Markdown representation
   */
  compileMarkdown(): string {
    const parts: string[] = [];

    if (this.introMarkdown) {
      parts.push(this.introMarkdown);
    }

    if (this.heroArticle) {
      parts.push(`## 🌟 Featured Article: [${this.heroArticle.title}](${this.heroArticle.url})`);
      if (this.heroArticle.excerpt) {
        parts.push(this.heroArticle.excerpt);
      }
      const meta = [
        this.heroArticle.category ? `**Category**: ${this.heroArticle.category}` : null,
        this.heroArticle.readingTime ? `**Read Time**: ${this.heroArticle.readingTime} min read` : null,
        this.heroArticle.difficulty ? `**Level**: ${this.heroArticle.difficulty}` : null,
      ]
        .filter(Boolean)
        .join(' • ');
      if (meta) parts.push(`*${meta}*`);
      parts.push(`👉 [Read the Article](${this.heroArticle.url})`);
    }

    if (this.secondaryArticles.length > 0) {
      parts.push(`## 📚 More from Nexus`);
      this.secondaryArticles.forEach((art, i) => {
        parts.push(`### 0${i + 1} / ${art.category || 'GUIDE'}: [${art.title}](${art.url})`);
        if (art.excerpt) parts.push(art.excerpt);
        if (art.readingTime) parts.push(`*${art.readingTime} MIN READ*`);
        parts.push(`👉 [Read more](${art.url})\n`);
      });
    }

    if (this.codeSnippet) {
      parts.push(`\`\`\`${this.codeSnippet.language || 'ts'}\n${this.codeSnippet.code}\n\`\`\``);
    }

    if (this.keyTakeaways.length > 0) {
      parts.push(`## 💡 Key Architectural Takeaways`);
      this.keyTakeaways.forEach((item) => {
        parts.push(`- ${item}`);
      });
    }

    if (this.callouts.length > 0) {
      this.callouts.forEach((c) => {
        parts.push(`> **${c.title || 'Note'}**:\n> ${c.content}`);
      });
    }

    if (this.customBodyMarkdown) {
      parts.push(this.customBodyMarkdown);
    }

    return parts.join('\n\n');
  }

  /**
   * Compiles the complete, cross-client compatible, sleek dark & light responsive HTML email
   */
  compileHtml(): string {
    const siteUrl = (this.headerOptions.siteUrl || 'https://nexusnation.in').replace(/\/+$/, '');
    const webVersionUrl = this.headerOptions.webVersionUrl || `${siteUrl}/articles`;
    const articlesUrl = `${siteUrl}/articles`;
    const tutorialsUrl = `${siteUrl}/series`;
    const toolsUrl = `${siteUrl}/search`;
    const subscribeUrl = `${siteUrl}/#newsletter`;
    const unsubscribeUrl = this.footerOptions.unsubscribeUrl || `${siteUrl}/newsletter/unsubscribe`;
    const preferencesUrl = this.footerOptions.preferencesUrl || `${siteUrl}/dashboard/settings`;
    const copyrightYear = this.footerOptions.copyrightYear || new Date().getFullYear();
    const postalAddress = this.footerOptions.companyPostalAddress || 'Nexus Engineering Dispatch • Bangalore, India';

    // 1. Hero Article Section
    let heroHtml = '';
    if (this.heroArticle) {
      const cover = this.resolveImageUrl(this.heroArticle.coverImage);
      const categoryTag = (this.heroArticle.category || 'SYSTEM DESIGN').toUpperCase();
      const readingTime = this.heroArticle.readingTime || 6;

      heroHtml = `
        <!-- Featured Article -->
        <tr>
          <td class="mobile-pad card-bg content-cell" style="padding:32px;background-color:#121215;border-bottom:1px solid #27272a;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span class="badge-tag" style="display:inline-block;padding:6px 12px;background-color:#06b6d4;color:#09090b;font-size:10px;font-family:Consolas,'Courier New',monospace;font-weight:bold;letter-spacing:1px;border-radius:3px;text-transform:uppercase;">
                    FEATURED ARTICLE
                  </span>
                </td>
                <td align="right" class="muted-text" style="font-size:12px;color:#a1a1aa;font-family:Consolas,monospace;">
                  &#9711; ${readingTime} min read
                </td>
              </tr>
            </table>

            ${
              cover
                ? `<div style="margin:20px 0 16px;">
                    <a href="${this.heroArticle.url}" target="_blank" style="text-decoration:none;display:block;">
                      <img src="${cover}" alt="${this.escapeHtml(this.heroArticle.title)}" width="576" style="width:100%;max-width:576px;height:auto;display:block;border-radius:6px;border:1px solid #27272a;" />
                    </a>
                  </div>`
                : ''
            }

            <h1 class="mobile-heading heading-text" style="font-size:28px;line-height:1.25;color:#f4f4f5;margin:20px 0 14px;letter-spacing:-0.5px;font-weight:800;">
              <a href="${this.heroArticle.url}" target="_blank" style="color:#f4f4f5;text-decoration:none;">
                ${this.heroArticle.title}
              </a>
            </h1>

            <p class="muted-text body-text" style="font-size:14px;line-height:1.8;color:#a1a1aa;margin:0 0 22px;">
              ${this.heroArticle.excerpt}
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td bgcolor="#06b6d4" style="border-radius:6px;">
                  <a href="${this.heroArticle.url}" target="_blank" style="display:inline-block;padding:13px 22px;color:#09090b;font-size:13px;font-weight:bold;text-decoration:none;letter-spacing:0.3px;">
                    Read the Article &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <p class="mono-meta" style="font:11px Consolas,monospace;color:#71717a;margin:22px 0 0;text-transform:uppercase;letter-spacing:0.5px;">
              ${categoryTag} ${this.heroArticle.difficulty ? ` / ${this.heroArticle.difficulty}` : ''} / ARCHITECTURE
            </p>
          </td>
        </tr>
      `;
    }

    // 2. Secondary Articles 3-Column Grid
    let secondaryHtml = '';
    if (this.secondaryArticles.length > 0) {
      const items = this.secondaryArticles.slice(0, 3);
      const cols = items
        .map((art, idx) => {
          const numStr = `0${idx + 1}`;
          const cat = (art.category || 'ENGINEERING').toUpperCase();
          const tagColor = idx === 0 ? '#22d3ee' : idx === 1 ? '#34d399' : '#f0abfc';
          const paddingStyle = idx === 0 ? 'padding-right:8px;' : idx === 1 ? 'padding:0 4px;' : 'padding-left:8px;';

          return `
            <td class="article-column" width="33.33%" valign="top" style="${paddingStyle}">
              <table role="presentation" width="100%" class="subcard-bg" style="background:#18181b;border:1px solid #27272a;border-radius:6px;height:100%;">
                <tr>
                  <td style="padding:16px;">
                    <span style="font:10px Consolas,monospace;color:${tagColor};font-weight:bold;letter-spacing:0.5px;">
                      ${numStr} / ${cat}
                    </span>
                    <h3 class="heading-text" style="font-size:14px;line-height:1.4;color:#f4f4f5;margin:10px 0;font-weight:700;">
                      <a href="${art.url}" target="_blank" style="color:#f4f4f5;text-decoration:none;">
                        ${art.title}
                      </a>
                    </h3>
                    ${
                      art.excerpt
                        ? `<p class="muted-text" style="font-size:12px;line-height:1.6;color:#a1a1aa;margin:0 0 12px;">
                            ${art.excerpt.slice(0, 95)}${art.excerpt.length > 95 ? '...' : ''}
                          </p>`
                        : ''
                    }
                    <a href="${art.url}" target="_blank" style="font-size:12px;color:#22d3ee;font-weight:600;text-decoration:none;">
                      Read more &rarr;
                    </a>
                    <p class="mono-meta" style="font:10px Consolas,monospace;color:#71717a;margin:12px 0 0;">
                      ${art.readingTime || 5} MIN READ
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          `;
        })
        .join('');

      secondaryHtml = `
        <!-- More articles from Nexus -->
        <tr>
          <td class="mobile-pad card-bg content-cell" style="padding:32px;background-color:#121215;border-bottom:1px solid #27272a;">
            <table role="presentation" width="100%" style="margin-bottom:20px;">
              <tr>
                <td>
                  <h2 class="heading-text" style="font-size:20px;color:#f4f4f5;margin:0;font-weight:800;">
                    More from Nexus
                  </h2>
                </td>
                <td align="right" valign="middle">
                  <a href="${articlesUrl}" target="_blank" style="font-size:12px;color:#22d3ee;text-decoration:none;font-weight:600;">
                    View all &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${cols}
              </tr>
            </table>
          </td>
        </tr>
      `;
    }

    // 3. Code Example Snippet Block
    let codeHtml = '';
    if (this.codeSnippet && this.codeSnippet.code) {
      const formattedSnippet = this.formatCodeSnippet(this.codeSnippet.code);
      codeHtml = `
        <!-- Syntax-highlighted code block -->
        <tr>
          <td class="mobile-pad card-bg content-cell" style="padding:0 32px 32px;background-color:#121215;border-bottom:1px solid #27272a;">
            <table role="presentation" width="100%" class="subcard-bg" style="background:#18181b;border:1px solid #27272a;border-radius:6px;overflow:hidden;">
              <tr>
                <td style="padding:14px 18px;border-bottom:1px solid #27272a;">
                  <span class="heading-text" style="font-size:13px;font-weight:bold;color:#f4f4f5;">
                    <span style="color:#22d3ee;">&lt;/&gt;</span>
                    &nbsp; ${this.codeSnippet.title || 'Code Example'}
                  </span>
                </td>
                <td align="right" style="padding:14px 18px;border-bottom:1px solid #27272a;font:11px Consolas,monospace;color:#a1a1aa;">
                  ${this.codeSnippet.language || 'TypeScript'}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:18px;">
                  <div class="code code-box" style="background-color:#18181b;color:#d4d4d8;font-family:Consolas,'Courier New',monospace;font-size:12px;line-height:1.9;overflow-wrap:anywhere;">
                    ${formattedSnippet}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }

    // 4. Key Takeaways HTML
    let takeawaysHtml = '';
    if (this.keyTakeaways.length > 0) {
      const bullets = this.keyTakeaways
        .map(
          (t) => `
          <li style="margin-bottom:8px;color:#d4d4d8;line-height:1.6;font-size:13px;">
            ${t}
          </li>
        `,
        )
        .join('');

      takeawaysHtml = `
        <!-- Key Takeaways Box -->
        <tr>
          <td class="mobile-pad card-bg content-cell" style="padding:0 32px 32px;background-color:#121215;border-bottom:1px solid #27272a;">
            <table role="presentation" width="100%" class="subcard-bg" style="background-color:#18181b;border:1px solid #27272a;border-left:4px solid #10b981;border-radius:6px;padding:18px 20px;">
              <tr>
                <td>
                  <div style="font-size:12px;font-family:Consolas,monospace;font-weight:bold;color:#34d399;text-transform:uppercase;margin-bottom:10px;letter-spacing:0.5px;">
                    💡 Architectural Takeaways
                  </div>
                  <ul style="margin:0;padding-left:18px;">
                    ${bullets}
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }

    // 5. Custom Intro or Body if present
    let introSectionHtml = '';
    if (this.introHtml) {
      introSectionHtml = `
        <tr>
          <td class="mobile-pad card-bg content-cell" style="padding:24px 32px;background-color:#121215;border-bottom:1px solid #27272a;">
            <div class="muted-text body-text" style="color:#d4d4d8;font-size:14px;line-height:1.7;">
              ${this.introHtml}
            </div>
          </td>
        </tr>
      `;
    }

    let customBodySectionHtml = '';
    if (this.customBodyHtml) {
      customBodySectionHtml = `
        <tr>
          <td class="mobile-pad card-bg content-cell" style="padding:24px 32px;background-color:#121215;border-bottom:1px solid #27272a;">
            <div class="muted-text body-text" style="color:#d4d4d8;font-size:14px;line-height:1.7;">
              ${this.customBodyHtml}
            </div>
          </td>
        </tr>
      `;
    }

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${this.subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    img {
      border: 0;
      display: block;
      max-width: 100%;
    }
    a { text-decoration: none; }
    .wrapper {
      width: 100%;
      background-color: #09090b;
    }
    .container {
      width: 100%;
      max-width: 640px;
      background-color: #121215;
    }
    .muted-text { color: #a1a1aa; }
    .heading-text { color: #f4f4f5; }
    .border { border: 1px solid #27272a; }
    .mobile-pad { padding: 32px; }
    .article-column { width: 33.33%; }
    .code {
      background-color: #18181b;
      color: #d4d4d8;
      font-family: Consolas, "Courier New", monospace;
      font-size: 12px;
      line-height: 1.8;
      overflow-wrap: anywhere;
    }

    /* Light mode overrides for clients with prefers-color-scheme support */
    @media (prefers-color-scheme: light) {
      .wrapper { background-color: #f4f4f5 !important; }
      .container { background-color: #ffffff !important; border-color: #e4e4e7 !important; }
      .top-bar { background-color: #f4f4f5 !important; border-bottom-color: #e4e4e7 !important; }
      .card-bg { background-color: #ffffff !important; border-color: #e4e4e7 !important; }
      .subcard-bg { background-color: #f8fafc !important; border-color: #e2e8f0 !important; }
      .code-box { background-color: #f8fafc !important; color: #18181b !important; }
      .heading-text { color: #09090b !important; }
      .muted-text { color: #52525b !important; }
      .mono-meta { color: #71717a !important; }
      .footer-bg { background-color: #f4f4f5 !important; border-top-color: #e4e4e7 !important; }
    }

    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .mobile-pad { padding: 20px !important; }
      .mobile-heading { font-size: 24px !important; }
      .article-column {
        display: block !important;
        width: 100% !important;
        padding: 0 0 14px !important;
      }
      .mobile-full {
        width: 100% !important;
        display: block !important;
      }
      .mobile-center { text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#09090b;">

  <!-- Preheader: hidden in the email body, shown in inbox previews -->
  <div style="display:none;font-size:1px;color:#09090b;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${this.previewText} &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="wrapper" style="background-color:#09090b;">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" class="container" style="width:100%;max-width:640px;background-color:#121215;border:1px solid #27272a;border-radius:8px;overflow:hidden;">

          <!-- Browser top bar -->
          <tr>
            <td class="top-bar" style="padding:12px 24px;background-color:#18181b;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="font:12px Consolas,monospace;color:#a1a1aa;">
                    ${this.headerOptions.editionTag || 'Tech. Systems. Engineering.'}
                  </td>
                  <td align="right">
                    <a href="${webVersionUrl}" target="_blank" style="font-size:12px;font-weight:bold;color:#22d3ee;text-decoration:none;">
                      View in browser &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Brand header -->
          <tr>
            <td class="mobile-pad card-bg" style="padding:24px 32px;background-color:#121215;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%">
                <tr>
                  <td valign="middle">
                    <a href="${siteUrl}" target="_blank" style="font-size:24px;font-weight:800;letter-spacing:4px;color:#f4f4f5;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
                      <span style="color:#22d3ee;">N</span>EXUS
                    </a>
                    <div class="muted-text" style="font-size:11px;color:#a1a1aa;margin-top:6px;">
                      ${this.headerOptions.tagline || 'Engineering knowledge for a better internet.'}
                    </div>
                  </td>
                  <td align="right" valign="middle" style="font-size:12px;line-height:2.1;">
                    <a href="${articlesUrl}" target="_blank" style="color:#d4d4d8;text-decoration:none;">
                      Articles
                    </a><br>
                    <a href="${tutorialsUrl}" target="_blank" style="color:#d4d4d8;text-decoration:none;">
                      Tutorials
                    </a><br>
                    <a href="${toolsUrl}" target="_blank" style="color:#d4d4d8;text-decoration:none;">
                      Developer Tools
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Optional Intro -->
          ${introSectionHtml}

          <!-- Featured Article Hero -->
          ${heroHtml}

          <!-- More from Nexus Grid -->
          ${secondaryHtml}

          <!-- Syntax-highlighted code block -->
          ${codeHtml}

          <!-- Key Takeaways -->
          ${takeawaysHtml}

          <!-- Custom Body Section -->
          ${customBodySectionHtml}

          <!-- Newsletter subscription / Callout card -->
          <tr>
            <td class="mobile-pad card-bg" style="padding:0 32px 32px;background-color:#121215;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%" class="subcard-bg" style="background-color:#18181b;border:1px solid #27272a;border-radius:6px;">
                <tr>
                  <td style="padding:24px;">
                    <h2 class="heading-text" style="font-size:20px;color:#f4f4f5;margin:0 0 10px;font-weight:800;">
                      Stay Updated with Nexus
                    </h2>
                    <p class="muted-text" style="font-size:13px;line-height:1.8;color:#a1a1aa;margin:0 0 20px;">
                      Get engineering articles, practical tutorials, and developer insights delivered directly to your inbox.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td bgcolor="#06b6d4" style="border-radius:5px;">
                          <a href="${subscribeUrl}" target="_blank" style="display:inline-block;padding:12px 20px;font-size:13px;font-weight:bold;color:#09090b;text-decoration:none;">
                            Explore More Articles &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p class="mono-meta" style="font-size:11px;color:#71717a;margin:14px 0 0;font-family:Consolas,monospace;">
                      Join developers learning to build better systems.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="mobile-pad footer-bg" style="padding:24px 32px;background-color:#09090b;border-top:1px solid #27272a;">
              <p style="font-size:18px;font-weight:bold;letter-spacing:3px;color:#f4f4f5;margin:0 0 10px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
                <span style="color:#22d3ee;">N</span>EXUS
              </p>
              <p class="muted-text" style="font-size:12px;line-height:1.8;color:#a1a1aa;margin:0 0 16px;">
                Engineering knowledge for a better internet.
              </p>
              <p class="mono-meta" style="font-size:11px;line-height:1.8;color:#71717a;margin:0 0 14px;font-family:Consolas,monospace;">
                You are receiving this email because you subscribed to the Nexus newsletter.
              </p>
              <p style="font-size:11px;line-height:2;margin:0;font-family:Consolas,monospace;">
                <a href="${unsubscribeUrl}" target="_blank" style="color:#22d3ee;text-decoration:none;">
                  Unsubscribe
                </a>
                &nbsp;|&nbsp;
                <a href="${preferencesUrl}" target="_blank" style="color:#22d3ee;text-decoration:none;">
                  Update preferences
                </a>
              </p>
              <p class="mono-meta" style="font-size:11px;line-height:1.8;color:#71717a;margin:14px 0 0;font-family:Consolas,monospace;">
                &copy; ${copyrightYear} ${this.footerOptions.companyName || 'Nexus'}. All rights reserved.<br>
                ${postalAddress}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}

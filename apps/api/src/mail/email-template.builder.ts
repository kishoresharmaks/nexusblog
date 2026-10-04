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
}

export interface EmailFooterOptions {
  siteUrl?: string;
  unsubscribeUrl?: string;
  copyrightYear?: number;
  companyName?: string;
}

/**
 * Modular Builder Pattern for producing pixel-perfect, responsive dark-mode emails
 * that are 100% compliant across Apple Mail, Gmail (Web/iOS/Android), and Outlook.
 */
export class EmailTemplateBuilder {
  private subject = 'NexusBlog Engineering Dispatch';
  private previewText = '';
  private headerOptions: EmailHeaderOptions = {
    siteUrl: 'https://nexusnation.in',
    siteName: 'NexusBlog',
    editionTag: 'Engineering Dispatch',
  };
  private introHtml = '';
  private introMarkdown = '';
  private heroArticle?: HeroArticlePayload;
  private secondaryArticles: SecondaryArticlePayload[] = [];
  private keyTakeaways: string[] = [];
  private callouts: CalloutPayload[] = [];
  private customBodyHtml = '';
  private customBodyMarkdown = '';
  private footerOptions: EmailFooterOptions = {
    siteUrl: 'https://nexusnation.in',
    companyName: 'NexusNation Engineering',
    copyrightYear: new Date().getFullYear(),
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

  /**
   * Helper to format fallback absolute URLs for cover images
   */
  private resolveImageUrl(url?: string): string | null {
    if (!url || typeof url !== 'string' || url.trim().length === 0) return null;
    const clean = url.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const base = (this.headerOptions.siteUrl || 'https://nexusnation.in').replace(/\/+$/, '');
    return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`;
  }

  /**
   * Generate canonical Markdown representation of this newsletter
   */
  compileMarkdown(): string {
    const parts: string[] = [];

    if (this.introMarkdown) {
      parts.push(this.introMarkdown);
    }

    if (this.heroArticle) {
      parts.push(`## 🌟 Featured Blueprint: [${this.heroArticle.title}](${this.heroArticle.url})`);
      if (this.heroArticle.excerpt) {
        parts.push(this.heroArticle.excerpt);
      }
      const meta = [
        this.heroArticle.category ? `**Category**: ${this.heroArticle.category}` : null,
        this.heroArticle.readingTime ? `**Reading Time**: ${this.heroArticle.readingTime} min read` : null,
        this.heroArticle.difficulty ? `**Difficulty**: ${this.heroArticle.difficulty}` : null,
      ].filter(Boolean).join(' • ');
      if (meta) parts.push(`*${meta}*`);
      parts.push(`👉 [Read Full Blueprint](${this.heroArticle.url})`);
    }

    if (this.secondaryArticles.length > 0) {
      parts.push(`## 📚 Deep-Dives & Technical Guides`);
      this.secondaryArticles.forEach((art, i) => {
        parts.push(`### ${i + 1}. [${art.title}](${art.url})`);
        if (art.excerpt) parts.push(art.excerpt);
        const meta = [
          art.category ? `Category: ${art.category}` : null,
          art.readingTime ? `${art.readingTime} min read` : null,
        ].filter(Boolean).join(' • ');
        if (meta) parts.push(`*${meta}*`);
        parts.push(`👉 [Read Article](${art.url})\n`);
      });
    }

    if (this.keyTakeaways.length > 0) {
      parts.push(`## 💡 Key Architectural Takeaways`);
      this.keyTakeaways.forEach((item) => {
        parts.push(`- ${item}`);
      });
    }

    if (this.callouts.length > 0) {
      this.callouts.forEach((c) => {
        parts.push(`> **${c.title || 'Engineering Note'}**:\n> ${c.content}`);
      });
    }

    if (this.customBodyMarkdown) {
      parts.push(this.customBodyMarkdown);
    }

    return parts.join('\n\n');
  }

  /**
   * Compiles the complete, cross-client compatible, sleek dark-themed HTML document
   */
  compileHtml(): string {
    const formattedDate =
      this.headerOptions.dateText ||
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    const siteUrl = this.headerOptions.siteUrl || 'https://nexusnation.in';
    const siteName = this.headerOptions.siteName || 'NexusBlog';
    const editionTag = this.headerOptions.editionTag || 'Engineering Dispatch';
    const unsubscribeUrl = this.footerOptions.unsubscribeUrl || `${siteUrl}/newsletter/unsubscribe`;
    const copyrightYear = this.footerOptions.copyrightYear || new Date().getFullYear();
    const companyName = this.footerOptions.companyName || 'NexusNation Engineering';

    // 1. Hero Article HTML
    let heroHtml = '';
    if (this.heroArticle) {
      const heroCover = this.resolveImageUrl(this.heroArticle.coverImage);
      heroHtml = `
        <!-- Hero Article Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;background:linear-gradient(180deg, #131d33 0%, #0f172a 100%);border:1px solid #1e293b;border-radius:14px;overflow:hidden;">
          ${
            heroCover
              ? `<tr>
                  <td style="padding:0;">
                    <a href="${this.heroArticle.url}" target="_blank" style="text-decoration:none;display:block;">
                      <img src="${heroCover}" alt="${this.heroArticle.title}" width="536" style="width:100%;max-width:536px;height:auto;display:block;border-bottom:1px solid #1e293b;" />
                    </a>
                  </td>
                </tr>`
              : ''
          }
          <tr>
            <td style="padding:22px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td>
                    ${
                      this.heroArticle.category
                        ? `<span style="background-color:rgba(14,165,233,0.15);color:#38bdf8;border:1px solid rgba(14,165,233,0.3);font-size:10px;font-family:monospace;font-weight:700;padding:3px 8px;border-radius:6px;text-transform:uppercase;letter-spacing:0.5px;display:inline-block;margin-right:8px;">${this.heroArticle.category}</span>`
                        : ''
                    }
                    ${
                      this.heroArticle.difficulty
                        ? `<span style="background-color:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);font-size:10px;font-family:monospace;font-weight:700;padding:3px 8px;border-radius:6px;text-transform:uppercase;display:inline-block;margin-right:8px;">${this.heroArticle.difficulty}</span>`
                        : ''
                    }
                    ${
                      this.heroArticle.readingTime
                        ? `<span style="color:#64748b;font-size:11px;font-family:monospace;font-weight:500;">${this.heroArticle.readingTime} min read</span>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <h2 style="margin:0 0 10px 0;font-size:19px;font-weight:800;line-height:1.4;color:#f8fafc;">
                <a href="${this.heroArticle.url}" target="_blank" style="color:#f8fafc;text-decoration:none;">
                  ${this.heroArticle.title}
                </a>
              </h2>

              <p style="margin:0 0 18px 0;font-size:13px;line-height:1.6;color:#94a3b8;">
                ${this.heroArticle.excerpt}
              </p>

              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);border-radius:8px;">
                    <a href="${this.heroArticle.url}" target="_blank" style="display:inline-block;padding:9px 18px;font-size:12px;font-family:monospace;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                      Read Full Blueprint &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    // 2. Secondary Articles Grid / List HTML
    let secondaryHtml = '';
    if (this.secondaryArticles.length > 0) {
      const itemsHtml = this.secondaryArticles
        .map((art) => {
          const cover = this.resolveImageUrl(art.coverImage);
          return `
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #1e293b;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    ${
                      cover
                        ? `<td width="100" valign="top" style="padding-right:16px;">
                            <a href="${art.url}" target="_blank" style="text-decoration:none;">
                              <img src="${cover}" alt="${art.title}" width="100" height="66" style="width:100px;height:66px;object-fit:cover;border-radius:8px;border:1px solid #334155;display:block;" />
                            </a>
                          </td>`
                        : ''
                    }
                    <td valign="top">
                      <div style="margin-bottom:4px;">
                        ${
                          art.category
                            ? `<span style="background-color:rgba(139,92,246,0.15);color:#a78bfa;font-size:9px;font-family:monospace;font-weight:700;padding:2px 6px;border-radius:4px;text-transform:uppercase;margin-right:6px;display:inline-block;">${art.category}</span>`
                            : ''
                        }
                        ${
                          art.readingTime
                            ? `<span style="color:#64748b;font-size:10px;font-family:monospace;">${art.readingTime} min</span>`
                            : ''
                        }
                      </div>
                      <h3 style="margin:0 0 6px 0;font-size:15px;font-weight:700;line-height:1.4;color:#f1f5f9;">
                        <a href="${art.url}" target="_blank" style="color:#f1f5f9;text-decoration:none;">
                          ${art.title}
                        </a>
                      </h3>
                      ${
                        art.excerpt
                          ? `<p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#94a3b8;">${art.excerpt.slice(0, 110)}${art.excerpt.length > 110 ? '...' : ''}</p>`
                          : ''
                      }
                      <a href="${art.url}" target="_blank" style="font-size:11px;font-family:monospace;color:#38bdf8;text-decoration:none;font-weight:600;">
                        Read Guide &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `;
        })
        .join('');

      secondaryHtml = `
        <!-- Secondary Articles List -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr>
            <td style="padding-bottom:8px;border-bottom:2px solid #1e293b;">
              <span style="font-size:13px;font-family:monospace;font-weight:800;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;">
                Deep-Dives &amp; Architecture Guides
              </span>
            </td>
          </tr>
          ${itemsHtml}
        </table>
      `;
    }

    // 3. Key Takeaways HTML
    let takeawaysHtml = '';
    if (this.keyTakeaways.length > 0) {
      const bullets = this.keyTakeaways
        .map(
          (t) => `
          <li style="margin-bottom:8px;color:#cbd5e1;line-height:1.5;font-size:13px;">
            ${t}
          </li>
        `,
        )
        .join('');

      takeawaysHtml = `
        <!-- Key Takeaways Box -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;background-color:#0b1324;border:1px solid #1e293b;border-left:4px solid #10b981;border-radius:10px;padding:18px 20px;">
          <tr>
            <td>
              <div style="font-size:13px;font-family:monospace;font-weight:800;color:#34d399;text-transform:uppercase;margin-bottom:10px;letter-spacing:0.5px;">
                💡 Architecture Takeaways
              </div>
              <ul style="margin:0;padding-left:18px;">
                ${bullets}
              </ul>
            </td>
          </tr>
        </table>
      `;
    }

    // 4. Callout boxes HTML
    let calloutsHtml = '';
    if (this.callouts.length > 0) {
      calloutsHtml = this.callouts
        .map((c) => {
          const borderColor = c.type === 'warning' ? '#f59e0b' : c.type === 'tip' ? '#10b981' : '#0ea5e9';
          const titleColor = c.type === 'warning' ? '#fbbf24' : c.type === 'tip' ? '#34d399' : '#38bdf8';
          return `
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;background-color:#0b1324;border:1px solid #1e293b;border-left:4px solid ${borderColor};border-radius:8px;padding:14px 18px;">
              <tr>
                <td>
                  ${c.title ? `<div style="font-size:12px;font-family:monospace;font-weight:700;color:${titleColor};text-transform:uppercase;margin-bottom:6px;">${c.title}</div>` : ''}
                  <div style="font-size:13px;color:#cbd5e1;line-height:1.6;">${c.content}</div>
                </td>
              </tr>
            </table>
          `;
        })
        .join('');
    }

    // Assemble master HTML Document
    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    @media only screen and (max-width: 620px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .content-cell { padding: 20px 16px !important; }
      .header-cell { padding: 20px 16px !important; }
      .footer-cell { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#e2e8f0;">

  <!-- Preheader preview text for mail clients -->
  ${
    this.previewText
      ? `<div style="display:none;font-size:1px;color:#090d16;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${this.previewText} &#847; &zwnj; &nbsp; &#8199; &shy;</div>`
      : ''
  }

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090d16;padding:32px 12px;">
    <tr>
      <td align="center">
        
        <!-- Master Newsletter Container (600px max-width) -->
        <table class="container-table" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px -15px rgba(0,0,0,0.7);">
          
          <!-- Header Bar -->
          <tr>
            <td class="header-cell" style="padding:24px 32px;background:linear-gradient(135deg, #090d16 0%, #0f172a 100%);border-bottom:1px solid #1e293b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <a href="${siteUrl}" target="_blank" style="text-decoration:none;display:inline-flex;align-items:center;">
                      <span style="font-size:20px;font-weight:900;color:#f8fafc;letter-spacing:-0.5px;font-family:monospace;">
                        Nexus<span style="color:#0ea5e9;">Blog</span>
                      </span>
                      <span style="background-color:rgba(14,165,233,0.15);color:#38bdf8;border:1px solid rgba(14,165,233,0.3);font-size:10px;font-family:monospace;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:10px;text-transform:uppercase;letter-spacing:0.5px;">
                        ${editionTag}
                      </span>
                    </a>
                  </td>
                  <td align="right" style="font-size:11px;color:#64748b;font-family:monospace;">
                    ${formattedDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Content Area -->
          <tr>
            <td class="content-cell" style="padding:32px;background-color:#0f172a;">
              
              <!-- Subject Heading -->
              <h1 style="color:#f8fafc;font-size:22px;font-weight:800;margin:0 0 16px 0;line-height:1.35;letter-spacing:-0.3px;">
                ${this.subject}
              </h1>

              <!-- Optional Intro / Editorial Note -->
              ${
                this.introHtml
                  ? `<div style="color:#cbd5e1;font-size:14px;line-height:1.7;margin-bottom:24px;">
                      ${this.introHtml}
                    </div>`
                  : ''
              }

              <!-- Hero Featured Article -->
              ${heroHtml}

              <!-- Secondary Articles -->
              ${secondaryHtml}

              <!-- Key Takeaways -->
              ${takeawaysHtml}

              <!-- Callout Notes -->
              ${calloutsHtml}

              <!-- Custom Body if present -->
              ${
                this.customBodyHtml
                  ? `<div style="color:#cbd5e1;font-size:14px;line-height:1.7;margin-top:16px;">
                      ${this.customBodyHtml}
                    </div>`
                  : ''
              }

            </td>
          </tr>

          <!-- Canonical Navigation Links -->
          <tr>
            <td style="padding:16px 32px;background-color:#0b1324;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="font-size:11px;font-family:monospace;">
                    <a href="${siteUrl}/articles" target="_blank" style="color:#38bdf8;text-decoration:none;margin:0 8px;font-weight:600;">Browse Articles</a>
                    <span style="color:#334155;">&bull;</span>
                    <a href="${siteUrl}/category/system-design" target="_blank" style="color:#38bdf8;text-decoration:none;margin:0 8px;font-weight:600;">System Design</a>
                    <span style="color:#334155;">&bull;</span>
                    <a href="${siteUrl}/guest-post/submit" target="_blank" style="color:#38bdf8;text-decoration:none;margin:0 8px;font-weight:600;">Write For Us</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CAN-SPAM Compliant Footer -->
          <tr>
            <td class="footer-cell" style="padding:28px 32px;background-color:#090d16;text-align:center;">
              <p style="margin:0 0 10px 0;font-size:12px;line-height:1.6;color:#64748b;">
                You received this dispatch because you subscribed to the <strong>NexusBlog Engineering Newsletter</strong>.
              </p>
              <p style="margin:0 0 12px 0;font-size:11px;color:#475569;font-family:monospace;">
                ${companyName} &copy; ${copyrightYear} &bull; Scalable Systems &bull; High-Performance Architecture
              </p>
              <p style="margin:0;font-size:11px;font-family:monospace;">
                <a href="${siteUrl}" target="_blank" style="color:#38bdf8;text-decoration:none;margin-right:12px;">Visit Website</a>
                <a href="${unsubscribeUrl}" target="_blank" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
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

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SendMailOptions {
  to: string | { email: string; name?: string }[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  previewText?: string;
  replyTo?: { email: string; name?: string };
}

export interface BroadcastResult {
  success: boolean;
  provider: 'brevo' | 'simulated';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  message: string;
  details?: any;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to retrieve active configuration values from DB or env
   */
  async getConfig() {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'brevoApiKey',
            'brevoSenderEmail',
            'brevoSenderName',
            'mailProvider',
            'siteUrl',
          ],
        },
      },
    });

    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    return {
      brevoApiKey: configMap['brevoApiKey'] || process.env.BREVO_API_KEY || '',
      brevoSenderEmail:
        configMap['brevoSenderEmail'] ||
        process.env.BREVO_SENDER_EMAIL ||
        'newsletter@nexusblog.dev',
      brevoSenderName:
        configMap['brevoSenderName'] ||
        process.env.BREVO_SENDER_NAME ||
        'NexusBlog Engineering Dispatch',
      mailProvider: configMap['mailProvider'] || 'brevo',
      siteUrl: configMap['siteUrl'] || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    };
  }

  /**
   * Verify Brevo API key against Brevo Account endpoint
   */
  async verifyBrevoAccount(customApiKey?: string) {
    const config = await this.getConfig();
    const apiKey = (customApiKey && customApiKey.trim().length > 0) ? customApiKey.trim() : config.brevoApiKey;

    if (!apiKey || apiKey.includes('...') || apiKey === '********') {
      return {
        valid: false,
        message: 'Brevo API Key is not configured. Please paste your valid API Key starting with xkeysib-',
      };
    }

    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          accept: 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let humanMessage = errorData?.message || `Brevo authentication failed (Status: ${res.status})`;

        if (res.status === 401 || humanMessage.toLowerCase().includes('key not found') || humanMessage.toLowerCase().includes('unauthorized')) {
          humanMessage = 'Invalid Brevo API Key ("Key not found"). Please generate a new v3 API Key in your Brevo Dashboard (SMTP & API → API Keys).';
        } else if (res.status === 403) {
          humanMessage = 'Brevo API Access Forbidden (403): Account suspended or IP restricted.';
        }

        return {
          valid: false,
          statusCode: res.status,
          message: humanMessage,
        };
      }

      const accountData = await res.json();
      return {
        valid: true,
        email: accountData?.email,
        companyName: accountData?.companyName,
        plan: Array.isArray(accountData?.plan) ? accountData.plan.map((p: any) => p.type).join(', ') : accountData?.plan?.type || 'Free',
        credits: accountData?.plan?.[0]?.credits ?? accountData?.credits ?? '300/day',
        message: `Brevo API connection active & verified (${accountData?.email || accountData?.companyName || 'Authenticated'})`,
      };
    } catch (err: any) {
      return {
        valid: false,
        message: err.message || 'Failed to connect to Brevo API endpoint',
      };
    }
  }

  /**
   * Send a single transactional or test email via Brevo REST API v3
   */
  async sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const config = await this.getConfig();

    // Prepare recipients
    const toList: { email: string; name?: string }[] = Array.isArray(options.to)
      ? options.to
      : [{ email: options.to }];

    const html = options.htmlContent || this.markdownToEmailHtml(options.textContent || '', options.subject, options.previewText);

    // If Brevo API key is not configured, simulate delivery in development
    if (!config.brevoApiKey) {
      this.logger.warn(`[MailService] Brevo API Key not configured. Simulated email to ${toList.map((t) => t.email).join(', ')}`);
      return {
        success: true,
        messageId: `simulated-${Date.now()}`,
        error: 'Simulated dispatch (Brevo API key not set in Dev Config)',
      };
    }

    try {
      const payload: any = {
        sender: {
          name: config.brevoSenderName,
          email: config.brevoSenderEmail,
        },
        to: toList,
        subject: options.subject,
        htmlContent: html,
      };

      if (options.textContent) {
        payload.textContent = options.textContent;
      }

      if (options.replyTo) {
        payload.replyTo = options.replyTo;
      }

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': config.brevoApiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data?.message || `Brevo HTTP Error ${res.status}`;
        this.logger.error(`[MailService] Brevo Send Error: ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
        };
      }

      return {
        success: true,
        messageId: data?.messageId || data?.messageIds?.[0],
      };
    } catch (err: any) {
      this.logger.error(`[MailService] Dispatch network error: ${err.message}`);
      return {
        success: false,
        error: err.message || 'Network dispatch failure',
      };
    }
  }

  /**
   * Broadcast a newsletter dispatch to all active subscriber emails
   */
  async sendBroadcast(params: {
    subject: string;
    content: string;
    previewText?: string;
    recipients: string[];
  }): Promise<BroadcastResult> {
    const config = await this.getConfig();
    const { subject, content, previewText, recipients } = params;

    if (!recipients || recipients.length === 0) {
      return {
        success: true,
        provider: config.brevoApiKey ? 'brevo' : 'simulated',
        totalRecipients: 0,
        sentCount: 0,
        failedCount: 0,
        message: 'No active subscribers to receive broadcast.',
      };
    }

    const htmlBody = this.markdownToEmailHtml(content, subject, previewText);

    // If Brevo API key is not configured, simulate
    if (!config.brevoApiKey) {
      return {
        success: true,
        provider: 'simulated',
        totalRecipients: recipients.length,
        sentCount: recipients.length,
        failedCount: 0,
        message: `Simulated broadcast dispatched to ${recipients.length} subscribers. (Configure Brevo API Key in Dev Config for live sending)`,
      };
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send in chunks of 10 to respect rate limits and ensure high delivery
    const chunkSize = 10;
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (email) => {
          const result = await this.sendEmail({
            to: email,
            subject,
            htmlContent: htmlBody,
            textContent: content,
            previewText,
          });

          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
            if (result.error && !errors.includes(result.error)) {
              errors.push(result.error);
            }
          }
        }),
      );
    }

    const success = sentCount > 0;
    const message = failedCount === 0
      ? `Successfully dispatched to all ${sentCount} active subscribers via Brevo.`
      : `Dispatched to ${sentCount} subscribers with ${failedCount} failures.${errors.length ? ` (${errors[0]})` : ''}`;

    return {
      success,
      provider: 'brevo',
      totalRecipients: recipients.length,
      sentCount,
      failedCount,
      message,
      details: { errors },
    };
  }

  /**
   * Send a test email to verify credentials
   */
  async sendTestEmail(recipientEmail: string) {
    const config = await this.getConfig();
    const subject = `[Test Dispatch] NexusBlog Brevo Configuration Verification`;
    const previewText = `Verification test sent on ${new Date().toLocaleTimeString()}`;

    const testMarkdown = `## Brevo Email Integration Test\n\nThis is a verification email from your **NexusBlog Developer Configuration** panel.\n\n- **Sender Name**: ${config.brevoSenderName}\n- **Sender Email**: ${config.brevoSenderEmail}\n- **Timestamp**: ${new Date().toISOString()}\n- **Mail Provider**: Brevo API v3\n\nIf you received this message, your Brevo API key, verified sender, and transactional email pipeline are **100% operational**!`;

    const result = await this.sendEmail({
      to: recipientEmail,
      subject,
      previewText,
      textContent: testMarkdown,
      htmlContent: this.markdownToEmailHtml(testMarkdown, subject, previewText),
    });

    return result;
  }

  /**
   * Convert Markdown to high-quality, email-client compliant responsive HTML
   */
  markdownToEmailHtml(markdown: string, subject: string, previewText?: string): string {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Simple robust markdown parser for technical email rendering
    let htmlContent = markdown
      // Escape basic HTML entities to avoid broken tags
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 style="color:#0ea5e9;font-size:16px;margin:20px 0 8px;font-weight:700;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#f8fafc;font-size:20px;margin:24px 0 10px;font-weight:700;border-bottom:1px solid #334155;padding-bottom:6px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color:#f8fafc;font-size:24px;margin:24px 0 12px;font-weight:800;">$1</h1>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gm, '<pre style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:14px;color:#38bdf8;font-family:monospace;font-size:12px;overflow-x:auto;margin:16px 0;"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background:#1e293b;border:1px solid #334155;padding:2px 6px;border-radius:4px;color:#38bdf8;font-family:monospace;font-size:12px;">$1</code>')
      // Bold & Italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#f8fafc;font-weight:700;">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em style="color:#cbd5e1;">$1</em>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote style="border-left:3px solid #0ea5e9;padding-left:12px;margin:16px 0;color:#94a3b8;font-style:italic;">$1</blockquote>')
      // Bullet lists
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin:6px 0;color:#cbd5e1;">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0ea5e9;text-decoration:underline;font-weight:600;" target="_blank">$1</a>')
      // Paragraphs & line breaks
      .replace(/\n\n/g, '</p><p style="margin:14px 0;line-height:1.7;color:#cbd5e1;font-size:14px;">')
      .replace(/\n/g, '<br />');

    // Wrap list items in <ul>
    htmlContent = htmlContent.replace(/(<li.*<\/li>)/gms, '<ul style="padding-left:20px;margin:14px 0;">$1</ul>');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <!-- Preheader text -->
  ${previewText ? `<div style="display:none;font-size:1px;color:#090d16;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090d16;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);border-bottom:1px solid #1e293b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:900;color:#f8fafc;letter-spacing:-0.5px;font-family:monospace;">
                      Nexus<span style="color:#0ea5e9;">Blog</span>
                    </span>
                    <span style="background-color:rgba(14,165,233,0.15);color:#38bdf8;border:1px solid rgba(14,165,233,0.3);font-size:10px;font-family:monospace;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:8px;text-transform:uppercase;">
                      Engineering Dispatch
                    </span>
                  </td>
                  <td align="right" style="font-size:11px;color:#64748b;font-family:monospace;">
                    ${formattedDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Body Content -->
          <tr>
            <td style="padding:32px;background-color:#0f172a;">
              <h1 style="color:#f8fafc;font-size:22px;font-weight:800;margin:0 0 16px 0;line-height:1.3;">
                ${subject}
              </h1>
              
              <div style="color:#cbd5e1;font-size:14px;line-height:1.7;">
                <p style="margin:0 0 14px 0;line-height:1.7;color:#cbd5e1;font-size:14px;">
                  ${htmlContent}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#090d16;border-top:1px solid #1e293b;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#64748b;">
                You received this email because you subscribed to the NexusBlog Engineering Dispatch.
              </p>
              <p style="margin:0;font-size:11px;color:#475569;font-family:monospace;">
                NexusBlog &copy; ${new Date().getFullYear()} &bull; High-scale Technical Publishing &bull; 
                <a href="https://nexusblog.dev" style="color:#0ea5e9;text-decoration:none;">Visit Portal</a>
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

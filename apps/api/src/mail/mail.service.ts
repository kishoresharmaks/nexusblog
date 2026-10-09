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
        'newsletter@nexusnation.in',
      brevoSenderName:
        configMap['brevoSenderName'] ||
        process.env.BREVO_SENDER_NAME ||
        'NexusNation Engineering Dispatch',
      mailProvider: configMap['mailProvider'] || 'brevo',
      siteUrl: (() => {
        const raw = configMap['siteUrl'] || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://nexusnation.in';
        return (!raw || raw.includes('localhost') || raw.includes('127.0.0.1')) ? 'https://nexusnation.in' : raw.trim().replace(/\/+$/, '');
      })(),
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
    htmlContent?: string;
    previewText?: string;
    recipients: string[];
    articleIds?: string[];
    type?: any;
    metadata?: any;
  }): Promise<BroadcastResult & { campaignId?: string }> {
    const config = await this.getConfig();
    const { subject, content, previewText, recipients, htmlContent } = params;

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

    const htmlBody = htmlContent || this.markdownToEmailHtml(content, subject, previewText);

    // If Brevo API key is not configured, simulate
    if (!config.brevoApiKey) {
      let campaignId: string | undefined = undefined;
      try {
        const campaign = await this.prisma.newsletterCampaign.create({
          data: {
            subject,
            previewText,
            content,
            htmlContent: htmlBody,
            articleIds: params.articleIds || [],
            totalRecipients: recipients.length,
            sentCount: recipients.length,
            failedCount: 0,
            provider: 'simulated',
            status: 'SENT',
            type: params.type || 'WEEKLY_DIGEST',
            metadata: params.metadata || {},
            dispatchedAt: new Date(),
          },
        });
        campaignId = campaign.id;
      } catch (err: any) {
        this.logger.warn(`Failed to persist simulated campaign record: ${err.message}`);
      }

      return {
        success: true,
        provider: 'simulated',
        totalRecipients: recipients.length,
        sentCount: recipients.length,
        failedCount: 0,
        campaignId,
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

    let campaignId: string | undefined = undefined;
    try {
      const campaign = await this.prisma.newsletterCampaign.create({
        data: {
          subject,
          previewText,
          content,
          htmlContent: htmlBody,
          articleIds: params.articleIds || [],
          totalRecipients: recipients.length,
          sentCount,
          failedCount,
          provider: 'brevo',
          status: success ? 'SENT' : 'FAILED',
          type: params.type || 'WEEKLY_DIGEST',
          metadata: params.metadata || {},
          dispatchedAt: new Date(),
        },
      });
      campaignId = campaign.id;
    } catch (err: any) {
      this.logger.warn(`Failed to persist newsletter campaign record: ${err.message}`);
    }

    return {
      success,
      provider: 'brevo',
      totalRecipients: recipients.length,
      sentCount,
      failedCount,
      campaignId,
      message,
      details: { errors },
    };
  }

  /**
   * Send a test email to verify credentials
   */
  async sendTestEmail(recipientEmail: string) {
    const config = await this.getConfig();
    const subject = `[Test Dispatch] NexusNation Brevo Configuration Verification`;
    const previewText = `Verification test sent on ${new Date().toLocaleTimeString()}`;

    const testMarkdown = `## Brevo Email Integration Test\n\nThis is a verification email from your **NexusNation Developer Configuration** panel.\n\n- **Sender Name**: ${config.brevoSenderName}\n- **Sender Email**: ${config.brevoSenderEmail}\n- **Timestamp**: ${new Date().toISOString()}\n- **Mail Provider**: Brevo API v3\n\nIf you received this message, your Brevo API key, verified sender, and transactional email pipeline are **100% operational**!`;

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
   * Send Email Verification message via Brevo
   */
  async sendVerificationEmail(recipientEmail: string, name: string, rawToken: string) {
    const config = await this.getConfig();
    const verificationUrl = `${config.siteUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;
    const subject = `Verify your ${config.brevoSenderName || 'NexusNation'} account`;
    const previewText = `Confirm your email address to complete your registration.`;

    const content = `Hello **${name || 'there'}**,

Thank you for registering on **NexusNation** — the production-grade publishing platform for systems architecture and backend engineering.

Please confirm your email address by clicking the button below:

[Verify Email Address](${verificationUrl})

> **Link Security Notice**: This verification link will expire in **24 hours** and can only be used once.

If the button above does not work, copy and paste this link into your browser:
${verificationUrl}

If you did not create an account on NexusNation, you can safely ignore this email.`;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      previewText,
      textContent: content,
      htmlContent: this.markdownToEmailHtml(content, subject, previewText),
    });
  }

  /**
   * Send Password Reset link via Brevo
   */
  async sendPasswordResetEmail(recipientEmail: string, name: string, rawToken: string) {
    const config = await this.getConfig();
    const resetUrl = `${config.siteUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const subject = `Reset your NexusNation password`;
    const previewText = `Secure password reset request for your NexusNation account.`;

    const content = `Hello **${name || 'there'}**,

We received a request to reset the password for your **NexusNation** account associated with **${recipientEmail}**.

Click the link below to set a new secure password:

[Reset Password](${resetUrl})

> **Security Notice**: This password reset link is single-use and will expire in **1 hour**. For your security, requesting a new reset link will automatically invalidate any previous links.

If the button above does not work, copy and paste this link into your browser:
${resetUrl}

If you did not request a password reset, please ignore this email. Your current password remains secure.`;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      previewText,
      textContent: content,
      htmlContent: this.markdownToEmailHtml(content, subject, previewText),
    });
  }

  /**
   * Send Password Changed Security Alert via Brevo
   */
  async sendPasswordChangedAlert(recipientEmail: string, name: string) {
    const config = await this.getConfig();
    const loginUrl = `${config.siteUrl}/login`;
    const subject = `Security Alert: Your NexusNation password was changed`;
    const previewText = `Your account password has been successfully updated.`;

    const timestamp = new Date().toUTCString();
    const content = `Hello **${name || 'there'}**,

The password for your **NexusNation** account (**${recipientEmail}**) was changed on **${timestamp}**.

All existing active sessions across other devices and browsers have been terminated as a security precaution.

[Sign In to NexusNation](${loginUrl})

> **Didn't do this?** If you did not make this change, please immediately reset your password using the [Forgot Password link](${config.siteUrl}/forgot-password) or contact our security team.`;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      previewText,
      textContent: content,
      htmlContent: this.markdownToEmailHtml(content, subject, previewText),
    });
  }

  /**
   * Convert Markdown to high-quality, email-client compliant responsive HTML with dark and light theme support
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
      .replace(/^### (.*$)/gim, '<h3 style="color:#22d3ee;font-size:15px;margin:20px 0 8px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#f4f4f5;font-size:18px;margin:24px 0 10px;font-weight:800;border-bottom:1px solid #27272a;padding-bottom:6px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color:#f4f4f5;font-size:22px;margin:24px 0 12px;font-weight:800;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">$1</h1>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gm, '<pre style="background-color:#18181b;border:1px solid #27272a;border-radius:6px;padding:14px;color:#22d3ee;font-family:Consolas,\'Courier New\',monospace;font-size:12px;overflow-x:auto;margin:16px 0;line-height:1.7;"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background-color:#18181b;border:1px solid #27272a;padding:2px 6px;border-radius:4px;color:#22d3ee;font-family:Consolas,monospace;font-size:12px;">$1</code>')
      // Bold & Italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#f4f4f5;font-weight:700;">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em style="color:#a1a1aa;">$1</em>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote style="border-left:3px solid #06b6d4;padding-left:14px;margin:16px 0;color:#a1a1aa;font-style:italic;">$1</blockquote>')
      // Bullet lists
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin:6px 0;color:#d4d4d8;">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#22d3ee;text-decoration:none;font-weight:600;" target="_blank">$1 &rarr;</a>')
      // Paragraphs & line breaks
      .replace(/\n\n/g, '</p><p style="margin:14px 0;line-height:1.75;color:#d4d4d8;font-size:14px;">')
      .replace(/\n/g, '<br />');

    // Wrap list items in <ul>
    htmlContent = htmlContent.replace(/(<li.*<\/li>)/gms, '<ul style="padding-left:20px;margin:14px 0;">$1</ul>');

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${subject}</title>
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
    table { border-collapse: collapse; border-spacing: 0; }
    img { border: 0; display: block; max-width: 100%; }
    a { text-decoration: none; }
    .wrapper { width: 100%; background-color: #09090b; }
    .container { width: 100%; max-width: 640px; background-color: #121215; }
    .mobile-pad { padding: 32px; }

    @media (prefers-color-scheme: light) {
      .wrapper { background-color: #f4f4f5 !important; }
      .container { background-color: #ffffff !important; border-color: #e4e4e7 !important; }
      .top-bar { background-color: #f4f4f5 !important; border-bottom-color: #e4e4e7 !important; }
      .card-bg { background-color: #ffffff !important; border-color: #e4e4e7 !important; }
      .heading-text { color: #09090b !important; }
      .muted-text { color: #52525b !important; }
      .footer-bg { background-color: #f4f4f5 !important; border-top-color: #e4e4e7 !important; }
    }

    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .mobile-pad { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#09090b;">
  ${previewText ? `<div style="display:none;font-size:1px;color:#09090b;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="wrapper" style="background-color:#09090b;">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" class="container" style="width:100%;max-width:640px;background-color:#121215;border:1px solid #27272a;border-radius:8px;overflow:hidden;">
          
          <!-- Top Bar -->
          <tr>
            <td class="top-bar" style="padding:12px 24px;background-color:#18181b;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="font:12px Consolas,monospace;color:#a1a1aa;">
                    Tech. Systems. Engineering.
                  </td>
                  <td align="right">
                    <a href="https://nexusnation.in" target="_blank" style="font-size:12px;font-weight:bold;color:#22d3ee;text-decoration:none;">
                      nexusnation.in &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td class="mobile-pad card-bg" style="padding:24px 32px;background-color:#121215;border-bottom:1px solid #27272a;">
              <table role="presentation" width="100%">
                <tr>
                  <td valign="middle">
                    <a href="https://nexusnation.in" target="_blank" style="font-size:24px;font-weight:800;letter-spacing:4px;color:#f4f4f5;text-decoration:none;">
                      <span style="color:#22d3ee;">N</span>EXUS
                    </a>
                    <div style="font-size:11px;color:#a1a1aa;margin-top:6px;">
                      Engineering knowledge for a better internet.
                    </div>
                  </td>
                  <td align="right" valign="middle" style="font-size:11px;color:#a1a1aa;font-family:Consolas,monospace;">
                    ${formattedDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="mobile-pad card-bg" style="padding:32px;background-color:#121215;">
              <h1 class="heading-text" style="color:#f4f4f5;font-size:22px;font-weight:800;margin:0 0 16px 0;line-height:1.35;">
                ${subject}
              </h1>
              
              <div style="color:#d4d4d8;font-size:14px;line-height:1.75;">
                <p style="margin:0 0 14px 0;line-height:1.75;color:#d4d4d8;font-size:14px;">
                  ${htmlContent}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="mobile-pad footer-bg" style="padding:24px 32px;background-color:#09090b;border-top:1px solid #27272a;text-align:center;">
              <p style="font-size:18px;font-weight:bold;letter-spacing:3px;color:#f4f4f5;margin:0 0 10px;">
                <span style="color:#22d3ee;">N</span>EXUS
              </p>
              <p style="margin:0 0 10px 0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                High-performance Technical Publishing &bull; Scalable Systems Architecture
              </p>
              <p style="margin:0;font-size:11px;color:#71717a;font-family:Consolas,monospace;">
                NexusNation &copy; ${new Date().getFullYear()} &bull; 
                <a href="https://nexusnation.in" style="color:#22d3ee;text-decoration:none;">Visit Portal</a>
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

import nodemailer from 'nodemailer';

/**
 * Creates and returns a configured Nodemailer transporter
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Generates modern, responsive HTML email for verification link
 */
const buildVerificationEmailHtml = ({ name, verificationUrl, expiresHours = 24 }) => {
  const brandName = 'ResuMate AI';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email - ${brandName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 540px; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <!-- Top Accent Gradient Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); line-height: 48px; font-size: 24px; color: #ffffff; text-align: center; margin-bottom: 16px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);">
                ✨
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                Verify Your Email Address
              </h1>
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                Welcome to ${brandName} — AI-Powered Resume Scoring & ATS Optimization
              </p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 10px 36px 30px 36px;">
              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${name || 'there'}</strong>,
              </p>
              <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6; margin: 0 0 28px 0;">
                Thank you for creating an account with ${brandName}. To activate your account and start analyzing resumes with real-time ATS scoring and job matching, please verify your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4); letter-spacing: 0.01em;">
                  Verify My Email Address
                </a>
              </div>

              <!-- Fallback Link -->
              <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 24px 0 10px 0;">
                If the button above doesn't work, copy and paste this link into your web browser:
              </p>
              <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 12px; color: #818cf8;">
                <a href="${verificationUrl}" style="color: #818cf8; text-decoration: none;">${verificationUrl}</a>
              </div>

              <!-- Expiration Note -->
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #1e293b;">
                ⏳ This link is valid for <strong>${expiresHours} hours</strong>. If you did not sign up for an account, please safely disregard this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #0b0f19; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} ResuMate AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Sends an email verification link to the specified user
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.token - Crypto verification token
 * @returns {Promise<{success: boolean, sentViaSmtp: boolean, verificationUrl: string}>}
 */
export async function sendVerificationEmail({ to, name, token }) {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const verificationUrl = `${clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"ResuMate AI" <no-reply@resumate.ai>';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: '✨ Verify your email address - ResuMate AI',
        text: `Hello ${name || 'there'},\n\nPlease verify your ResuMate AI account by clicking this link:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nThank you,\nResuMate AI Team`,
        html: buildVerificationEmailHtml({ name, verificationUrl })
      });

      console.log(`\n======================================================`);
      console.log(`📧 [Email Verification Sent via SMTP]`);
      console.log(`   To:              ${to}`);
      console.log(`   Message ID:      ${info.messageId}`);
      console.log(`   Link:            ${verificationUrl}`);
      console.log(`======================================================\n`);

      return {
        success: true,
        sentViaSmtp: true,
        verificationUrl,
        messageId: info.messageId
      };
    } catch (err) {
      console.error(`[SMTP Warning] Failed to send verification email to ${to}:`, err.message);
      console.log(`\n======================================================`);
      console.log(`📧 [Verification Link Fallback Log]`);
      console.log(`   To:    ${to}`);
      console.log(`   Link:  ${verificationUrl}`);
      console.log(`======================================================\n`);

      return {
        success: true,
        sentViaSmtp: false,
        verificationUrl,
        error: err.message
      };
    }
  } else {
    // Development fallback when SMTP credentials are not yet configured in .env
    console.log(`\n======================================================`);
    console.log(`📧 [DEV EMAIL VERIFICATION] (SMTP not configured in .env)`);
    console.log(`   To:    ${to}`);
    console.log(`   Name:  ${name}`);
    console.log(`   Link:  ${verificationUrl}`);
    console.log(`   💡 Tip: Add SMTP_USER and SMTP_PASS in backend/.env to send real emails!`);
    console.log(`======================================================\n`);

    return {
      success: true,
      sentViaSmtp: false,
      verificationUrl
    };
  }
}

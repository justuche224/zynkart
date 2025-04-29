import nodemailer from "nodemailer";
import type { MailOptions } from "@/types/mail.types.js";
import { info } from "@/constants";

// --- Constants for Styling (Customize these) ---
const BRAND_COLOR = info.brandColor;
const FONT_FAMILY = "Helvetica Neue, Helvetica, Arial, sans-serif";
const CONTAINER_WIDTH = "600px";
const LOGO_URL =
  info.logoUrl || "https://via.placeholder.com/150x50?text=YourLogo";
const LOGO_ALT = `${info.name} Logo`;

/**
 * Base Email Template Generator
 */
function getBaseEmailTemplate(
  title: string,
  preheader: string,
  contentHtml: string
): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <style type="text/css">
            /* Basic Reset */
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            table { border-collapse: collapse !important; }
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
            /* Basic Styles */
            body { font-family: ${FONT_FAMILY}; }
            p { margin: 0 0 15px 0; }
            a { color: ${BRAND_COLOR}; text-decoration: underline; }

            /* Button Style (Fallback) */
            .button-td, .button-a {
                transition: all 100ms ease-in;
            }
            .button-td:hover, .button-a:hover {
                 background: #555555 !important; /* Darken color slightly */
                 border-color: #555555 !important;
            }

             /* Responsive Styles */
            @media screen and (max-width: 600px) {
                .email-container { width: 100% !important; margin: auto !important; }
                .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
                .stack-column, .stack-column-center { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
                .stack-column-center { text-align: center !important; }
                .center-on-narrow { text-align: center !important; display: block !important; margin-left: auto !important; margin-right: auto !important; float: none !important; }
                table.center-on-narrow { display: inline-block !important; }
            }
        </style>
    </head>
    <body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">
        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
            ${preheader}
        </div>
        <center style="width: 100%; background-color: #f4f4f4;">
        <div style="max-width: ${CONTAINER_WIDTH}; margin: 0 auto;" class="email-container">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: ${CONTAINER_WIDTH}; margin: auto; background-color: #ffffff;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                             <img src="${LOGO_URL}" width="150" alt="${LOGO_ALT}" border="0" style="height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 15px; color: #555555;">
                        </td>
                    </tr>
                </table>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: ${CONTAINER_WIDTH}; margin: auto; background-color: #ffffff;">
                    <tr>
                        <td style="padding: 20px 40px 40px 40px; font-family: ${FONT_FAMILY}; font-size: 15px; line-height: 1.6; color: #555555;">
                            ${contentHtml}
                        </td>
                    </tr>
                 </table>
                 <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: ${CONTAINER_WIDTH}; margin: auto;">
                     <tr>
                         <td style="padding: 20px 40px; font-family: ${FONT_FAMILY}; font-size: 12px; line-height: 1.5; text-align: center; color: #888888;">
                             <p style="margin: 0 0 5px 0;">${info.name}</p>
                             <p style="margin: 0 0 5px 0;">123 App Street, Suite 100, City, State 12345</p> <p style="margin: 0;">&copy; ${currentYear} ${info.name}. All rights reserved.</p>
                             </td>
                     </tr>
                 </table>
                 </div>
         </center>
    </body>
    </html>
    `;
}

/**
 * Mail service for sending emails
 */
class MailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize the nodemailer transporter
   */
  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: "resonantfinance.org",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD,
      },
      logger: process.env.NODE_ENV !== "production",
      debug: process.env.NODE_ENV !== "production",
    });
  }

  /**
   * Send an email
   */
  async sendMail({ to, subject, text, html }: MailOptions): Promise<void> {
    const mailOptions = {
      from: `"${info.name}" <${process.env.MAILER_EMAIL}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
      throw new Error("Failed to send email due to an unknown error.");
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const subject = `Reset Your ${info.name} Password`;
    const { text, html } = this.getPasswordResetTemplate(resetUrl);

    await this.sendMail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    email: string,
    verificationUrl: string
  ): Promise<void> {
    const subject = `Verify Your Email for ${info.name}`;
    const { text, html } = this.getVerificationEmailTemplate(verificationUrl);

    await this.sendMail({
      to: email,
      subject,
      text,
      html,
    });
  }

  // --- PRIVATE TEMPLATE METHODS ---

  /**
   * Generates the styled button HTML
   */
  private getStyledButton(url: string, text: string): string {
    // Inline styles are critical for buttons in email
    return `
       <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
           <tr>
               <td style="border-radius: 5px; background: ${BRAND_COLOR}; text-align: center;" class="button-td">
                   <a href="${url}" style="background: ${BRAND_COLOR}; border: 1px solid ${BRAND_COLOR}; font-family: ${FONT_FAMILY}; font-size: 15px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 5px; font-weight: bold; padding: 12px 25px;" class="button-a">
                       <span style="color:#ffffff;">${text}</span>
                   </a>
               </td>
           </tr>
       </table>
       `;
  }

  /**
   * Get password reset email template content
   */
  private getPasswordResetTemplate(resetUrl: string): {
    text: string;
    html: string;
  } {
    const title = "Reset Your Password";
    const preheader = `Use this link to reset your password for ${info.name}. Link expires soon.`;
    const text = `Hi there,\n\nYou requested a password reset for your ${info.name} account. Click the link below (or copy and paste it into your browser) to set a new password. This link will expire in 30 minutes.\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe ${info.name} Team`;

    const contentHtml = `
        <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 1.3; color: #333333; font-weight: normal;">Reset Your Password</h1>
        <p>Hi there,</p>
        <p>We received a request to reset the password for your ${
          info.name
        } account. You can do this by clicking the button below.</p>
        <p style="margin: 30px 0;">
            ${this.getStyledButton(resetUrl, "Reset Password")}
        </p>
        <p>This password reset link is only valid for the next <strong>30 minutes</strong>.</p>
        <p>If you didn't request a password reset, you don't need to do anything. Just ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;">
        <p style="font-size: 13px; color: #888888;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 13px; color: #888888; word-break: break-all;">${resetUrl}</p>
    `;

    const html = getBaseEmailTemplate(title, preheader, contentHtml);

    return { text, html };
  }

  /**
   * Get verification email template content
   */
  private getVerificationEmailTemplate(verificationUrl: string): {
    text: string;
    html: string;
  } {
    const title = "Verify Your Email Address";
    const preheader = `Welcome to ${info.name}! Click here to verify your email and get started.`;
    const text = `Welcome to ${info.name}!\n\nTo finish setting up your account, please verify your email address by clicking the link below (or copy and paste it into your browser):\n\n${verificationUrl}\n\nThanks for joining!\nThe ${info.name} Team`;

    const contentHtml = `
        <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 1.3; color: #333333; font-weight: normal;">Welcome to ${
          info.name
        }!</h1>
        <p>Hi there,</p>
        <p>Thanks for signing up! We're excited to have you.</p>
        <p>Please click the button below to verify your email address and complete your registration:</p>
        <p style="margin: 30px 0;">
             ${this.getStyledButton(verificationUrl, "Verify Email Address")}
        </p>
        <p>Once verified, you can start exploring all that ${
          info.name
        } has to offer.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;">
        <p style="font-size: 13px; color: #888888;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 13px; color: #888888; word-break: break-all;">${verificationUrl}</p>
    `;

    const html = getBaseEmailTemplate(title, preheader, contentHtml);

    return { text, html };
  }
}

// Export a singleton instance
export const mailService = new MailService();

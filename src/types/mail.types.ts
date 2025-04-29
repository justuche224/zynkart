/**
 * Mail options interface
 */
export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

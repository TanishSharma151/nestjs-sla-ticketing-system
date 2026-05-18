import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(
    process.env.RESEND_API_KEY,
  );

  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ) {
    try {
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error(
        'Email sending failed:',
        error,
      );
    }
  }
}
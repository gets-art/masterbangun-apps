import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendPush(userId: string, title: string, body: string) {
    // TODO: Integrate with FCM in production
    this.logger.log(`[PUSH] To: ${userId} | ${title}: ${body}`);
  }

  async sendEmail(email: string, subject: string, body: string) {
    // TODO: Integrate with SendGrid/AWS SES in production
    this.logger.log(`[EMAIL] To: ${email} | ${subject}: ${body}`);
  }
}

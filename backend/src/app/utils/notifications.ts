import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });

export class NotificationService {
    static async sendEmail(to: string, subject: string, body: string, isHtml: boolean = false) {
        const command = new SendEmailCommand({
            Source: process.env.SES_FROM_EMAIL,
            Destination: {
                ToAddresses: [to]
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                },
                Body: isHtml ? {
                    Html: {
                        Data: body,
                        Charset: 'UTF-8'
                    }
                } : {
                    Text: {
                        Data: body,
                        Charset: 'UTF-8'
                    }
                }
            }
        });

        await sesClient.send(command);
    }

    static async sendSMS(phoneNumber: string, message: string) {
        const command = new PublishCommand({
            PhoneNumber: phoneNumber,
            Message: message
        });

        await snsClient.send(command);
    }

    static async sendBookingConfirmation(user: any, booking: any, court: any) {
        const subject = 'Booking Confirmation - Badminton Club';
        const body = `
      Dear ${user.firstName} ${user.lastName},
      
      Your booking has been confirmed!
      
      Court: ${court.name}
      Date: ${booking.date}
      Time: ${booking.startTime} - ${booking.endTime}
      Amount: $${booking.totalAmount}
      
      Thank you for choosing our badminton club!
    `;

        await this.sendEmail(user.email, subject, body);
    }

    static async sendTournamentRegistration(user: any, tournament: any) {
        const subject = 'Tournament Registration Confirmation';
        const body = `
      Dear ${user.firstName} ${user.lastName},
      
      You have successfully registered for ${tournament.name}!
      
      Tournament Details:
      - Start Date: ${tournament.startDate}
      - Category: ${tournament.category}
      - Entry Fee: $${tournament.entryFee}
      
      Good luck!
    `;

        await this.sendEmail(user.email, subject, body);
    }
}
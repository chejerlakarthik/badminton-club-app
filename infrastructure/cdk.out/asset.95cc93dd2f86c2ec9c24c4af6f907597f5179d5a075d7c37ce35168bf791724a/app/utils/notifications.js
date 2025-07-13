"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const client_sns_1 = require("@aws-sdk/client-sns");
const sesClient = new client_ses_1.SESClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const snsClient = new client_sns_1.SNSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
class NotificationService {
    static async sendEmail(to, subject, body, isHtml = false) {
        const command = new client_ses_1.SendEmailCommand({
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
    static async sendSMS(phoneNumber, message) {
        const command = new client_sns_1.PublishCommand({
            PhoneNumber: phoneNumber,
            Message: message
        });
        await snsClient.send(command);
    }
    static async sendBookingConfirmation(user, booking, court) {
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
    static async sendTournamentRegistration(user, tournament) {
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
exports.NotificationService = NotificationService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvdXRpbHMvbm90aWZpY2F0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBa0U7QUFDbEUsb0RBQWdFO0FBRWhFLE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7QUFDeEYsTUFBTSxTQUFTLEdBQUcsSUFBSSxzQkFBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUV4RixNQUFhLG1CQUFtQjtJQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFVLEVBQUUsT0FBZSxFQUFFLElBQVksRUFBRSxTQUFrQixLQUFLO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLElBQUksNkJBQWdCLENBQUM7WUFDakMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYztZQUNsQyxXQUFXLEVBQUU7Z0JBQ1QsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ3BCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLE9BQU8sRUFBRTtvQkFDTCxJQUFJLEVBQUUsT0FBTztvQkFDYixPQUFPLEVBQUUsT0FBTztpQkFDbkI7Z0JBQ0QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ1gsSUFBSSxFQUFFO3dCQUNGLElBQUksRUFBRSxJQUFJO3dCQUNWLE9BQU8sRUFBRSxPQUFPO3FCQUNuQjtpQkFDSixDQUFDLENBQUMsQ0FBQztvQkFDQSxJQUFJLEVBQUU7d0JBQ0YsSUFBSSxFQUFFLElBQUk7d0JBQ1YsT0FBTyxFQUFFLE9BQU87cUJBQ25CO2lCQUNKO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQW1CLEVBQUUsT0FBZTtRQUNyRCxNQUFNLE9BQU8sR0FBRyxJQUFJLDJCQUFjLENBQUM7WUFDL0IsV0FBVyxFQUFFLFdBQVc7WUFDeEIsT0FBTyxFQUFFLE9BQU87U0FDbkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQVMsRUFBRSxPQUFZLEVBQUUsS0FBVTtRQUNwRSxNQUFNLE9BQU8sR0FBRyx1Q0FBdUMsQ0FBQztRQUN4RCxNQUFNLElBQUksR0FBRzthQUNSLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVE7Ozs7ZUFJN0IsS0FBSyxDQUFDLElBQUk7Y0FDWCxPQUFPLENBQUMsSUFBSTtjQUNaLE9BQU8sQ0FBQyxTQUFTLE1BQU0sT0FBTyxDQUFDLE9BQU87aUJBQ25DLE9BQU8sQ0FBQyxXQUFXOzs7S0FHL0IsQ0FBQztRQUVFLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxJQUFTLEVBQUUsVUFBZTtRQUM5RCxNQUFNLE9BQU8sR0FBRyxzQ0FBc0MsQ0FBQztRQUN2RCxNQUFNLElBQUksR0FBRzthQUNSLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVE7OzZDQUVDLFVBQVUsQ0FBQyxJQUFJOzs7c0JBR3RDLFVBQVUsQ0FBQyxTQUFTO29CQUN0QixVQUFVLENBQUMsUUFBUTtzQkFDakIsVUFBVSxDQUFDLFFBQVE7OztLQUdwQyxDQUFDO1FBRUUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDSjtBQXpFRCxrREF5RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTRVNDbGllbnQsIFNlbmRFbWFpbENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtc2VzJztcbmltcG9ydCB7IFNOU0NsaWVudCwgUHVibGlzaENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtc25zJztcblxuY29uc3Qgc2VzQ2xpZW50ID0gbmV3IFNFU0NsaWVudCh7IHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAnYXAtc291dGhlYXN0LTInIH0pO1xuY29uc3Qgc25zQ2xpZW50ID0gbmV3IFNOU0NsaWVudCh7IHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAnYXAtc291dGhlYXN0LTInIH0pO1xuXG5leHBvcnQgY2xhc3MgTm90aWZpY2F0aW9uU2VydmljZSB7XG4gICAgc3RhdGljIGFzeW5jIHNlbmRFbWFpbCh0bzogc3RyaW5nLCBzdWJqZWN0OiBzdHJpbmcsIGJvZHk6IHN0cmluZywgaXNIdG1sOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBTZW5kRW1haWxDb21tYW5kKHtcbiAgICAgICAgICAgIFNvdXJjZTogcHJvY2Vzcy5lbnYuU0VTX0ZST01fRU1BSUwsXG4gICAgICAgICAgICBEZXN0aW5hdGlvbjoge1xuICAgICAgICAgICAgICAgIFRvQWRkcmVzc2VzOiBbdG9dXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgTWVzc2FnZToge1xuICAgICAgICAgICAgICAgIFN1YmplY3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgRGF0YTogc3ViamVjdCxcbiAgICAgICAgICAgICAgICAgICAgQ2hhcnNldDogJ1VURi04J1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgQm9keTogaXNIdG1sID8ge1xuICAgICAgICAgICAgICAgICAgICBIdG1sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBEYXRhOiBib2R5LFxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hhcnNldDogJ1VURi04J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICAgICAgICAgVGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgRGF0YTogYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgIENoYXJzZXQ6ICdVVEYtOCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgc2VzQ2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHNlbmRTTVMocGhvbmVOdW1iZXI6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgUHVibGlzaENvbW1hbmQoe1xuICAgICAgICAgICAgUGhvbmVOdW1iZXI6IHBob25lTnVtYmVyLFxuICAgICAgICAgICAgTWVzc2FnZTogbWVzc2FnZVxuICAgICAgICB9KTtcblxuICAgICAgICBhd2FpdCBzbnNDbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgc2VuZEJvb2tpbmdDb25maXJtYXRpb24odXNlcjogYW55LCBib29raW5nOiBhbnksIGNvdXJ0OiBhbnkpIHtcbiAgICAgICAgY29uc3Qgc3ViamVjdCA9ICdCb29raW5nIENvbmZpcm1hdGlvbiAtIEJhZG1pbnRvbiBDbHViJztcbiAgICAgICAgY29uc3QgYm9keSA9IGBcbiAgICAgIERlYXIgJHt1c2VyLmZpcnN0TmFtZX0gJHt1c2VyLmxhc3ROYW1lfSxcbiAgICAgIFxuICAgICAgWW91ciBib29raW5nIGhhcyBiZWVuIGNvbmZpcm1lZCFcbiAgICAgIFxuICAgICAgQ291cnQ6ICR7Y291cnQubmFtZX1cbiAgICAgIERhdGU6ICR7Ym9va2luZy5kYXRlfVxuICAgICAgVGltZTogJHtib29raW5nLnN0YXJ0VGltZX0gLSAke2Jvb2tpbmcuZW5kVGltZX1cbiAgICAgIEFtb3VudDogJCR7Ym9va2luZy50b3RhbEFtb3VudH1cbiAgICAgIFxuICAgICAgVGhhbmsgeW91IGZvciBjaG9vc2luZyBvdXIgYmFkbWludG9uIGNsdWIhXG4gICAgYDtcblxuICAgICAgICBhd2FpdCB0aGlzLnNlbmRFbWFpbCh1c2VyLmVtYWlsLCBzdWJqZWN0LCBib2R5KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgc2VuZFRvdXJuYW1lbnRSZWdpc3RyYXRpb24odXNlcjogYW55LCB0b3VybmFtZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3Qgc3ViamVjdCA9ICdUb3VybmFtZW50IFJlZ2lzdHJhdGlvbiBDb25maXJtYXRpb24nO1xuICAgICAgICBjb25zdCBib2R5ID0gYFxuICAgICAgRGVhciAke3VzZXIuZmlyc3ROYW1lfSAke3VzZXIubGFzdE5hbWV9LFxuICAgICAgXG4gICAgICBZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgcmVnaXN0ZXJlZCBmb3IgJHt0b3VybmFtZW50Lm5hbWV9IVxuICAgICAgXG4gICAgICBUb3VybmFtZW50IERldGFpbHM6XG4gICAgICAtIFN0YXJ0IERhdGU6ICR7dG91cm5hbWVudC5zdGFydERhdGV9XG4gICAgICAtIENhdGVnb3J5OiAke3RvdXJuYW1lbnQuY2F0ZWdvcnl9XG4gICAgICAtIEVudHJ5IEZlZTogJCR7dG91cm5hbWVudC5lbnRyeUZlZX1cbiAgICAgIFxuICAgICAgR29vZCBsdWNrIVxuICAgIGA7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5zZW5kRW1haWwodXNlci5lbWFpbCwgc3ViamVjdCwgYm9keSk7XG4gICAgfVxufSJdfQ==
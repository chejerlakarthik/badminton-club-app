export declare class NotificationService {
    static sendEmail(to: string, subject: string, body: string, isHtml?: boolean): Promise<void>;
    static sendSMS(phoneNumber: string, message: string): Promise<void>;
    static sendBookingConfirmation(user: any, booking: any, court: any): Promise<void>;
    static sendTournamentRegistration(user: any, tournament: any): Promise<void>;
}
//# sourceMappingURL=notifications.d.ts.map
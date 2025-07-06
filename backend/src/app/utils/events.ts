import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'badminton-club-events';

export interface ClubEvent {
    source: string;
    detailType: string;
    detail: any;
}

export class EventService {
    static async publishEvent(event: ClubEvent) {
        const command = new PutEventsCommand({
            Entries: [
                {
                    Source: event.source,
                    DetailType: event.detailType,
                    Detail: JSON.stringify(event.detail),
                    EventBusName: EVENT_BUS_NAME
                }
            ]
        });

        await eventBridge.send(command);
    }

    static async publishBookingEvent(eventType: string, booking: any) {
        await this.publishEvent({
            source: 'badminton-club.bookings',
            detailType: eventType,
            detail: booking
        });
    }

    static async publishUserEvent(eventType: string, user: any) {
        await this.publishEvent({
            source: 'badminton-club.users',
            detailType: eventType,
            detail: user
        });
    }

    static async publishTournamentEvent(eventType: string, tournament: any) {
        await this.publishEvent({
            source: 'badminton-club.tournaments',
            detailType: eventType,
            detail: tournament
        });
    }
}
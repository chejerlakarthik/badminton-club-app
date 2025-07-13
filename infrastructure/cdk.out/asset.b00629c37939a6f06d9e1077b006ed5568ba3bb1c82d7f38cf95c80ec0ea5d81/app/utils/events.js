"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const client_eventbridge_1 = require("@aws-sdk/client-eventbridge");
const eventBridge = new client_eventbridge_1.EventBridgeClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'badminton-club-events';
class EventService {
    static async publishEvent(event) {
        const command = new client_eventbridge_1.PutEventsCommand({
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
    static async publishBookingEvent(eventType, booking) {
        await this.publishEvent({
            source: 'badminton-club.bookings',
            detailType: eventType,
            detail: booking
        });
    }
    static async publishUserEvent(eventType, user) {
        await this.publishEvent({
            source: 'badminton-club.users',
            detailType: eventType,
            detail: user
        });
    }
    static async publishTournamentEvent(eventType, tournament) {
        await this.publishEvent({
            source: 'badminton-club.tournaments',
            detailType: eventType,
            detail: tournament
        });
    }
}
exports.EventService = EventService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC91dGlscy9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0VBQWtGO0FBRWxGLE1BQU0sV0FBVyxHQUFHLElBQUksc0NBQWlCLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0FBQ2xHLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLHVCQUF1QixDQUFDO0FBUTdFLE1BQWEsWUFBWTtJQUNyQixNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFnQjtRQUN0QyxNQUFNLE9BQU8sR0FBRyxJQUFJLHFDQUFnQixDQUFDO1lBQ2pDLE9BQU8sRUFBRTtnQkFDTDtvQkFDSSxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07b0JBQ3BCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtvQkFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFDcEMsWUFBWSxFQUFFLGNBQWM7aUJBQy9CO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsU0FBaUIsRUFBRSxPQUFZO1FBQzVELE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNwQixNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLE1BQU0sRUFBRSxPQUFPO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsSUFBUztRQUN0RCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDcEIsTUFBTSxFQUFFLHNCQUFzQjtZQUM5QixVQUFVLEVBQUUsU0FBUztZQUNyQixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFNBQWlCLEVBQUUsVUFBZTtRQUNsRSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDcEIsTUFBTSxFQUFFLDRCQUE0QjtZQUNwQyxVQUFVLEVBQUUsU0FBUztZQUNyQixNQUFNLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF2Q0Qsb0NBdUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRCcmlkZ2VDbGllbnQsIFB1dEV2ZW50c0NvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtZXZlbnRicmlkZ2UnO1xuXG5jb25zdCBldmVudEJyaWRnZSA9IG5ldyBFdmVudEJyaWRnZUNsaWVudCh7IHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAnYXAtc291dGhlYXN0LTInIH0pO1xuY29uc3QgRVZFTlRfQlVTX05BTUUgPSBwcm9jZXNzLmVudi5FVkVOVF9CVVNfTkFNRSB8fCAnYmFkbWludG9uLWNsdWItZXZlbnRzJztcblxuZXhwb3J0IGludGVyZmFjZSBDbHViRXZlbnQge1xuICAgIHNvdXJjZTogc3RyaW5nO1xuICAgIGRldGFpbFR5cGU6IHN0cmluZztcbiAgICBkZXRhaWw6IGFueTtcbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50U2VydmljZSB7XG4gICAgc3RhdGljIGFzeW5jIHB1Ymxpc2hFdmVudChldmVudDogQ2x1YkV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgUHV0RXZlbnRzQ29tbWFuZCh7XG4gICAgICAgICAgICBFbnRyaWVzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBTb3VyY2U6IGV2ZW50LnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgRGV0YWlsVHlwZTogZXZlbnQuZGV0YWlsVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgRGV0YWlsOiBKU09OLnN0cmluZ2lmeShldmVudC5kZXRhaWwpLFxuICAgICAgICAgICAgICAgICAgICBFdmVudEJ1c05hbWU6IEVWRU5UX0JVU19OQU1FXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcblxuICAgICAgICBhd2FpdCBldmVudEJyaWRnZS5zZW5kKGNvbW1hbmQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwdWJsaXNoQm9va2luZ0V2ZW50KGV2ZW50VHlwZTogc3RyaW5nLCBib29raW5nOiBhbnkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdWJsaXNoRXZlbnQoe1xuICAgICAgICAgICAgc291cmNlOiAnYmFkbWludG9uLWNsdWIuYm9va2luZ3MnLFxuICAgICAgICAgICAgZGV0YWlsVHlwZTogZXZlbnRUeXBlLFxuICAgICAgICAgICAgZGV0YWlsOiBib29raW5nXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwdWJsaXNoVXNlckV2ZW50KGV2ZW50VHlwZTogc3RyaW5nLCB1c2VyOiBhbnkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdWJsaXNoRXZlbnQoe1xuICAgICAgICAgICAgc291cmNlOiAnYmFkbWludG9uLWNsdWIudXNlcnMnLFxuICAgICAgICAgICAgZGV0YWlsVHlwZTogZXZlbnRUeXBlLFxuICAgICAgICAgICAgZGV0YWlsOiB1c2VyXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwdWJsaXNoVG91cm5hbWVudEV2ZW50KGV2ZW50VHlwZTogc3RyaW5nLCB0b3VybmFtZW50OiBhbnkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5wdWJsaXNoRXZlbnQoe1xuICAgICAgICAgICAgc291cmNlOiAnYmFkbWludG9uLWNsdWIudG91cm5hbWVudHMnLFxuICAgICAgICAgICAgZGV0YWlsVHlwZTogZXZlbnRUeXBlLFxuICAgICAgICAgICAgZGV0YWlsOiB0b3VybmFtZW50XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=
export interface ClubEvent {
    source: string;
    detailType: string;
    detail: any;
}
export declare class EventService {
    static publishEvent(event: ClubEvent): Promise<void>;
    static publishBookingEvent(eventType: string, booking: any): Promise<void>;
    static publishUserEvent(eventType: string, user: any): Promise<void>;
    static publishTournamentEvent(eventType: string, tournament: any): Promise<void>;
}
//# sourceMappingURL=events.d.ts.map
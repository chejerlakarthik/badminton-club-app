import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import {User} from "../types/entities.types";

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'badminton-club-events';

type UserDetailType = 'UserRegistered' | 'UserLoginSuccess' | 'UserLoginFailed';

type UserRegisteredEvent = {
    source: 'badminton-club.users';
    detailType: 'UserRegistered';
    detail: User;
}

type UserLoginSuccessEvent = {
    source: 'badminton-club.users';
    detailType: 'UserLoginSuccess';
    detail: User;
}

type UserLoginFailedEvent = {
    source: 'badminton-club.users';
    detailType: 'UserLoginFailed';
    detail: User;
}

export type ClubEvent = UserRegisteredEvent | UserLoginSuccessEvent | UserLoginFailedEvent;


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

    static async publishUserEvent(eventType: UserDetailType, user: User) {
        await this.publishEvent({
            source: 'badminton-club.users',
            detailType: eventType,
            detail: user
        });
    }
}
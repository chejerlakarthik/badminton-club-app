import { EventBridgeEvent } from 'aws-lambda';
import { DatabaseService } from '../../data/database';
import { NotificationService } from '../../utils/notifications';
import { DynamoUser, DynamoCourt } from '../../data/model.types';

export const handler = async (event: EventBridgeEvent<string, any>) => {
    try {
        console.log('Processing booking event:', event);

        const { detail, 'detail-type': detailType } = event;

        if (detailType === 'Booking Created') {
            await handleBookingCreated(detail);
        } else if (detailType === 'Booking Confirmed') {
            await handleBookingConfirmed(detail);
        }
    } catch (error) {
        console.error('Error processing booking event:', error);
        throw error;
    }
};

async function handleBookingCreated(detail: any) {
    // Send booking confirmation email
    const user = await DatabaseService.get(`USER#${detail.userId}`, `USER#${detail.userId}`) as DynamoUser;
    const court = await DatabaseService.get(`COURT#${detail.courtId}`, `COURT#${detail.courtId}`) as DynamoCourt;

    if (user && court) {
        await NotificationService.sendBookingConfirmation(user, detail, court);
    }
}

async function handleBookingConfirmed(detail: any) {
    // Handle booking confirmation logic
    console.log('Booking confirmed:', detail);
}
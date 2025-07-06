import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../utils/auth';
import { DatabaseService } from '../../utils/database';
import { EventService } from '../../utils/events';
import { Booking, Court } from '../../types';

const CreateBookingSchema = z.object({
    courtId: z.string().uuid(),
    date: z.string(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    notes: z.string().optional()
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return createErrorResponse(400, 'Request body is required');
        }

        const user = getUserFromEvent(event);
        const body = JSON.parse(event.body);
        const { courtId, date, startTime, endTime, notes } = CreateBookingSchema.parse(body);

        // Check if court exists
        const court = await DatabaseService.get(`COURT#${courtId}`, `COURT#${courtId}`) as Court;
        if (!court || !court.isActive) {
            return createErrorResponse(404, 'Court not found or inactive');
        }

        // Check for conflicting bookings
        const existingBookings = await DatabaseService.queryGSI(
            `COURT#${courtId}`,
            `BOOKING#${date}`,
            'GSI2'
        );

        const hasConflict = existingBookings.some((booking: any) => {
            if (booking.status === 'cancelled') return false;

            const existingStart = booking.startTime;
            const existingEnd = booking.endTime;

            return (startTime < existingEnd && endTime > existingStart);
        });

        if (hasConflict) {
            return createErrorResponse(400, 'Court is already booked for this time slot');
        }

        // Calculate total amount
        const startHour = parseInt(startTime.split(':')[0] || '0');
        const endHour = parseInt(endTime.split(':')[0] || '0');
        const duration = endHour - startHour;
        const totalAmount = duration * court.hourlyRate;

        const bookingId = uuidv4();
        const now = new Date().toISOString();

        const booking: Booking = {
            PK: `BOOKING#${bookingId}`,
            SK: `BOOKING#${bookingId}`,
            GSI1PK: `USER#${user.userId}`,
            GSI1SK: `BOOKING#${date}#${startTime}`,
            GSI2PK: `COURT#${courtId}`,
            GSI2SK: `BOOKING#${date}#${startTime}`,
            bookingId,
            userId: user.userId,
            courtId,
            date,
            startTime,
            endTime,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            notes: notes ?? 'No notes provided.',
            createdAt: now,
            updatedAt: now
        };

        await DatabaseService.put(booking);

        // Publish booking event
        await EventService.publishBookingEvent('Booking Created', {
            bookingId: booking.bookingId,
            userId: booking.userId,
            courtId: booking.courtId,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            totalAmount: booking.totalAmount
        });

        return createSuccessResponse(booking, 'Booking created successfully');
    } catch (error) {
        console.error('Booking creation error:', error);

        if (error instanceof z.ZodError) {
            return createErrorResponse(400, error.errors[0]?.message || 'Validation error');
        }

        if ((error as Error).message.includes('authorization')) {
            return createErrorResponse(401, (error as Error).message);
        }

        return createErrorResponse(500, 'Internal server error');
    }
};
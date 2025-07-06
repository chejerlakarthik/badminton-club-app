export interface User {
    PK: string; // USER#userId
    SK: string; // USER#userId
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    passwordHash: string;
    membershipType: 'basic' | 'premium' | 'student' | 'family';
    membershipExpiry: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    role: 'member' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Court {
    PK: string; // COURT#courtId
    SK: string; // COURT#courtId
    courtId: string;
    name: string;
    type: 'indoor' | 'outdoor';
    hourlyRate: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    PK: string; // BOOKING#bookingId
    SK: string; // BOOKING#bookingId
    GSI1PK: string; // USER#userId
    GSI1SK: string; // BOOKING#date#startTime
    GSI2PK: string; // COURT#courtId
    GSI2SK: string; // BOOKING#date#startTime
    bookingId: string;
    userId: string;
    courtId: string;
    date: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus: 'pending' | 'paid' | 'failed';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tournament {
    PK: string; // TOURNAMENT#tournamentId
    SK: string; // TOURNAMENT#tournamentId
    tournamentId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    entryFee: number;
    maxParticipants: number;
    category: 'singles' | 'doubles' | 'mixed-doubles';
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'open';
    status: 'upcoming' | 'registration-open' | 'registration-closed' | 'ongoing' | 'completed';
    participants: TournamentParticipant[];
    winnerId?: string;
    runnerUpId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TournamentParticipant {
    userId: string;
    registrationDate: string;
    paymentStatus: 'pending' | 'paid';
}

export interface APIResponse<T = any> {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
    };
    body: string;
}
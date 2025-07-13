export interface User {
    PK: string;
    SK: string;
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
    PK: string;
    SK: string;
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
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    GSI2PK: string;
    GSI2SK: string;
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
    PK: string;
    SK: string;
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
//# sourceMappingURL=index.d.ts.map
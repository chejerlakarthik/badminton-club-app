export type DynamoUser = {
    PK: string; // USER#userId
    SK: string; // USER#userId
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    passwordHash: string;
    membershipType: 'basic' | 'premium' | 'student' | 'family';
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    role: 'member' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type DynamoCourt = {
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

export type DynamoBooking = {
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
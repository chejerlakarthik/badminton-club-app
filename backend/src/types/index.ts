// Base types
export interface BaseEntity {
    createdAt: string;
    updatedAt: string;
}

// User types
export interface User extends BaseEntity {
    userId: string;
    email: string;
    name: string;
    phone?: string;
    role: 'admin' | 'member';
    status: 'active' | 'inactive' | 'pending';
    preferences?: UserPreferences;
}

export interface UserPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    reminderHours: number; // Hours before session to send reminder
}

export interface CreateUserRequest {
    email: string;
    name: string;
    phone?: string;
    password: string;
    invitationToken?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password'>;
}

// Poll types
export interface Poll extends BaseEntity {
    pollId: string;
    sessionDate: string; // ISO date string
    sessionTime: string; // HH:MM format
    sessionVenue?: string;
    status: 'active' | 'frozen' | 'cancelled' | 'completed';
    freezeTime: string; // ISO date string
    minimumPlayers: number;
    createdBy: string; // userId
    notes?: string;
}

export interface PollResponse extends BaseEntity {
    responseId: string;
    pollId: string;
    userId: string;
    availability: 'available' | 'unavailable' | 'maybe';
    notes?: string;
}

export interface PollWithResponses extends Poll {
    responses: PollResponse[];
    responseSummary: {
        available: number;
        unavailable: number;
        maybe: number;
        pending: number;
    };
}

export interface CreatePollRequest {
    sessionDate: string;
    sessionTime: string;
    sessionVenue?: string;
    minimumPlayers?: number;
    notes?: string;
}

export interface SubmitResponseRequest {
    availability: 'available' | 'unavailable' | 'maybe';
    notes?: string;
}

// Invitation types
export interface Invitation extends BaseEntity {
    invitationId: string;
    email: string;
    phone?: string;
    token: string;
    status: 'pending' | 'accepted' | 'expired';
    invitedBy: string; // userId
    message?: string;
    expiresAt: string; // ISO date string
}

export interface SendInvitationRequest {
    email: string;
    phone?: string;
    message?: string;
}

export interface AcceptInvitationRequest {
    name: string;
    password: string;
    phone?: string;
}

// Expense types
export interface Expense extends BaseEntity {
    expenseId: string;
    sessionDate: string; // ISO date string
    description: string;
    shuttleCount: number;
    courtCost: number;
    additionalCosts: number;
    totalCost: number;
    attendeeCount: number;
    perHeadCost: number;
    attendees: string[]; // Array of userIds
    notes?: string;
    createdBy: string; // userId
}

export interface CreateExpenseRequest {
    sessionDate: string;
    description?: string;
    shuttleCount: number;
    courtCost: number;
    additionalCosts?: number;
    attendees: string[]; // Array of userIds
    notes?: string;
}

// Settings types
export interface ClubSettings {
    settingKey: string;
    value: string | number | boolean;
    updatedAt: string;
    updatedBy: string; // userId
}

export interface ClubConfiguration {
    defaultSessionDay: number; // 0 = Sunday, 1 = Monday, etc.
    defaultSessionTime: string; // HH:MM format
    defaultVenue: string;
    minimumPlayers: number;
    pollCreationDay: number; // Day of week to create poll
    pollCreationTime: string; // HH:MM format
    pollFreezeHours: number; // Hours before session to freeze poll
    reminderHours: number; // Hours before session to send reminders
    clubName: string;
    contactEmail: string;
    contactPhone?: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Lambda Event types
export interface AuthorizerEvent {
    type: string;
    authorizationToken: string;
    methodArn: string;
}

export interface AuthorizerContext {
    userId: string;
    email: string;
    role: string;
}

// DynamoDB types
export interface DynamoDBItem {
    [key: string]: any;
}

// Email/SMS types
export interface EmailTemplate {
    subject: string;
    htmlBody: string;
    textBody: string;
}

export interface NotificationData {
    recipientEmail: string;
    recipientPhone?: string;
    templateName: string;
    templateData: Record<string, any>;
}

// Utility types
export type Availability = 'available' | 'unavailable' | 'maybe';
export type UserRole = 'admin' | 'member';
export type PollStatus = 'active' | 'frozen' | 'cancelled' | 'completed';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';
export type UserStatus = 'active' | 'inactive' | 'pending';

// Error types
export interface AppError extends Error {
    statusCode: number;
    code: string;
}

export interface ValidationError extends AppError {
    field: string;
    value: any;
}

// Constants
export const POLL_STATUS = {
    ACTIVE: 'active' as const,
    FROZEN: 'frozen' as const,
    CANCELLED: 'cancelled' as const,
    COMPLETED: 'completed' as const,
};

export const USER_ROLES = {
    ADMIN: 'admin' as const,
    MEMBER: 'member' as const,
};

export const AVAILABILITY_OPTIONS = {
    AVAILABLE: 'available' as const,
    UNAVAILABLE: 'unavailable' as const,
    MAYBE: 'maybe' as const,
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;
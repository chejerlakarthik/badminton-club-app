export interface User {
  id: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  skillLevel?: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export type Availability = 'available' | 'unavailable' | 'tentative' | 'pending';

export interface PollResponse {
  memberId: number;
  availability: Availability;
  timestamp: Date;
}

export interface Poll {
  id: number;
  sessionDate: Date;
  createdAt: Date;
  freezeTime: Date;
  status: string;
  responses: PollResponse[];
}

export interface SessionExpense {
  id: number;
  sessionDate: Date;
  shuttles: number;
  courtCost: number;
  additionalCosts: number;
  attendees: number;
  perHeadCost: number;
  notes: string;
}

export interface InviteForm {
  email: string;
  phone: string;
  message: string;
}

export interface ExpenseForm {
  sessionDate: string;
  shuttles: string;
  courtCost: string;
  additionalCosts: string;
  notes: string;
}


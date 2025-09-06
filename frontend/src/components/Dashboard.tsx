import React, {JSX} from 'react';
import { UserPlus, DollarSign } from 'lucide-react';
import {Poll, Member, Availability} from '../types';
import PollCard from './PollCard';

interface DashboardProps {
  currentPoll: Poll | null;
  members: Member[];
  handleRSVP: (availability: Availability) => void;
  setShowInviteModal: (show: boolean) => void;
  setShowExpenseModal: (show: boolean) => void;
  isExpired: (date: Date) => boolean;
  getResponseSummary: () => { [key: string]: number };
  getAvailabilityIcon: (availability?: Availability) => JSX.Element;

}

const Dashboard: React.FC<DashboardProps> = ({ 
  currentPoll, 
  members, 
  handleRSVP, 
  setShowInviteModal, 
  setShowExpenseModal, 
  isExpired,
  getResponseSummary,
  getAvailabilityIcon
}) => (
  <div className="space-y-6">
    {currentPoll && (
      <PollCard 
        poll={currentPoll} 
        members={members} 
        handleRSVP={handleRSVP} 
        isExpired={isExpired} 
        getResponseSummary={getResponseSummary} 
        getAvailabilityIcon={getAvailabilityIcon}
      />
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={() => setShowInviteModal(true)}
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-3">
          <UserPlus className="w-8 h-8 text-indigo-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Invite New Player</div>
            <div className="text-sm text-gray-600">Send invitation via email or SMS</div>
          </div>
        </div>
      </button>
      <button
        onClick={() => setShowExpenseModal(true)}
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Add Session Expense</div>
            <div className="text-sm text-gray-600">Record shuttles and costs</div>
          </div>
        </div>
      </button>
    </div>
  </div>
);

export default Dashboard;


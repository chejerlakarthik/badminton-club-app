import React, {JSX} from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Poll, Member } from '../types';

interface PollCardProps {
  poll: Poll;
  members: Member[];
  handleRSVP: (availability: 'available' | 'unavailable' | 'maybe') => void;
  isExpired: (date: Date) => boolean;
  getResponseSummary: () => { [key: string]: number };
  getAvailabilityIcon: (availability?: string) => JSX.Element;
}

const PollCard: React.FC<PollCardProps> = ({ poll, members, handleRSVP, isExpired, getResponseSummary, getAvailabilityIcon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Weekly Session Poll</h2>
        <p className="text-sm text-gray-600">
          Session Date: {poll.sessionDate.toLocaleDateString('en-AU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
        </p>
        <p className="text-sm text-gray-600">
          Poll freezes: {poll.freezeTime.toLocaleDateString('en-AU')} at {poll.freezeTime.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        isExpired(poll.freezeTime)
          ? 'bg-red-100 text-red-800'
          : 'bg-green-100 text-green-800'
      }`}>
        {isExpired(poll.freezeTime) ? 'Frozen' : 'Active'}
      </div>
    </div>

    {!isExpired(poll.freezeTime) && (
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => handleRSVP('available')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Available</span>
        </button>
        <button
          onClick={() => handleRSVP('maybe')}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Maybe</span>
        </button>
        <button
          onClick={() => handleRSVP('unavailable')}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <XCircle className="w-4 h-4" />
          <span>Unavailable</span>
        </button>
      </div>
    )}

    <div className="grid grid-cols-4 gap-4 mb-6">
      {Object.entries(getResponseSummary()).map(([status, count]) => (
        <div key={status} className="text-center">
          <div className="text-2xl font-bold text-gray-900">{count}</div>
          <div className="text-sm text-gray-600 capitalize">{status}</div>
        </div>
      ))}
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900">Member Responses</h3>
      {members.map(member => {
        const response = poll.responses.find(r => r.memberId === member.id);
        return (
          <div key={member.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-900">{member.name}</span>
            <div className="flex items-center space-x-2">
              {getAvailabilityIcon(response?.availability)}
              <span className="text-sm text-gray-600 capitalize">
                {response?.availability || 'Pending'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PollCard;


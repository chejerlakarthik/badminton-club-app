import React from 'react';
import { X, Send } from 'lucide-react';
import { InviteForm } from '../types';

interface InviteModalProps {
  showInviteModal: boolean;
  setShowInviteModal: (show: boolean) => void;
  inviteForm: InviteForm;
  setInviteForm: (form: InviteForm) => void;
  handleInvite: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ showInviteModal, setShowInviteModal, inviteForm, setInviteForm, handleInvite }) => {
  if (!showInviteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Invite New Player</h3>
          <button
            onClick={() => setShowInviteModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="player@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
            <input
              type="tel"
              value={inviteForm.phone}
              onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+61400123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Personal Message (Optional)</label>
            <textarea
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Welcome to our badminton club!"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleInvite}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Send className="w-4 h-4" />
              <span>Send Invitation</span>
            </button>
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;


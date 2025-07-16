import React from 'react';
import { Bell } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BC</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Badminton Club</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="text-sm text-gray-700">{user.name}</div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;


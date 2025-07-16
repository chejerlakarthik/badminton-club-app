import React from 'react';
import { Calendar, Users, Settings, DollarSign } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Calendar },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'expenses', label: 'Expenses', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => (
  <nav className="bg-white border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-8">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 text-sm font-medium ${
              activeTab === id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  </nav>
);

export default Navigation;


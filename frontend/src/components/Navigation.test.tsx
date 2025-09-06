import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import Navigation from './Navigation';

const mockSetActiveTab = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test('renders navigation tabs', () => {
  render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Members')).toBeInTheDocument();
  expect(screen.getByText('Expenses')).toBeInTheDocument();
  expect(screen.getByText('Settings')).toBeInTheDocument();
});

test('highlights active tab', () => {
  const { container } = render(<Navigation activeTab="members" setActiveTab={mockSetActiveTab} />);
  
  // The active tab should have different styling
  const membersButton = screen.getByText('Members').closest('button');
  expect(membersButton).toHaveClass('text-indigo-600');
});

test('calls setActiveTab when tab is clicked', () => {
  render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
  
  fireEvent.click(screen.getByText('Members'));
  expect(mockSetActiveTab).toHaveBeenCalledWith('members');
  
  fireEvent.click(screen.getByText('Expenses'));
  expect(mockSetActiveTab).toHaveBeenCalledWith('expenses');
});

test('shows correct initial active state', () => {
  render(<Navigation activeTab="settings" setActiveTab={mockSetActiveTab} />);
  
  const settingsButton = screen.getByText('Settings').closest('button');
  expect(settingsButton).toHaveClass('text-indigo-600');
});

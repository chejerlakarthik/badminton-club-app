import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import Header from './Header';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'member' as const,
};

const mockOnLogout = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test('renders user information', () => {
  render(<Header user={mockUser} onLogout={mockOnLogout} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  // Email is not displayed in the Header component, only the name
});

test('renders logout button', () => {
  const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />);
  
  const logoutButton = container.querySelector('button');
  expect(logoutButton).toBeInTheDocument();
  expect(logoutButton?.textContent).toContain('Logout');
});

test('calls onLogout when logout button is clicked', () => {
  const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />);
  
  const logoutButton = container.querySelector('button');
  expect(logoutButton).toBeInTheDocument();
  
  if (logoutButton) {
    fireEvent.click(logoutButton);
  }
  
  expect(mockOnLogout).toHaveBeenCalledTimes(1);
});

test('renders badminton club title', () => {
  render(<Header user={mockUser} onLogout={mockOnLogout} />);
  
  expect(screen.getByText('Badminton Club')).toBeInTheDocument();
});

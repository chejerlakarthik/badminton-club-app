import { render, screen } from '@testing-library/react';
import { test, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock the fetch API for the auth token validation
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Reset localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
    writable: true,
  });
});

test('renders login form when user is not authenticated', () => {
  // Mock fetch to reject (no valid token)
  vi.mocked(fetch).mockRejectedValue(new Error('No token'));
  
  render(<App />);
  
  // Test for content that actually appears in the login state
  const loginTitle = screen.getByText('Badminton Club');
  const loginButton = screen.getByRole('button', { name: /login/i });
  const registerButton = screen.getByRole('button', { name: /register here/i });
  
  expect(loginTitle).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();
  expect(registerButton).toBeInTheDocument();
});

test('renders dashboard when user is authenticated', async () => {
  // Mock localStorage to have a token
  const mockToken = 'mock-jwt-token';
  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => mockToken),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
    writable: true,
  });
  
  // Mock successful auth response
  vi.mocked(fetch).mockResolvedValue({
    json: () => Promise.resolve({ user: mockUser }),
  } as Response);
  
  render(<App />);
  
  // Wait for auth check to complete and find dashboard content
  // The dashboard content will be rendered after the auth check
  await screen.findByText(/Weekly Session Poll/i, {}, { timeout: 1000 });
});

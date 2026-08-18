import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../src/app/login/page';
import * as firebaseAuth from 'firebase/auth';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    // never trigger for testing
    return () => {};
  }),
}));

// Provide a mock "auth" object that acts as truthy
vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null, name: 'mocked-auth' }
}));

vi.mock('../lib/userProfile', () => ({
  ensureUserProfile: vi.fn(),
}));

describe('LoginPage Error Path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays invalid email or password message when auth fails', async () => {
    // Mock the specific auth failure
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(
      new Error('auth/invalid-credential')
    );

    render(<LoginPage />);

    // Fill in email and password using best practices
    const emailInput = screen.getByPlaceholderText(/name@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // In our component, password label has an ID password which corresponds to placeholder "Enter password"
    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const signInButton = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    // Instead of clicking which might not submit if preventDefault is implicit, just trigger form submit directly
    const form = emailInput.closest('form');
    if (form) {
        fireEvent.submit(form);
    } else {
        fireEvent.click(signInButton);
    }

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password\./i)).toBeInTheDocument();
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../src/app/login/page';
import { signInWithPopup } from 'firebase/auth';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    onAuthStateChanged: vi.fn((auth, cb) => {
      // Don't auto-login immediately for testing form
      return () => {};
    }),
  };
});

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
}));

vi.mock('../lib/userProfile', () => ({
  ensureUserProfile: vi.fn(),
}));

describe('LoginPage Google Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays error message when Google sign-in fails', async () => {
    // Make signInWithPopup throw an error
    const mockError = new Error('Google sign-in failed.');
    vi.mocked(signInWithPopup).mockRejectedValueOnce(mockError);

    render(<LoginPage />);

    // Find and click the Google sign-in button
    const googleButton = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleButton);

    // Wait for the error message to appear in the UI
    await waitFor(() => {
      expect(screen.getByText('Google sign-in failed.')).toBeInTheDocument();
    });
  });
});

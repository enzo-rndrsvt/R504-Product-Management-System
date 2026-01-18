import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import * as api from '../../services/api';

jest.mock('../../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Page', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderLogin();

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have link to registration page', () => {
      renderLogin();

      const registerLink = screen.getByRole('link', { name: /create one/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should render username and password inputs with correct attributes', () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('placeholder', 'Enter your username');
      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(usernameInput).toBeRequired();

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Form Input', () => {
    it('should update username field on input', () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(usernameInput).toHaveValue('testuser');
    });

    it('should update password field on input', () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });

    it('should clear error message when typing in username field', () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Trigger validation error
      fireEvent.click(submitButton);
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();

      // Type in username field
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument();
    });

    it('should clear error message when typing in password field', () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill username but not password
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(submitButton);
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();

      // Type in password field
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when username is empty', () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(api.loginUser).not.toHaveBeenCalled();
    });

    it('should show error when username is only whitespace', () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: '   ' } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(api.loginUser).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(api.loginUser).not.toHaveBeenCalled();
    });
  });

  describe('Successful Login', () => {
    it('should call loginUser API with correct credentials', async () => {
      api.loginUser.mockResolvedValueOnce({ token: 'fake-token', user: { id: 1, username: 'testuser' } });
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.loginUser).toHaveBeenCalledWith('testuser', 'password123');
      });
    });

    it('should call onLogin callback after successful login', async () => {
      api.loginUser.mockResolvedValueOnce({ token: 'fake-token', user: { id: 1, username: 'testuser' } });
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledTimes(1);
      });
    });

    it('should navigate to products page after successful login', async () => {
      api.loginUser.mockResolvedValueOnce({ token: 'fake-token', user: { id: 1, username: 'testuser' } });
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/products');
      });
    });

    it('should show loading state during login', async () => {
      api.loginUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ token: 'fake-token' }), 100))
      );
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByRole('button', { name: /signing in\.\.\./i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in\.\.\./i })).toBeDisabled();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/products');
      });
    });

    it('should disable inputs during login', async () => {
      api.loginUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ token: 'fake-token' }), 100))
      );
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/products');
      });
    });
  });

  describe('Failed Login', () => {
    it('should display error message when login fails with error object', async () => {
      api.loginUser.mockRejectedValueOnce({ error: 'Invalid credentials' });
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should display default error message when login fails without error object', async () => {
      api.loginUser.mockRejectedValueOnce({});
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should re-enable form after failed login', async () => {
      api.loginUser.mockRejectedValueOnce({ error: 'Invalid credentials' });
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      expect(usernameInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent(/sign in/i);
    });

    it('should allow retry after failed login', async () => {
      api.loginUser
        .mockRejectedValueOnce({ error: 'Invalid credentials' })
        .mockResolvedValueOnce({ token: 'fake-token', user: { id: 1, username: 'testuser' } });

      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First attempt - fail
      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Second attempt - success
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/products');
      });

      expect(api.loginUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderLogin();

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge Cases', () => {
    it('should trim whitespace from username before validation', () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: '  ' } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });

    it('should handle special characters in username', async () => {
      api.loginUser.mockResolvedValueOnce({ token: 'fake-token' });
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(usernameInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.loginUser).toHaveBeenCalledWith('user@test.com', 'password123');
      });
    });

    it('should handle very long passwords', async () => {
      api.loginUser.mockResolvedValueOnce({ token: 'fake-token' });
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      const longPassword = 'a'.repeat(100);
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: longPassword } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.loginUser).toHaveBeenCalledWith('testuser', longPassword);
      });
    });
  });
});

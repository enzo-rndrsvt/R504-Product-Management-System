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
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );
  };

  it('should render login form', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should update form fields on input', () => {
    renderLogin();
    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('should call loginUser on form submit with valid credentials', async () => {
    api.loginUser.mockResolvedValue({ token: 'mockToken' });
    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockOnLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('should display error message on login failure', async () => {
    api.loginUser.mockRejectedValue({ error: 'Invalid credentials' });
    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should have link to register page', () => {
    renderLogin();
    const registerLink = screen.getByRole('link', { name: /create one/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should handle generic error', async () => {
    api.loginUser.mockRejectedValue({});
    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
    });
  });

  it('should show error when username is missing', async () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
  });

  it('should show error when password is missing', async () => {
    renderLogin();
    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    api.loginUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ token: 'mockToken' }), 100))
    );
    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });
});

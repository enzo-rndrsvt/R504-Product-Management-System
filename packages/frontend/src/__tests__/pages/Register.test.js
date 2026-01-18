import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../pages/Register';
import * as api from '../../services/api';

jest.mock('../../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Register />
      </BrowserRouter>
    );
  };

  it('should render registration form', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/John/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Doe/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min\. 3 characters/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should update form fields on input', () => {
    renderRegister();
    const firstnameInput = screen.getByPlaceholderText(/John/);
    const lastnameInput = screen.getByPlaceholderText(/Doe/);
    const usernameInput = screen.getByPlaceholderText(/min\. 3 characters/i);
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });

    expect(firstnameInput.value).toBe('John');
    expect(lastnameInput.value).toBe('Doe');
    expect(usernameInput.value).toBe('johndoe');
    expect(passwordInput.value).toBe('Password123');
    expect(confirmPasswordInput.value).toBe('Password123');
  });

  it('should call registerUser on form submit with valid data', async () => {
    api.registerUser.mockResolvedValue({ token: 'mockToken' });
    renderRegister();

    const firstnameInput = screen.getByPlaceholderText(/John/);
    const lastnameInput = screen.getByPlaceholderText(/Doe/);
    const usernameInput = screen.getByPlaceholderText(/min\. 3 characters/i);
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        password: 'Password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('should display error message on registration failure', async () => {
    api.registerUser.mockRejectedValue({
      response: { data: { error: 'Username already exists' } }
    });
    renderRegister();

    const firstnameInput = screen.getByPlaceholderText(/John/);
    const lastnameInput = screen.getByPlaceholderText(/Doe/);
    const usernameInput = screen.getByPlaceholderText(/min\. 3 characters/i);
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('should have link to login page', () => {
    renderRegister();
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should handle generic registration error', async () => {
    api.registerUser.mockRejectedValue({});
    renderRegister();

    const firstnameInput = screen.getByPlaceholderText(/John/);
    const lastnameInput = screen.getByPlaceholderText(/Doe/);
    const usernameInput = screen.getByPlaceholderText(/min\. 3 characters/i);
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  it('should show password requirements when password field is focused', () => {
    renderRegister();
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0];

    fireEvent.focus(passwordInput);
    expect(screen.getByText(/Password must contain:/i)).toBeInTheDocument();
  });

  it('should validate password confirmation matches', async () => {
    renderRegister();
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordInputs[0], { target: { value: 'Password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123' } });
    fireEvent.blur(passwordInputs[1]);

    await waitFor(() => {
      expect(screen.getByText(/Passwords match/i)).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    renderRegister();
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    const firstnameInput = screen.getByPlaceholderText(/John/);
    const lastnameInput = screen.getByPlaceholderText(/Doe/);
    const usernameInput = screen.getByPlaceholderText(/min\. 3 characters/i);

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123' } });
    fireEvent.blur(passwordInputs[0]);
    fireEvent.change(passwordInputs[1], { target: { value: 'DifferentPass456' } });
    fireEvent.blur(passwordInputs[1]);
    // Submit to trigger validation
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});

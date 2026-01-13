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
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('johndoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should update form fields on input', () => {
    renderRegister();
    const firstnameInput = screen.getByPlaceholderText('John');
    const lastnameInput = screen.getByPlaceholderText('Doe');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(firstnameInput.value).toBe('John');
    expect(lastnameInput.value).toBe('Doe');
    expect(usernameInput.value).toBe('johndoe');
    expect(passwordInput.value).toBe('password123');
  });

  it('should call registerUser on form submit', async () => {
    api.registerUser.mockResolvedValue({ token: 'mockToken' });
    renderRegister();

    const firstnameInput = screen.getByPlaceholderText('John');
    const lastnameInput = screen.getByPlaceholderText('Doe');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('should display error message on registration failure', async () => {
    api.registerUser.mockRejectedValue({
      response: { data: { error: 'Username already exists' } }
    });
    renderRegister();

    const firstnameInput = screen.getByPlaceholderText('John');
    const lastnameInput = screen.getByPlaceholderText('Doe');
    const usernameInput = screen.getByPlaceholderText('johndoe');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstnameInput, { target: { value: 'John' } });
    fireEvent.change(lastnameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
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

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });
});

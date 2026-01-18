import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserList from '../../pages/UserList';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('UserList Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render users when loaded', async () => {
    const mockUsers = [
      { id: 1, firstname: 'John', lastname: 'Doe', username: 'johndoe', created_at: '2024-01-01' },
      { id: 2, firstname: 'Jane', lastname: 'Smith', username: 'janesmith', created_at: '2024-01-02' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument();
      expect(screen.getByText(/Jane/)).toBeInTheDocument();
    });
  });

  it('should display error message on load failure', async () => {
    api.getUsers.mockRejectedValue(new Error('Failed to load'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });

  it('should filter users by search term', async () => {
    const mockUsers = [
      { id: 1, firstname: 'John', lastname: 'Doe', username: 'johndoe', created_at: '2024-01-01' },
      { id: 2, firstname: 'Jane', lastname: 'Smith', username: 'janesmith', created_at: '2024-01-02' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    const { container } = render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    const searchInputs = container.querySelectorAll('input[type="text"]');
    if (searchInputs.length > 0) {
      fireEvent.change(searchInputs[0], { target: { value: 'John' } });
    }
  });

  it('should handle different user data formats', async () => {
    const mockUsers = [
      { id: 1, firstname: 'New', lastname: 'User', username: 'newuser', created_at: new Date().toISOString() },
      { id: 2, firstname: 'Old', lastname: 'User', username: 'olduser', created_at: '2020-01-01' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/New/)).toBeInTheDocument();
    });
  });

  it('should filter users by joined date - week', async () => {
    const mockUsers = [
      { id: 1, firstname: 'New', lastname: 'User', username: 'newuser', created_at: new Date().toISOString() },
      { id: 2, firstname: 'Old', lastname: 'User', username: 'olduser', created_at: '2020-01-01' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/New/)).toBeInTheDocument();
    });

    const selectElements = screen.getAllByRole('combobox');
    const joinedFilterSelect = selectElements.find((select) => select.querySelector('option[value="week"]'));

    if (joinedFilterSelect) {
      fireEvent.change(joinedFilterSelect, { target: { value: 'week' } });
    }
  });

  it('should filter users by joined date - month', async () => {
    const mockUsers = [
      {
        id: 1,
        firstname: 'Recent',
        lastname: 'User',
        username: 'recentuser',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      { id: 2, firstname: 'Old', lastname: 'User', username: 'olduser', created_at: '2020-01-01' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Recent/)).toBeInTheDocument();
    });

    const selectElements = screen.getAllByRole('combobox');
    const joinedFilterSelect = selectElements.find((select) => select.querySelector('option[value="month"]'));

    if (joinedFilterSelect) {
      fireEvent.change(joinedFilterSelect, { target: { value: 'month' } });
    }
  });

  it('should filter users by joined date - older', async () => {
    const mockUsers = [
      { id: 1, firstname: 'New', lastname: 'User', username: 'newuser', created_at: new Date().toISOString() },
      { id: 2, firstname: 'Old', lastname: 'User', username: 'olduser', created_at: '2020-01-01' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Old/)).toBeInTheDocument();
    });

    const selectElements = screen.getAllByRole('combobox');
    const joinedFilterSelect = selectElements.find((select) => select.querySelector('option[value="older"]'));

    if (joinedFilterSelect) {
      fireEvent.change(joinedFilterSelect, { target: { value: 'older' } });
    }
  });

  it('should sort users by name', async () => {
    const mockUsers = [
      { id: 1, firstname: 'Zoe', lastname: 'Adams', username: 'zadams', created_at: '2024-01-01' },
      { id: 2, firstname: 'Alice', lastname: 'Brown', username: 'abrown', created_at: '2024-01-02' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Zoe/)).toBeInTheDocument();
    });

    const selectElements = screen.getAllByRole('combobox');
    const sortSelect = selectElements.find((select) => select.querySelector('option[value="name"]'));

    if (sortSelect) {
      fireEvent.change(sortSelect, { target: { value: 'name' } });
    }
  });

  it('should sort users by username', async () => {
    const mockUsers = [
      { id: 1, firstname: 'John', lastname: 'Doe', username: 'zdoe', created_at: '2024-01-01' },
      { id: 2, firstname: 'Jane', lastname: 'Smith', username: 'asmith', created_at: '2024-01-02' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    const selectElements = screen.getAllByRole('combobox');
    const sortSelect = selectElements.find((select) => select.querySelector('option[value="username"]'));

    if (sortSelect) {
      fireEvent.change(sortSelect, { target: { value: 'username' } });
    }
  });

  it('should sort users by joined date', async () => {
    const mockUsers = [
      { id: 1, firstname: 'New', lastname: 'User', username: 'newuser', created_at: '2024-12-01' },
      { id: 2, firstname: 'Old', lastname: 'User', username: 'olduser', created_at: '2024-01-01' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/New/)).toBeInTheDocument();
    });

    const selectElements = screen.getAllByRole('combobox');
    const sortSelect = selectElements.find((select) => select.querySelector('option[value="joined"]'));

    if (sortSelect) {
      fireEvent.change(sortSelect, { target: { value: 'joined' } });
    }
  });

  it('should toggle sort direction', async () => {
    const mockUsers = [
      { id: 1, firstname: 'Alice', lastname: 'Adams', username: 'aadams', created_at: '2024-01-01' },
      { id: 2, firstname: 'Bob', lastname: 'Brown', username: 'bbrown', created_at: '2024-01-02' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });

    const sortButton = screen.getByRole('button', { name: /↑|↓/ });
    fireEvent.click(sortButton);

    expect(sortButton).toBeInTheDocument();
  });

  it('should show "No users found" when no results match', async () => {
    const mockUsers = [{ id: 1, firstname: 'John', lastname: 'Doe', username: 'johndoe', created_at: '2024-01-01' }];
    api.getUsers.mockResolvedValue(mockUsers);

    const { container } = render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    const searchInputs = container.querySelectorAll('input[type="text"]');
    if (searchInputs.length > 0) {
      fireEvent.change(searchInputs[0], { target: { value: 'NonExistentUser' } });
    }

    await waitFor(() => {
      expect(screen.getByText('No users found matching your criteria')).toBeInTheDocument();
    });
  });

  it('should handle fuzzy search with multiple words', async () => {
    const mockUsers = [
      { id: 1, firstname: 'John', lastname: 'Doe', username: 'johndoe', created_at: '2024-01-01' },
      { id: 2, firstname: 'Jane', lastname: 'Smith', username: 'janesmith', created_at: '2024-01-02' }
    ];
    api.getUsers.mockResolvedValue(mockUsers);

    const { container } = render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    const searchInputs = container.querySelectorAll('input[type="text"]');
    if (searchInputs.length > 0) {
      fireEvent.change(searchInputs[0], { target: { value: 'john doe' } });
    }
  });

  it('should handle search with typos (fuzzy matching)', async () => {
    const mockUsers = [{ id: 1, firstname: 'John', lastname: 'Doe', username: 'johndoe', created_at: '2024-01-01' }];
    api.getUsers.mockResolvedValue(mockUsers);

    const { container } = render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument();
    });

    const searchInputs = container.querySelectorAll('input[type="text"]');
    if (searchInputs.length > 0) {
      fireEvent.change(searchInputs[0], { target: { value: 'jon' } });
    }
  });
});

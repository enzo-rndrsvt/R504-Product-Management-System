import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoriesList from '../../pages/CategoriesList';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('CategoriesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getCategories.mockResolvedValue([
      { id: 1, name: 'Electronics', description: 'Electronic devices' },
      { id: 2, name: 'Clothing', description: 'Apparel and fashion' }
    ]);
  });

  it('should render categories list page', async () => {
    render(<CategoriesList />);

    expect(screen.getByText('Manage your product categories')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Add New Category/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
    });
  });

  it('should fetch categories on mount', async () => {
    render(<CategoriesList />);

    await waitFor(() => {
      expect(api.getCategories).toHaveBeenCalled();
    });
  });

  it('should display empty state when no categories exist', async () => {
    api.getCategories.mockResolvedValueOnce([]);

    render(<CategoriesList />);

    await waitFor(() => {
      expect(screen.getByText(/No categories yet/i)).toBeInTheDocument();
    });
  });

  it('should add a new category', async () => {
    api.createCategory.mockResolvedValueOnce({ id: 3, name: 'Sports', description: '' });
    api.getCategories.mockResolvedValueOnce([
      { id: 1, name: 'Electronics', description: 'Electronic devices' },
      { id: 2, name: 'Clothing', description: 'Apparel and fashion' },
      { id: 3, name: 'Sports', description: '' }
    ]);

    render(<CategoriesList />);

    const input = screen.getByPlaceholderText(/e.g., Electronics/i);
    fireEvent.change(input, { target: { value: 'Sports' } });

    const button = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.createCategory).toHaveBeenCalledWith({
        name: 'Sports',
        description: ''
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Category added successfully!')).toBeInTheDocument();
    });
  });

  it('should show error if category name is empty', async () => {
    render(<CategoriesList />);

    const button = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Category name is required/i)).toBeInTheDocument();
    });
  });

  it('should delete a category', async () => {
    render(<CategoriesList />);

    await waitFor(() => {
      expect(screen.getByText('Clothing')).toBeInTheDocument();
    });

    api.deleteCategory.mockResolvedValueOnce({ success: true });
    api.getCategories.mockResolvedValueOnce([{ id: 2, name: 'Clothing', description: 'Apparel and fashion' }]);

    window.confirm = jest.fn(() => true);
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.deleteCategory).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Category deleted successfully!')).toBeInTheDocument();
    });
  });

  it('should show error on delete failure', async () => {
    api.deleteCategory.mockRejectedValueOnce(new Error('Delete failed'));

    render(<CategoriesList />);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    window.confirm = jest.fn(() => true);
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete category')).toBeInTheDocument();
    });
  });

  it('should handle create category error', async () => {
    api.createCategory.mockRejectedValueOnce({ error: 'Category name already exists' });

    render(<CategoriesList />);

    const input = screen.getByPlaceholderText(/e.g., Electronics/i);
    fireEvent.change(input, { target: { value: 'Electronics' } });

    const button = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Category name already exists')).toBeInTheDocument();
    });
  });

  it('should display category description', async () => {
    render(<CategoriesList />);

    await waitFor(() => {
      expect(screen.getByText('Electronic devices')).toBeInTheDocument();
      expect(screen.getByText('Apparel and fashion')).toBeInTheDocument();
    });
  });

  it('should add category with description', async () => {
    api.createCategory.mockResolvedValueOnce({
      id: 3,
      name: 'Sports',
      description: 'Sports equipment'
    });
    api.getCategories.mockResolvedValueOnce([
      { id: 1, name: 'Electronics', description: 'Electronic devices' },
      { id: 2, name: 'Clothing', description: 'Apparel and fashion' },
      { id: 3, name: 'Sports', description: 'Sports equipment' }
    ]);

    render(<CategoriesList />);

    const nameInput = screen.getByPlaceholderText(/e.g., Electronics/i);
    const descInput = screen.getByPlaceholderText(/Describe this category/i);

    fireEvent.change(nameInput, { target: { value: 'Sports' } });
    fireEvent.change(descInput, { target: { value: 'Sports equipment' } });

    const button = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.createCategory).toHaveBeenCalledWith({
        name: 'Sports',
        description: 'Sports equipment'
      });
    });
  });
});

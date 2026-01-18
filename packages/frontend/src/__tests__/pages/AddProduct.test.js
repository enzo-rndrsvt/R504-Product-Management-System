import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddProduct from '../../pages/AddProduct';
import * as api from '../../services/api';

jest.mock('../../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AddProduct Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getCategories.mockResolvedValue([]);
  });

  const renderAddProduct = () => {
    return render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AddProduct />
      </BrowserRouter>
    );
  };

  it('should render add product form', () => {
    renderAddProduct();
    expect(screen.getByRole('heading', { name: /add new product/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
  });

  it('should update form fields on input', () => {
    renderAddProduct();
    const nameInput = screen.getByPlaceholderText('e.g., Wireless Mouse');
    const priceInput = screen.getByPlaceholderText('0.00');
    const stockInput = screen.getByPlaceholderText('0');

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(stockInput, { target: { value: '10' } });

    expect(nameInput.value).toBe('Test Product');
    expect(priceInput.value).toBe('99.99');
    expect(stockInput.value).toBe('10');
  });

  it('should show error when fields are empty', async () => {
    renderAddProduct();
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('All fields are required!')).toBeInTheDocument();
    });
  });

  it('should call createProduct on form submit with valid data', async () => {
    api.createProduct.mockResolvedValue({ id: 1 });
    renderAddProduct();

    const nameInput = screen.getByPlaceholderText('e.g., Wireless Mouse');
    const priceInput = screen.getByPlaceholderText('0.00');
    const stockInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(stockInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: 'Test Product',
        price: '99.99',
        stock: '10',
        category_id: null
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('should display error message on product creation failure', async () => {
    api.createProduct.mockRejectedValue({
      response: { data: { error: 'Product creation failed' } }
    });
    renderAddProduct();

    const nameInput = screen.getByPlaceholderText('e.g., Wireless Mouse');
    const priceInput = screen.getByPlaceholderText('0.00');
    const stockInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(stockInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Product creation failed')).toBeInTheDocument();
    });
  });

  it('should handle generic error', async () => {
    api.createProduct.mockRejectedValue({});
    renderAddProduct();

    const nameInput = screen.getByPlaceholderText('e.g., Wireless Mouse');
    const priceInput = screen.getByPlaceholderText('0.00');
    const stockInput = screen.getByPlaceholderText('0');
    const submitButton = screen.getByRole('button', { name: /add product/i });

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(stockInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create product')).toBeInTheDocument();
    });
  });
});

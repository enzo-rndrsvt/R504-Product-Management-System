import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductList from '../../pages/ProductList';
import * as api from '../../services/api';

jest.mock('../../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('ProductList Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getCategories.mockResolvedValue([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Home & Garden' },
      { id: 4, name: 'Sports' }
    ]);
  });

  const renderProductList = () => {
    return render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProductList />
      </BrowserRouter>
    );
  };

  const createMockProducts = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      price: 50 + i * 10,
      stock: 10 + i,
      category_id: (i % 4) + 1,
      category_name: ['Electronics', 'Clothing', 'Home & Garden', 'Sports'][i % 4]
    }));
  };

  describe('Rendering', () => {
    it('should render page header with title and add button', async () => {
      api.getProducts.mockResolvedValue([]);

      renderProductList();

      expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();
      expect(screen.getByText(/manage your product inventory/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
    });

    it('should render search input', async () => {
      api.getProducts.mockResolvedValue([]);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search products by name/i)).toBeInTheDocument();
      });
    });

    it('should render all filter selects', async () => {
      api.getProducts.mockResolvedValue([]);

      renderProductList();

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('Loading Products', () => {
    it('should render products when loaded', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100, stock: 10, category_id: 1 },
        { id: 2, name: 'Product 2', price: 200, stock: 5, category_id: 2 }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
      });
    });

    it('should display error message on load failure', async () => {
      api.getProducts.mockRejectedValue(new Error('Failed to load'));

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Failed to load products')).toBeInTheDocument();
      });
    });

    it('should display product prices correctly', async () => {
      const mockProducts = [{ id: 1, name: 'Laptop', price: 999.99, stock: 10, category_id: 1 }];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument();
      });
    });

    it('should display stock status correctly', async () => {
      const mockProducts = [
        { id: 1, name: 'OutOfStock Product', price: 100, stock: 0, category_id: 1 },
        { id: 2, name: 'LowStock Product', price: 100, stock: 5, category_id: 1 },
        { id: 3, name: 'Available Product', price: 100, stock: 20, category_id: 1 }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('OutOfStock Product')).toBeInTheDocument();
        expect(screen.getByText('LowStock Product')).toBeInTheDocument();
        expect(screen.getByText('Available Product')).toBeInTheDocument();
      });

      // Check that all status badges are rendered correctly
      const statusSpans = screen.getAllByText(/remaining|in stock/i);
      expect(statusSpans.length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('should filter products by search term with debounce', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', price: 999, stock: 10, category_id: 1 },
        { id: 2, name: 'Phone', price: 499, stock: 15, category_id: 1 }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Phone')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search products by name/i);
      fireEvent.change(searchInput, { target: { value: 'Laptop' } });

      await waitFor(
        () => {
          expect(screen.getByText('Laptop')).toBeInTheDocument();
          expect(screen.queryByText('Phone')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('should show clear button when search has value', async () => {
      api.getProducts.mockResolvedValue([]);

      renderProductList();

      const searchInput = screen.getByPlaceholderText(/search products by name/i);

      expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      api.getProducts.mockResolvedValue([]);

      renderProductList();

      const searchInput = screen.getByPlaceholderText(/search products by name/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('test');
      });

      const clearButton = screen.getByLabelText(/clear search/i);
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('should display result count when searching', async () => {
      const mockProducts = createMockProducts(15);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search products by name/i);
      fireEvent.change(searchInput, { target: { value: 'Product 1' } });

      await waitFor(
        () => {
          expect(screen.getByText(/found.*result/i)).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });

  describe('Filter Functionality', () => {
    it('should filter products by category', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', price: 999, stock: 10, category_id: 1, category_name: 'Electronics' },
        { id: 2, name: 'Shirt', price: 49, stock: 15, category_id: 2, category_name: 'Clothing' }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Shirt')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[1]; // Category select is second
      fireEvent.change(categorySelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.queryByText('Shirt')).not.toBeInTheDocument();
      });
    });

    it('should filter products by price range', async () => {
      const mockProducts = [
        { id: 1, name: 'Cheap', price: 30, stock: 10, category_id: 1 },
        { id: 2, name: 'Medium', price: 75, stock: 10, category_id: 1 },
        { id: 3, name: 'Expensive', price: 150, stock: 5, category_id: 1 }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Cheap')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Expensive')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const priceSelect = selects[2]; // Price select is third
      fireEvent.change(priceSelect, { target: { value: 'low' } });

      await waitFor(() => {
        expect(screen.getByText('Cheap')).toBeInTheDocument();
        expect(screen.queryByText('Medium')).not.toBeInTheDocument();
        expect(screen.queryByText('Expensive')).not.toBeInTheDocument();
      });
    });

    it('should filter products by stock level', async () => {
      const mockProducts = [
        { id: 1, name: 'Out of Stock Item', price: 100, stock: 0, category_id: 1 },
        { id: 2, name: 'Low Stock Item', price: 100, stock: 5, category_id: 1 },
        { id: 3, name: 'Available Item', price: 100, stock: 20, category_id: 1 }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Out of Stock Item')).toBeInTheDocument();
        expect(screen.getByText('Low Stock Item')).toBeInTheDocument();
        expect(screen.getByText('Available Item')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const stockSelect = selects[3]; // Stock select is fourth
      fireEvent.change(stockSelect, { target: { value: 'low' } });

      await waitFor(() => {
        expect(screen.queryByText('Out of Stock Item')).not.toBeInTheDocument();
        expect(screen.getByText('Low Stock Item')).toBeInTheDocument();
        expect(screen.queryByText('Available Item')).not.toBeInTheDocument();
      });
    });

    it('should show clear filters button when filters are active', async () => {
      const mockProducts = createMockProducts(10);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      expect(screen.queryByText(/clear all filters/i)).not.toBeInTheDocument();

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[1];
      fireEvent.change(categorySelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button is clicked', async () => {
      const mockProducts = createMockProducts(10);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[1];
      fireEvent.change(categorySelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByText(/clear all filters/i);
      fireEvent.click(clearButton);

      expect(categorySelect).toHaveValue('all');
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort products by name ascending', async () => {
      const mockProducts = [
        { id: 1, name: 'Zebra', price: 100, stock: 10, category_id: 1 },
        { id: 2, name: 'Apple', price: 100, stock: 10, category_id: 1 },
        { id: 3, name: 'Mango', price: 100, stock: 10, category_id: 1 }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        const products = screen.getAllByText(/Apple|Mango|Zebra/);
        expect(products[0]).toHaveTextContent('Apple');
      });
    });

    it('should sort products by price', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 300, stock: 10, category_id: 1 },
        { id: 2, name: 'Product 2', price: 100, stock: 10, category_id: 1 },
        { id: 3, name: 'Product 3', price: 200, stock: 10, category_id: 1 }
      ];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const sortSelect = selects[4]; // Sort select is fifth
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      await waitFor(() => {
        const prices = screen.getAllByText(/\$\d+\.\d{2}/);
        expect(prices[0]).toHaveTextContent('$100.00');
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when products exceed items per page', async () => {
      const mockProducts = createMockProducts(25);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText(/showing.*to.*of.*products/i)).toBeInTheDocument();
        expect(screen.getByText(/previous/i)).toBeInTheDocument();
        expect(screen.getByText(/next/i)).toBeInTheDocument();
      });
    });

    it('should not display pagination when products are less than items per page', async () => {
      const mockProducts = createMockProducts(5);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      expect(screen.queryByText(/previous/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/next/i)).not.toBeInTheDocument();
    });

    it('should navigate to next page when next button is clicked', async () => {
      const mockProducts = createMockProducts(25);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 12/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByText(/next/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/showing 13 to 24/i)).toBeInTheDocument();
      });
    });

    it('should navigate to previous page when previous button is clicked', async () => {
      const mockProducts = createMockProducts(25);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 12/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByText(/next/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/showing 13 to 24/i)).toBeInTheDocument();
      });

      const prevButton = screen.getByText(/previous/i);
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 12/i)).toBeInTheDocument();
      });
    });

    it('should disable previous button on first page', async () => {
      const mockProducts = createMockProducts(25);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        const prevButton = screen.getByText(/previous/i).closest('button');
        expect(prevButton).toBeDisabled();
      });
    });

    it('should disable next button on last page', async () => {
      const mockProducts = createMockProducts(25);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 12/i)).toBeInTheDocument();
      });

      // Navigate to last page
      const pageButtons = screen.getAllByRole('button').filter((btn) => /^\d+$/.test(btn.textContent));
      const lastPageButton = pageButtons[pageButtons.length - 1];
      fireEvent.click(lastPageButton);

      await waitFor(() => {
        const nextButton = screen.getByText(/next/i).closest('button');
        expect(nextButton).toBeDisabled();
      });
    });

    it('should change items per page', async () => {
      const mockProducts = createMockProducts(25);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 12/i)).toBeInTheDocument();
      });

      const perPageSelects = screen.getAllByRole('combobox');
      const perPageSelect = perPageSelects[0]; // Items per page select is first

      fireEvent.change(perPageSelect, { target: { value: '24' } });

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 24/i)).toBeInTheDocument();
      });
    });

    it('should reset to page 1 when filters change', async () => {
      const mockProducts = createMockProducts(30);
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText(/showing 1 to 12/i)).toBeInTheDocument();
      });

      // Go to page 2
      const nextButton = screen.getByText(/next/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/showing 13 to 24/i)).toBeInTheDocument();
      });

      // Change filter
      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[1];
      fireEvent.change(categorySelect, { target: { value: '1' } });

      // Should be back on page 1
      await waitFor(() => {
        expect(screen.getByText(/showing 1 to/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no products exist', async () => {
      api.getProducts.mockResolvedValue([]);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText(/no products found/i)).toBeInTheDocument();
        expect(screen.getByText(/create your first product/i)).toBeInTheDocument();
      });
    });

    it('should show empty state with filter message when no results match filters', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1', price: 100, stock: 10, category_id: 1 }];
      api.getProducts.mockResolvedValue(mockProducts);

      renderProductList();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search products by name/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      await waitFor(
        () => {
          expect(screen.getByText(/no products found/i)).toBeInTheDocument();
          expect(screen.getByText(/try adjusting your search or filters/i)).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });
});

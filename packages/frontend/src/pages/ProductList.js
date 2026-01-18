import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [priceFilter, setPriceFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Debounced search handler
  useEffect(() => {
    setIsSearching(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceFilter, stockFilter, categoryFilter, sortBy]);

  const filteredProducts = useMemo(() => {
    // Search filter
    let filtered = products.filter((product) => {
      if (!searchTerm) return true;
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Price filter
    filtered = filtered.filter((product) => {
      if (priceFilter === 'all') return true;
      const price = parseFloat(product.price);
      switch (priceFilter) {
        case 'low':
          return price < 50;
        case 'medium':
          return price >= 50 && price < 100;
        case 'high':
          return price >= 100;
        default:
          return true;
      }
    });

    // Stock filter
    filtered = filtered.filter((product) => {
      if (stockFilter === 'all') return true;
      const stock = parseInt(product.stock);
      switch (stockFilter) {
        case 'out':
          return stock === 0;
        case 'low':
          return stock > 0 && stock < 10;
        case 'available':
          return stock >= 10;
        default:
          return true;
      }
    });

    // Category filter
    filtered = filtered.filter((product) => {
      if (categoryFilter === 'all') return true;
      return product.category_id && product.category_id.toString() === categoryFilter;
    });

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'stock-asc':
          return parseInt(a.stock) - parseInt(b.stock);
        case 'stock-desc':
          return parseInt(b.stock) - parseInt(a.stock);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchTerm, priceFilter, stockFilter, categoryFilter, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="mt-2 text-neutral-600">Manage your product inventory</p>
        </div>
        <Link to="/add-product">
          <button className="btn-secondary flex items-center gap-2 px-6 py-2.5 font-semibold">
            <span>+</span> Add Product
          </button>
        </Link>
      </div>

      <div className="card mb-6 shadow-md">
        <div className="mb-4 flex flex-col gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="size-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field w-full pl-12 pr-10"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 transition-colors hover:text-neutral-600"
                aria-label="Clear search"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="size-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600"></div>
              </div>
            )}
          </div>
          {searchInput && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>
                Found {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="select-field py-1 text-sm"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-neutral-600">per page</span>
          </div>
          <div className="text-sm text-neutral-600">
            Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredProducts.length)}{' '}
            of {filteredProducts.length} products
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg className="size-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-semibold text-neutral-700">Filters</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-field">
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="select-field">
              <option value="all">All Prices</option>
              <option value="low">Low (&lt; $50)</option>
              <option value="medium">Medium ($50 - $100)</option>
              <option value="high">High (&gt; $100)</option>
            </select>

            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="select-field">
              <option value="all">All Stock Levels</option>
              <option value="out">Out of Stock</option>
              <option value="low">Low Stock (&lt; 10)</option>
              <option value="available">Available (≥ 10)</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select-field">
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>
          </div>

          {(categoryFilter !== 'all' || priceFilter !== 'all' || stockFilter !== 'all') && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setPriceFilter('all');
                  setStockFilter('all');
                }}
                className="text-sm text-primary-600 transition-colors hover:text-primary-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-12 text-center">
          <p className="text-lg text-neutral-600">No products found</p>
          {searchTerm || categoryFilter !== 'all' || priceFilter !== 'all' || stockFilter !== 'all' ? (
            <p className="mt-2 text-neutral-500">Try adjusting your search or filters</p>
          ) : (
            <Link to="/add-product">
              <button className="btn-primary mt-4">Create your first product</button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="card group cursor-pointer transition-all hover:shadow-lg">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="pr-2 text-lg font-bold text-neutral-900">{product.name}</h3>
                    {product.category_name && (
                      <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {product.category_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 border-t border-neutral-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">Price</span>
                    <span className="text-lg font-bold text-primary-600">${parseFloat(product.price).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">Stock</span>
                    <div className="status-badge">
                      {product.stock === 0 ? (
                        <>
                          <span className="status-unavailable">Out of Stock</span>
                          <span className="status-dot" />
                        </>
                      ) : product.stock < 10 ? (
                        <>
                          <span className="status-low">{product.stock} remaining</span>
                          <span className="status-dot" />
                        </>
                      ) : (
                        <>
                          <span className="status-available">{product.stock} in stock</span>
                          <span className="status-dot" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {product.stock === 0 && (
                  <div className="badge badge-danger mt-3 w-full justify-center">Out of Stock</div>
                )}
                {product.stock > 0 && product.stock < 10 && (
                  <div className="badge badge-accent mt-3 w-full justify-center">Low Stock</div>
                )}
                {product.stock >= 10 && (
                  <div className="badge badge-secondary mt-3 w-full justify-center">Available</div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="card mt-6 shadow-md">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-neutral-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[2.5rem] rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          currentPage === page ? 'bg-primary-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Next
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;

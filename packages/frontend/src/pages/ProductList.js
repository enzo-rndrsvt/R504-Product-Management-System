import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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

    fetchProducts();
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!searchTerm) return true;
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [products, searchTerm]);

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
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-12 text-center">
          <p className="text-lg text-neutral-600">No products found</p>
          {searchTerm ? (
            <p className="mt-2 text-neutral-500">Try a different search</p>
          ) : (
            <Link to="/add-product">
              <button className="btn-primary mt-4">Create your first product</button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
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

              {product.stock === 0 && <div className="badge badge-danger mt-3 w-full justify-center">Out of Stock</div>}
              {product.stock > 0 && product.stock < 10 && (
                <div className="badge badge-accent mt-3 w-full justify-center">Low Stock</div>
              )}
              {product.stock >= 10 && <div className="badge badge-secondary mt-3 w-full justify-center">Available</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        const processedData = data.map((item) => ({
          ...item,
          searchableText: `${item.name.toLowerCase()} ${item.price} ${item.stock}`,
          priceCategory: item.price < 50 ? 'cheap' : item.price < 100 ? 'medium' : 'expensive',
          stockStatus: item.stock === 0 ? 'out' : item.stock < 10 ? 'low' : 'available'
        }));
        setProducts(processedData);
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

  const filteredProducts = useMemo(() => {
    const searchFiltered = products.filter((product) => {
      if (!searchTerm) return true;

      const searchWords = searchTerm.toLowerCase().split(' ');

      const searchableWords = product.searchableText.split(' ');

      return searchWords.every((searchWord) =>
        searchableWords.some((word) => {
          const normalizedWord = word.toLowerCase().trim();
          const normalizedSearch = searchWord.toLowerCase().trim();

          // Levenshtein distance calculation for fuzzy matching
          const distance = Array(normalizedWord.length + 1)
            .fill(null)
            .map(() => Array(normalizedSearch.length + 1).fill(null));

          for (let i = 0; i <= normalizedWord.length; i++) {
            distance[i][0] = i;
          }

          for (let j = 0; j <= normalizedSearch.length; j++) {
            distance[0][j] = j;
          }

          for (let i = 1; i <= normalizedWord.length; i++) {
            for (let j = 1; j <= normalizedSearch.length; j++) {
              const cost = normalizedWord[i - 1] === normalizedSearch[j - 1] ? 0 : 1;

              distance[i][j] = Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1, distance[i - 1][j - 1] + cost);
            }
          }

          // Allow for fuzzy matching with a threshold
          return distance[normalizedWord.length][normalizedSearch.length] <= 2;
        })
      );
    });

    const priceFiltered = searchFiltered.filter((product) => {
      if (!priceFilter) return true;

      const price = parseFloat(product.price);
      switch (priceFilter) {
        case 'low':
          return price < 50 && product.priceCategory === 'cheap';
        case 'medium':
          return price >= 50 && price < 100 && product.priceCategory === 'medium';
        case 'high':
          return price >= 100 && product.priceCategory === 'expensive';
        default:
          return true;
      }
    });

    return priceFiltered
      .filter((product) => {
        if (!stockFilter) return true;

        const stockNum = parseInt(product.stock);

        switch (stockFilter) {
          case 'out':
            return stockNum === 0 && product.stockStatus === 'out';
          case 'low':
            return stockNum > 0 && stockNum < 10 && product.stockStatus === 'low';
          case 'available':
            return stockNum >= 10 && product.stockStatus === 'available';
          default:
            return true;
        }
      })
      .filter((product) => {
        if (!categoryFilter) return true;
        return product.category_id && product.category_id.toString() === categoryFilter;
      });
  }, [products, searchTerm, priceFilter, stockFilter, categoryFilter]);

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
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          <input
            type="text"
            placeholder="Search products by name, price, or stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-field">
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="select-field">
            <option value="">All Prices</option>
            <option value="low">Low (&lt; $50)</option>
            <option value="medium">Medium ($50 - $100)</option>
            <option value="high">High (&gt; $100)</option>
          </select>

          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="select-field">
            <option value="">All Stock</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-12 text-center">
          <p className="text-lg text-neutral-600">No products found matching your criteria</p>
          {searchTerm || priceFilter || stockFilter || categoryFilter ? (
            <p className="mt-2 text-neutral-500">Try adjusting your filters</p>
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

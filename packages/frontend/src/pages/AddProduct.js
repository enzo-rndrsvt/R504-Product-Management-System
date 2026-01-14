import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories } from '../services/api';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !stock) {
      setError('All fields are required!');
      return;
    }

    try {
      await createProduct({
        name,
        price: price,
        stock: stock,
        category_id: categoryId || null
      });
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
      console.error('Error creating product:', err);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Add New Product</h1>
        <p className="mt-2 text-neutral-600">Fill in the details below</p>
      </div>

      <div className="card shadow-md">
        {error && <div className="alert alert-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Product Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Wireless Mouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">Select a category (optional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock" className="form-label">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                placeholder="0"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn-ghost flex-1 border border-neutral-300 py-2.5 font-semibold"
            >
              Cancel
            </button>

            <button type="submit" className="btn-secondary flex-1 py-2.5 font-semibold">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

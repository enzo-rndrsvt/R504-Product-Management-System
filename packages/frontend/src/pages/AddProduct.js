import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/api';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        stock: stock
      });
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
      console.error('Error creating product:', err);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-5 shadow-md rounded-lg">
      <h2 className="text-center mb-5 text-2xl font-bold">Add New Product</h2>

      {error && <div className="text-red-600 mb-2 p-2 bg-red-100 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex-1 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Cancel
          </button>

          <button type="submit" className="flex-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

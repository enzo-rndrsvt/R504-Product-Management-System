import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/api';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      setError('Category name is required');
      return;
    }

    setIsLoading(true);
    try {
      await createCategory({
        name: newCategory,
        description: newDescription
      });
      setSuccess('Category added successfully!');
      setNewCategory('');
      setNewDescription('');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
      await fetchCategories();
    } catch (err) {
      setError(err.error || 'Failed to create category');
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteCategory(id);
      setSuccess('Category deleted successfully!');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
      await fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
      setSuccess(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Categories</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Manage your product categories</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add Category Form */}
        <div className="lg:col-span-1">
          <div className="card shadow-md">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-100">Add New Category</h2>

            {error && <div className="alert alert-error mb-4">{error}</div>}
            {success && <div className="alert alert-success mb-4">{success}</div>}

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Category Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., Electronics"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  placeholder="Describe this category..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input-field resize-none"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-secondary w-full py-2.5 font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="card shadow-md">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-100">Categories</h2>

            {categories.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <p className="text-neutral-600 dark:text-neutral-400">No categories yet</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                  Create your first category to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="dark:hover:bg-neutral-750 flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{category.name}</h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{category.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="ml-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesList;

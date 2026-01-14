import { useState, useEffect, useCallback, useRef } from 'react';
import { categoriesApi } from '../api/categories';
import { Category, CategoryFormData } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate API calls
  const isFetching = useRef(false);

  const fetchCategories = useCallback(async () => {
    // Prevent concurrent requests
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setIsLoading(true);
      setError(null);
      const data = await categoriesApi.getAll();
      // Sort by display order
      const sorted = data.sort((a, b) => a.displayOrder - b.displayOrder);
      setCategories(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: CategoryFormData) => {
    try {
      const newCategory = await categoriesApi.create(data);
      await fetchCategories();
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  };

  const updateCategory = async (id: string, data: Partial<CategoryFormData>) => {
    try {
      const updatedCategory = await categoriesApi.update(id, data);
      await fetchCategories();
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await categoriesApi.toggleStatus(id);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle category status');
      throw err;
    }
  };

  const reorderCategories = async (categoryIds: string[]) => {
    try {
      await categoriesApi.reorder(categoryIds);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder categories');
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
    reorderCategories,
  };
};

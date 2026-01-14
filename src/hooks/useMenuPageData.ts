import { useState, useEffect, useRef, useCallback } from 'react';
import { menuApi } from '../api/menu';
import { MenuItem, Category, AddOn, MenuItemFormData, MenuPageData } from '../types';
import { Alert } from 'react-native';

export const useMenuPageData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate API calls
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    // Prevent concurrent requests
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setIsLoading(true);
      setError(null);
      const data = await menuApi.getPageData();
      setCategories(data.categories);
      setItems(data.menuItems);
      setAddOns(data.addOns);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu data';
      setError(errorMessage);
      console.error('Error fetching menu page data:', err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createItem = async (data: MenuItemFormData, imageUri?: string) => {
    try {
      const newItem = await menuApi.create(data, imageUri);
      await fetchData();
      Alert.alert('Success', 'Menu item created successfully');
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create menu item';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    }
  };

  const updateItem = async (id: string, data: Partial<MenuItemFormData>, imageUri?: string) => {
    try {
      const updatedItem = await menuApi.update(id, data, imageUri);
      await fetchData();
      Alert.alert('Success', 'Menu item updated successfully');
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update menu item';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await menuApi.delete(id);
      await fetchData();
      Alert.alert('Success', 'Menu item deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu item';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      await menuApi.toggleAvailability(id);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle availability';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    }
  };

  return {
    categories,
    items,
    addOns,
    isLoading,
    error,
    refetch: fetchData,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
  };
};

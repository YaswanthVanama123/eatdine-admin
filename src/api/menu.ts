import { apiClient } from './client';
import { MenuItem, MenuFilters, MenuItemFormData, ApiResponse, MenuPageData } from '../types';

export const menuApi = {
  /**
   * Get menu management page data (categories + menu items + addons) - OPTIMIZED
   */
  getPageData: async (): Promise<MenuPageData> => {
    const response = await apiClient.get<ApiResponse<MenuPageData>>('/menu/admin/page-data');
    return response.data.data;
  },

  /**
   * Get all menu items with filters
   */
  getAll: async (filters?: MenuFilters): Promise<MenuItem[]> => {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get menu item by ID
   */
  getById: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/menu/${id}`);
    return response.data.data;
  },

  /**
   * Create new menu item with optional image - OPTIMIZED (SINGLE REQUEST)
   */
  create: async (data: MenuItemFormData, image?: File | any): Promise<MenuItem> => {
    const formData = new FormData();

    // Append all menu item fields
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('categoryId', data.categoryId);
    formData.append('price', data.price.toString());

    if (data.originalPrice !== undefined) {
      formData.append('originalPrice', data.originalPrice.toString());
    }

    formData.append('isVegetarian', data.isVegetarian ? 'true' : 'false');
    formData.append('isVegan', data.isVegan ? 'true' : 'false');
    formData.append('isGlutenFree', data.isGlutenFree ? 'true' : 'false');
    formData.append('isNonVeg', data.isNonVeg ? 'true' : 'false');

    if (data.preparationTime !== undefined) {
      formData.append('preparationTime', data.preparationTime.toString());
    }

    // Stringify customizationOptions for FormData
    if (data.customizationOptions) {
      formData.append('customizationOptions', JSON.stringify(data.customizationOptions));
    }

    // Stringify addOnIds for FormData
    if (data.addOnIds) {
      formData.append('addOnIds', JSON.stringify(data.addOnIds));
    }

    // Append image if provided
    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.post<ApiResponse<MenuItem>>('/menu', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Update menu item with optional image - OPTIMIZED (SINGLE REQUEST)
   */
  update: async (id: string, data: Partial<MenuItemFormData>, image?: File | any): Promise<MenuItem> => {
    const formData = new FormData();

    // Append only provided fields
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.originalPrice !== undefined) formData.append('originalPrice', data.originalPrice.toString());
    if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable ? 'true' : 'false');
    if (data.isVegetarian !== undefined) formData.append('isVegetarian', data.isVegetarian ? 'true' : 'false');
    if (data.isVegan !== undefined) formData.append('isVegan', data.isVegan ? 'true' : 'false');
    if (data.isGlutenFree !== undefined) formData.append('isGlutenFree', data.isGlutenFree ? 'true' : 'false');
    if (data.isNonVeg !== undefined) formData.append('isNonVeg', data.isNonVeg ? 'true' : 'false');
    if (data.preparationTime !== undefined) formData.append('preparationTime', data.preparationTime.toString());

    // Stringify customizationOptions for FormData
    if (data.customizationOptions !== undefined) {
      formData.append('customizationOptions', JSON.stringify(data.customizationOptions));
    }

    // Stringify addOnIds for FormData
    if (data.addOnIds !== undefined) {
      formData.append('addOnIds', JSON.stringify(data.addOnIds));
    }

    // Append image if provided
    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.put<ApiResponse<MenuItem>>(`/menu/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Delete menu item
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu/${id}`);
  },

  /**
   * Toggle menu item availability
   */
  toggleAvailability: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.patch<ApiResponse<MenuItem>>(`/menu/${id}/toggle`);
    return response.data.data;
  },

  /**
   * Upload menu item image
   */
  uploadImage: async (id: string, formData: FormData): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>(
      `/menu/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Search menu items
   */
  search: async (query: string): Promise<MenuItem[]> => {
    const response = await apiClient.get<ApiResponse<MenuItem[]>>('/search/menu', {
      params: { query },
    });
    return response.data.data;
  },

  /**
   * Bulk update menu item availability
   */
  bulkUpdateAvailability: async (ids: string[], isAvailable: boolean): Promise<void> => {
    await apiClient.patch('/menu/bulk/availability', { ids, isAvailable });
  },

  /**
   * Reorder menu items
   */
  reorder: async (items: Array<{ id: string; order: number }>): Promise<void> => {
    await apiClient.post('/menu/reorder', { items });
  },
};

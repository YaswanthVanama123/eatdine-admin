/**
 * Platform-agnostic storage utility
 * Works with both React (localStorage) and React Native (AsyncStorage)
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  RESTAURANT_ID: 'restaurantId',
  RESTAURANT_SUBDOMAIN: 'restaurantSubdomain',  // Add subdomain key
  ADMIN_DATA: 'adminData',
} as const;

class StorageManager {
  private adapter: StorageAdapter | null = null;

  /**
   * Initialize storage with a platform-specific adapter
   * For React (web): pass localStorage
   * For React Native: pass AsyncStorage
   */
  setAdapter(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  private ensureAdapter(): StorageAdapter {
    if (!this.adapter) {
      // Default to localStorage for web if not explicitly set
      if (typeof window !== 'undefined' && window.localStorage) {
        this.adapter = window.localStorage;
      } else {
        throw new Error(
          'Storage adapter not initialized. Call storage.setAdapter() with localStorage or AsyncStorage.'
        );
      }
    }
    return this.adapter;
  }

  async getItem(key: string): Promise<string | null> {
    const adapter = this.ensureAdapter();
    const result = adapter.getItem(key);
    return result instanceof Promise ? await result : result;
  }

  async setItem(key: string, value: string): Promise<void> {
    const adapter = this.ensureAdapter();
    const result = adapter.setItem(key, value);
    if (result instanceof Promise) {
      await result;
    }
  }

  async removeItem(key: string): Promise<void> {
    const adapter = this.ensureAdapter();
    const result = adapter.removeItem(key);
    if (result instanceof Promise) {
      await result;
    }
  }

  async clear(): Promise<void> {
    const adapter = this.ensureAdapter();
    const result = adapter.clear();
    if (result instanceof Promise) {
      await result;
    }
  }

  // Convenience methods for common operations
  async getToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  }

  async setToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
  }

  async removeToken(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  }

  async getRestaurantId(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.RESTAURANT_ID);
  }

  async setRestaurantId(id: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.RESTAURANT_ID, id);
  }

  async removeRestaurantId(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.RESTAURANT_ID);
  }

  async getAdminData(): Promise<any | null> {
    const data = await this.getItem(STORAGE_KEYS.ADMIN_DATA);
    return data ? JSON.parse(data) : null;
  }

  async setAdminData(data: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(data));
  }

  async removeAdminData(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.ADMIN_DATA);
  }

  async getSubdomain(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.RESTAURANT_SUBDOMAIN);
  }

  async setSubdomain(subdomain: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.RESTAURANT_SUBDOMAIN, subdomain);
  }

  async removeSubdomain(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.RESTAURANT_SUBDOMAIN);
  }

  async clearAuth(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeRestaurantId(),
      this.removeAdminData(),
      this.removeSubdomain(),
    ]);
  }
}

export const storage = new StorageManager();

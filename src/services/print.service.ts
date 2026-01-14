import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Print Service Client for Admin Mobile App
 * Communicates with the Print Service (standalone Electron app) for thermal printing
 *
 * Features:
 * - Automatic retry on failure (like Swiggy/Zomato)
 * - Print queue for handling multiple orders
 * - Connection health monitoring
 * - Detailed error messages
 */

interface PrintServiceConfig {
  baseURL: string;
  timeout: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  tableNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customizations?: string[];
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string | Date;
}

interface PrintQueueItem {
  order: Order;
  attempts: number;
  timestamp: number;
}

class PrintService {
  private client: AxiosInstance;
  private defaultConfig: PrintServiceConfig = {
    baseURL: 'http://localhost:9100',
    timeout: 10000,
  };
  private printQueue: PrintQueueItem[] = [];
  private isProcessingQueue = false;
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds

  constructor() {
    this.client = this.createClient(this.defaultConfig);
    this.loadSavedURL();
    this.startQueueProcessor();
  }

  private createClient(config: PrintServiceConfig): AxiosInstance {
    return axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Update Print Service URL (for network printing from tablets)
   * Example: http://192.168.1.100:9100
   */
  async updateBaseURL(url: string): Promise<void> {
    try {
      this.defaultConfig.baseURL = url;
      this.client = this.createClient(this.defaultConfig);
      await AsyncStorage.setItem(STORAGE_KEYS.PRINT_SERVICE_URL, url);
      console.log('✅ Print Service URL updated:', url);
    } catch (error) {
      console.error('Failed to update Print Service URL:', error);
      throw error;
    }
  }

  /**
   * Load saved Print Service URL from storage
   */
  async loadSavedURL(): Promise<void> {
    try {
      const savedURL = await AsyncStorage.getItem(STORAGE_KEYS.PRINT_SERVICE_URL);
      if (savedURL) {
        this.defaultConfig.baseURL = savedURL;
        this.client = this.createClient(this.defaultConfig);
        console.log('✅ Loaded saved Print Service URL:', savedURL);
      }
    } catch (error) {
      console.error('Failed to load saved Print Service URL:', error);
    }
  }

  /**
   * Check if Print Service is available
   * Returns true if service is running, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 3000 });
      return response.data.status === 'running';
    } catch (error) {
      console.error('Print Service health check failed:', error);
      return false;
    }
  }

  /**
   * Print order to thermal printer via Print Service
   * With automatic retry on failure (like Swiggy/Zomato)
   */
  async printOrder(order: Order): Promise<void> {
    try {
      console.log('🖨️  Adding order to print queue:', order.orderNumber);

      // Add to queue
      this.printQueue.push({
        order,
        attempts: 0,
        timestamp: Date.now(),
      });

      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    } catch (error: any) {
      console.error('❌ Failed to add order to print queue:', error);
      throw error;
    }
  }

  /**
   * Process print queue with retry logic
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.printQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.printQueue.length > 0) {
      const queueItem = this.printQueue[0];

      try {
        console.log(
          `🖨️  Processing order: ${queueItem.order.orderNumber} (Attempt ${queueItem.attempts + 1}/${this.maxRetries})`
        );

        // Attempt to print
        await this.sendPrintRequest(queueItem.order);

        // Success - remove from queue
        this.printQueue.shift();
        console.log('✅ Order printed successfully:', queueItem.order.orderNumber);
      } catch (error: any) {
        console.error('❌ Print failed:', error.message);

        queueItem.attempts++;

        // Check if we should retry
        if (queueItem.attempts < this.maxRetries) {
          console.log(
            `🔄 Retrying order ${queueItem.order.orderNumber} in ${this.retryDelay / 1000}s...`
          );

          // Wait before retry
          await this.sleep(this.retryDelay);

          // Move to end of queue and continue
          this.printQueue.push(this.printQueue.shift()!);
        } else {
          // Max retries reached - remove from queue
          console.error(
            `❌ Max retries reached for order ${queueItem.order.orderNumber}. Removing from queue.`
          );
          this.printQueue.shift();

          // Throw error so OrdersContext can show notification
          throw new Error(
            `Failed to print order ${queueItem.order.orderNumber} after ${this.maxRetries} attempts`
          );
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Send print request to Print Service
   */
  private async sendPrintRequest(order: Order): Promise<void> {
    const response = await this.client.post('/print', order);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Print failed');
    }
  }

  /**
   * Start automatic queue processor
   */
  private startQueueProcessor(): void {
    // Check queue every 5 seconds for any pending items
    setInterval(() => {
      if (this.printQueue.length > 0 && !this.isProcessingQueue) {
        this.processQueue();
      }
    }, 5000);
  }

  /**
   * Sleep helper for retry delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.printQueue.length,
      processing: this.isProcessingQueue,
    };
  }

  /**
   * Test print connection
   * Sends a test print to verify printer is working
   */
  async testPrint(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🖨️  Sending test print...');

      const response = await this.client.post('/test-print');

      console.log('Test print response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Test print failed:', error);

      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Cannot reach Print Service. Check if it\'s running and URL is correct.',
        };
      }

      return {
        success: false,
        error: error.message || 'Test print failed',
      };
    }
  }

  /**
   * Get current Print Service URL
   */
  getBaseURL(): string {
    return this.defaultConfig.baseURL;
  }

  /**
   * Get Print Service settings from server
   */
  async getSettings(): Promise<any> {
    try {
      const response = await this.client.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to get Print Service settings:', error);
      throw error;
    }
  }
}

export const printService = new PrintService();
export default printService;

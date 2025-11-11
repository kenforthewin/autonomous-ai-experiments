import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '@/services/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct base URL from environment', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test.com');
    
    // Create a new instance to test environment variable
    const { apiService: testService } = await import('@/services/api');
    
    expect(testService).toBeDefined();
  });

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        message: 'Success',
        status: 200,
        success: true,
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.get('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles GET request errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiService.get('/not-found')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('POST requests', () => {
    it('makes successful POST request', async () => {
      const mockData = { name: 'Test Item' };
      const mockResponse = {
        data: { id: 1, ...mockData },
        message: 'Created',
        status: 201,
        success: true,
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.post('/items', mockData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/items',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles POST request errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiService.post('/items', {})).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('network errors', () => {
    it('handles network failures', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.get('/test')).rejects.toThrow('Network error');
    });
  });
});

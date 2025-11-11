import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getConfig, formatDate, debounce } from '@/utils';

describe('Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('returns default configuration when environment variables are not set', () => {
      // Mock import.meta.env to return undefined for all variables
      vi.stubEnv('VITE_APP_TITLE', undefined);
      vi.stubEnv('VITE_APP_VERSION', undefined);
      vi.stubEnv('VITE_API_BASE_URL', undefined);

      const config = getConfig();
      
      expect(config).toEqual({
        title: 'React Modern App',
        version: '1.0.0',
        apiBaseUrl: 'http://localhost:3001/api',
      });
    });

    it('returns environment variables when they are set', () => {
      vi.stubEnv('VITE_APP_TITLE', 'Custom App');
      vi.stubEnv('VITE_APP_VERSION', '2.0.0');
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');

      const config = getConfig();
      
      expect(config).toEqual({
        title: 'Custom App',
        version: '2.0.0',
        apiBaseUrl: 'https://api.example.com',
      });
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-01-15');
      const formatted = formatDate(date);
      
      expect(formatted).toBe('January 15, 2025');
    });

    it('handles different dates', () => {
      const date = new Date('2024-12-25');
      const formatted = formatDate(date);
      
      expect(formatted).toBe('December 25, 2024');
    });
  });

  describe('debounce', () => {
    it('delays function execution', () => {
      vi.useFakeTimers();
      
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });

    it('cancels previous calls when called multiple times', () => {
      vi.useFakeTimers();
      
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');
      
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('third');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });
  });
});

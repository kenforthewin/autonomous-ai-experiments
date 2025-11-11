import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

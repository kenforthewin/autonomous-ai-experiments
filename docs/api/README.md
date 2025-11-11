# API Documentation

## Overview

This document describes the API service layer and how to interact with external APIs in this React application.

## API Service Architecture

### ApiService Class

The `ApiService` class in `src/services/api.ts` provides a centralized way to handle HTTP requests with built-in error handling and configuration.

#### Features
- **Base URL Configuration**: Configurable base URL for all API calls
- **Request/Response Interceptors**: Automatic error handling and response processing
- **Type Safety**: Full TypeScript support for request/response types
- **Error Handling**: Comprehensive error handling for HTTP and network errors

### Configuration

```typescript
const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

## API Methods

### GET Requests

```typescript
// Basic GET request
const data = await ApiService.get('/endpoint');

// GET request with parameters
const data = await ApiService.get('/users', { 
  params: { page: 1, limit: 10 } 
});
```

### POST Requests

```typescript
// Create new resource
const created = await ApiService.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### PUT Requests

```typescript
// Update existing resource
const updated = await ApiService.put('/users/123', {
  name: 'Jane Doe'
});
```

### DELETE Requests

```typescript
// Delete resource
await ApiService.delete('/users/123');
```

## Error Handling

The API service provides comprehensive error handling:

### HTTP Errors
- **404 Not Found**: Resource not found
- **500 Server Error**: Server-side errors
- **401/403**: Authentication/Authorization errors

### Network Errors
- **Connection Timeout**: Request took too long
- **Network Error**: No internet connection
- **CORS Errors**: Cross-origin request blocked

### Error Response Format

```typescript
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}
```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://your-api.com
VITE_API_TIMEOUT=10000

# Optional: API Key
VITE_API_KEY=your-api-key-here
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for all API requests | `https://api.example.com` |
| `VITE_API_TIMEOUT` | Request timeout in milliseconds | `10000` |
| `VITE_API_KEY` | API key for authentication | `undefined` |

## Usage Examples

### Component Integration

```typescript
import React, { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get<User[]>('/users');
        setUsers(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ... component JSX
};
```

### Custom API Service

```typescript
// src/services/userService.ts
import { ApiService } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export class UserService {
  static async getUsers(params?: { page?: number; limit?: number }) {
    return ApiService.get<User[]>('/users', { params });
  }

  static async getUserById(id: number) {
    return ApiService.get<User>(`/users/${id}`);
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt'>) {
    return ApiService.post<User>('/users', userData);
  }

  static async updateUser(id: number, userData: Partial<User>) {
    return ApiService.put<User>(`/users/${id}`, userData);
  }

  static async deleteUser(id: number) {
    return ApiService.delete(`/users/${id}`);
  }
}
```

## Testing

### Mock API Responses

For testing, you can mock the API service:

```typescript
// tests/services/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiService } from '@/services/api';

// Mock fetch
global.fetch = vi.fn();

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make GET request successfully', async () => {
    const mockResponse = { data: 'test data' };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await ApiService.get('/test');
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.any(Object)
    );
    expect(result.data).toEqual(mockResponse);
  });
});
```

## Best Practices

### 1. Type Safety
Always define TypeScript interfaces for API responses:

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

### 2. Error Boundaries
Wrap API calls in try-catch blocks and handle errors gracefully:

```typescript
try {
  const response = await ApiService.get('/endpoint');
  // Handle success
} catch (error) {
  // Handle error (show user-friendly message, log error, etc.)
}
```

### 3. Loading States
Always manage loading states for better UX:

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await ApiService.get('/endpoint');
    // Process data
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### 4. Request Cancellation
Use AbortController for cancelling requests:

```typescript
const controller = new AbortController();

try {
  const response = await ApiService.get('/endpoint', {
    signal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    // Request was cancelled
  }
}

// Cancel request
controller.abort();
```

## Future Enhancements

### Planned Features
1. **Request Caching**: Implement response caching for GET requests
2. **Retry Logic**: Automatic retry for failed requests
3. **Request Queuing**: Queue requests when offline
4. **GraphQL Support**: Add GraphQL client integration
5. **WebSocket Support**: Real-time communication capabilities

### Authentication Integration
When authentication is added, the API service will be enhanced with:
- JWT token management
- Automatic token refresh
- Request interceptors for adding auth headers
- Logout handling on 401 responses

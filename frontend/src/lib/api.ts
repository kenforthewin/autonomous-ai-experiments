import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { DocumentMetadata, QueryRequest, QueryResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload a document file to the backend
 */
export async function uploadDocument(file: File): Promise<DocumentMetadata> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<DocumentMetadata>(
    '/api/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Fetch list of all uploaded documents
 */
export async function getDocuments(): Promise<DocumentMetadata[]> {
  const response = await apiClient.get<DocumentMetadata[]>('/api/documents');
  return response.data;
}

/**
 * Fetch details of a specific document
 */
export async function getDocument(id: string): Promise<DocumentMetadata> {
  const response = await apiClient.get<DocumentMetadata>(`/api/documents/${id}`);
  return response.data;
}

/**
 * Delete a document by ID
 */
export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/api/documents/${id}`);
}

/**
 * Submit a query to the RAG system
 */
export async function queryDocuments(request: QueryRequest): Promise<QueryResponse> {
  const response = await apiClient.post<QueryResponse>('/api/query', request);
  return response.data;
}

/**
 * Check health status of the API
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await apiClient.get<{ status: string }>('/health');
  return response.data;
}

export default apiClient;


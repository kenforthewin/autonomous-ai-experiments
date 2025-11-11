export interface DocumentMetadata {
  id: string;
  filename: string;
  file_size: number;
  uploaded_at: string;
  chunk_count: number;
}

export interface QueryRequest {
  query: string;
  max_results?: number;
}

export interface DocumentSource {
  doc_id: string;
  source: string;
  chunk_index: number;
}

export interface QueryResponse {
  answer: string;
  sources: DocumentSource[];
}


const DEFAULT_BACKEND_URL = "http://localhost:8000";

const getBackendUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
};

export interface DocumentSummary {
  id: string;
  title: string;
  labels: string[];
  updated_at?: string;
}

export interface DocumentListResponse {
  documents: DocumentSummary[];
}

export interface DocumentDetail extends DocumentSummary {
  text_path: string;
  text_sha256: string;
  updated_at: string;
  content?: string | null;
}

export interface NotePayload {
  id?: string;
  title: string;
  content: string;
  labels?: string[];
}

export interface QueryPayload {
  query: string;
  labels?: string[];
  k?: number;
}

export interface QueryResponse {
  answer: string;
  citations: Array<{
    doc_id: string;
    title: string;
    chunk_index: number;
  }>;
}

export interface LabelsResponse {
  labels: string[];
}

export interface WikiResponse {
  label: string;
  content: string;
}

export async function uploadDocuments(files: File[], labels?: string[]) {
  const backendUrl = getBackendUrl();
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  const labelParam = labels?.map((label) => label.trim()).filter(Boolean).join(",");
  const url = new URL("/documents/upload", backendUrl);
  if (labelParam) {
    url.searchParams.set("labels", labelParam);
  }
  const response = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to upload documents: ${response.statusText}`);
  }
  return response.json();
}

export async function createOrUpdateNote(payload: NotePayload) {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to save note: ${response.statusText}`);
  }
  return response.json();
}

export async function listDocuments(): Promise<DocumentListResponse> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/documents`, {
    next: { revalidate: 5 },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.statusText}`);
  }
  return response.json();
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/documents/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }
  return response.json();
}

export async function runQuery(payload: QueryPayload): Promise<QueryResponse> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to run query: ${response.statusText}`);
  }
  return response.json();
}

export async function listLabels(): Promise<LabelsResponse> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/wiki`, {
    next: { revalidate: 10 },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch labels: ${response.statusText}`);
  }
  return response.json();
}

export async function getWiki(label: string): Promise<WikiResponse> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/wiki/${encodeURIComponent(label)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch wiki: ${response.statusText}`);
  }
  return response.json();
}


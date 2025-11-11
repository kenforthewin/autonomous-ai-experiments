import React, { useEffect, useState } from 'react';
import { Trash2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDocuments, deleteDocument } from '@/lib/api';
import type { DocumentMetadata } from '@/types';

interface DocumentListProps {
  refreshTrigger?: number;
}

export const DocumentList: React.FC<DocumentListProps> = ({ refreshTrigger = 0 }) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load documents. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete document. Please try again.';
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
        <CardDescription>
          Manage your uploaded documents. Total: {documents.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <p className="text-sm text-muted-foreground/75">
              Upload your first document to get started.
            </p>
          </div>
        )}

        {!isLoading && documents.length > 0 && (
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4 space-y-4">
              {documents.map((doc, index) => (
                <div key={doc.id}>
                  <div className="flex items-start justify-between gap-4 py-3 px-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium text-foreground truncate">{doc.filename}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(doc.file_size)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {doc.chunk_count} chunks
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.uploaded_at)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      disabled={deletingId === doc.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {index < documents.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};


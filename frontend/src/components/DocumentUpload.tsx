import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadDocument } from '@/lib/api';
import type { DocumentMetadata } from '@/types';

interface DocumentUploadProps {
  onUploadSuccess?: (document: DocumentMetadata) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedFileTypes,
    onDrop: async (acceptedFiles) => {
      setError(null);
      setSuccess(null);

      if (acceptedFiles.length === 0) {
        setError('No valid files selected. Please upload PDF, DOCX, TXT, or MD files.');
        return;
      }

      const file = acceptedFiles[0];

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit.');
        return;
      }

      setIsLoading(true);
      try {
        const uploadedDocument = await uploadDocument(file);
        setSuccess(`Document "${uploadedDocument.filename}" uploaded successfully!`);
        onUploadSuccess?.(uploadedDocument);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to upload document. Please try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Drag and drop your documents or click to select. Supported formats: PDF, DOCX, TXT, MD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium text-foreground">Drop your files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-foreground">
                  Drag and drop your documents here
                </p>
                <p className="text-sm text-muted-foreground">or click to select files</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Button disabled={isLoading} className="w-full" variant="outline" type="button">
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardContent>
    </Card>
  );
};


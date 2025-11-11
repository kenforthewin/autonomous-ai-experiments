import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentList';
import { QueryInterface } from '@/components/QueryInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import type { DocumentMetadata } from '@/types';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (_document: DocumentMetadata) => {
    // Refresh the document list after successful upload
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Layout>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 mt-6">
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
            <DocumentList refreshTrigger={refreshKey} />
          </TabsContent>

          {/* Query Tab */}
          <TabsContent value="query" className="mt-6">
            <QueryInterface />
          </TabsContent>
        </Tabs>
      </Layout>
      <Toaster />
    </>
  );
}

export default App;


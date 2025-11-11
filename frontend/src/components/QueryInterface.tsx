import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { queryDocuments } from '@/lib/api';
import type { QueryRequest, QueryResponse } from '@/types';

const EXAMPLE_QUERIES = [
  'What are the main topics covered in my documents?',
  'Summarize the key findings from all my notes',
  'What connections exist between my documents?',
  'Create a comprehensive overview of my notes',
];

export const QueryInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a query.');
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const request: QueryRequest = {
        query: query.trim(),
        max_results: 5,
      };

      const response = await queryDocuments(request);
      setResult(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process query. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="w-full space-y-6">
      {/* Query Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>
            Query your documents using natural language. The system will search through your
            documents and generate an answer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ask your question here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px] resize-none"
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Query
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Example Queries */}
          {!result && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-3">Example queries:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {EXAMPLE_QUERIES.map((exampleQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuery(exampleQuery)}
                    disabled={isLoading}
                    className="text-left text-sm p-2 rounded-md border border-muted-foreground/20 hover:bg-muted hover:border-muted-foreground/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exampleQuery}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">
                {result.answer}
              </p>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Sources
                </h3>
                <div className="space-y-2">
                  {result.sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 rounded-md bg-white border border-green-200"
                    >
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {source.source}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Chunk {source.chunk_index}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setResult(null)}
            >
              Ask Another Question
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


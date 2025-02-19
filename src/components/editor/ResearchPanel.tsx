import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { callAI } from '@/lib/ai';

interface Source {
  title: string;
  url: string;
  snippet: string;
  confidence?: number;
}

interface AIResponse {
  content: string;
  sources?: Source[];
  metadata?: {
    keywords: string[];
    readingTime?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface ResearchPanelProps {
  onInsert: (content: string) => void;
  selectedText?: string;
}

export function ResearchPanel({ onInsert, selectedText }: ResearchPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('research');
  const [results, setResults] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!selectedText) {
      setError('Please select text to research');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callAI('research', selectedText);
      setResults(response);
      setActiveTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFactCheck = async () => {
    if (!selectedText) {
      setError('Please select text to fact check');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callAI('factCheck', selectedText);
      setResults(response);
      setActiveTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fact check failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSourceCard = (source: Source) => (
    <Card key={source.url} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{source.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-500 hover:underline"
          >
            View Source <ExternalLink className="h-4 w-4" />
          </a>
          {source.confidence && (
            <Badge variant={source.confidence > 0.7 ? 'default' : 'secondary'}>
              {Math.round(source.confidence * 100)}% confidence
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{source.snippet}</p>
      </CardContent>
    </Card>
  );

  const renderMetadata = (metadata: NonNullable<AIResponse['metadata']>) => (
    <div className="mb-4">
      <div className="mb-2 flex flex-wrap gap-2">
        {metadata.keywords?.map((keyword: string) => (
          <Badge key={keyword} variant="outline">
            {keyword}
          </Badge>
        ))}
      </div>
      {metadata.readingTime && (
        <p className="text-sm text-muted-foreground">
          Reading time: ~{metadata.readingTime} minutes
        </p>
      )}
      {metadata.difficulty && (
        <p className="text-sm capitalize text-muted-foreground">
          Difficulty: {metadata.difficulty}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-2xl p-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Research</CardTitle>
              <CardDescription>
                Research or fact-check your content using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Text</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedText || 'No text selected'}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleResearch}
                  disabled={isLoading || !selectedText}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    'Research Topic'
                  )}
                </Button>
                <Button
                  onClick={handleFactCheck}
                  disabled={isLoading || !selectedText}
                  variant="secondary"
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Fact Check'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {results && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Research Results</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInsert(results.content)}
                  >
                    Insert
                  </Button>
                </div>
                <CardDescription>
                  Found {results.sources?.length || 0} sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    <div className="prose prose-sm dark:prose-invert">
                      <h3 className="text-lg font-semibold">Key Findings</h3>
                      <div
                        dangerouslySetInnerHTML={{ __html: results.content }}
                      />
                    </div>

                    {results.sources && results.sources.length > 0 && (
                      <div>
                        <h3 className="mb-4 text-lg font-semibold">Sources</h3>
                        {results.sources.map(renderSourceCard)}
                      </div>
                    )}

                    {results.metadata && renderMetadata(results.metadata)}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

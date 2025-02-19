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
import { Loader2, Layout, FileText, Plus, Sparkles } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  metadata: {
    keywords: string[];
    readingTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface TemplatePanelProps {
  onApply: (content: string) => void;
}

export function TemplatePanel({ onApply }: TemplatePanelProps) {
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading] = useState(false);
  const [templates] = useState<Template[]>([]);

  const categories = [
    'Blog Post',
    'Technical Article',
    'Tutorial',
    'Case Study',
    'News',
  ];

  const renderTemplateCard = (template: Template) => (
    <Card key={template.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
          <Badge variant="secondary">{template.category}</Badge>
        </div>
        <CardDescription className="text-xs">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {template.metadata.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {template.metadata.readingTime} min read
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApply(template.content)}
          >
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-2xl p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">
            <Layout className="mr-2 h-4 w-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Sparkles className="mr-2 h-4 w-4" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>Template Library</CardTitle>
              <CardDescription>
                Choose from our collection of professionally crafted templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-4">
                    {templates.map(renderTemplateCard)}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Template</CardTitle>
              <CardDescription>
                Create a new custom template for your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Template creation form will go here */}
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                Template creation form coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Smart Suggestions</CardTitle>
              <CardDescription>
                AI-powered template suggestions based on your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  Select text to get template suggestions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

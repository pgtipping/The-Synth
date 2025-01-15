import { useState } from 'react';
import { Plus } from 'lucide-react';
import { type RouterOutputs, type AppRouter } from '@/server/api/root';
import { api } from '@/utils/api';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { type TRPCClientErrorLike } from '@trpc/client';

interface TagListProps {
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onDeselect?: (id: string) => void;
  className?: string;
}

type Tag = RouterOutputs['tags']['getAll'][number];

export function TagList({
  selectedIds = [],
  onSelect,
  onDeselect,
  className,
}: TagListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const { toast } = useToast();

  const utils = api.useUtils();
  const { data: tags, isLoading } = api.tags.getAll.useQuery();

  const createTag = api.tags.create.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Success',
        description: 'Tag created successfully',
      });
      setIsOpen(false);
      setName('');
      await utils.tags.getAll.invalidate();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTag = api.tags.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Success',
        description: 'Tag deleted successfully',
      });
      await utils.tags.getAll.invalidate();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTag.mutate({ name });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      deleteTag.mutate({ id });
    }
  };

  if (isLoading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Tags</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter tag name"
                />
              </div>
              <Button
                type="submit"
                disabled={createTag.isPending || !name.trim()}
              >
                {createTag.isPending ? 'Creating...' : 'Create Tag'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags?.map((tag: Tag) => {
          const isSelected = selectedIds.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? 'secondary' : 'default'}
              clickable={!!onSelect}
              onClick={() => {
                if (onSelect && !isSelected) {
                  onSelect(tag.id);
                } else if (onDeselect && isSelected) {
                  onDeselect(tag.id);
                }
              }}
              onRemove={
                !selectedIds.length ? () => handleDelete(tag.id) : undefined
              }
            >
              {tag.name}
            </Badge>
          );
        })}
        {tags?.length === 0 && (
          <p className="text-sm text-gray-500">No tags found</p>
        )}
      </div>
    </div>
  );
}

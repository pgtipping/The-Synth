import { useState } from 'react';
import { Plus } from 'lucide-react';
import { type RouterOutputs } from '@/server/api/root';
import { trpc } from '@/lib/trpc';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { type TRPCClientErrorLike } from '@trpc/client';
import { type AppRouter } from '@/server/api/root';

interface CategoryListProps {
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onDeselect?: (id: string) => void;
  className?: string;
}

type Category = RouterOutputs['categories']['getAll'][number];

export function CategoryList({
  selectedIds = [],
  onSelect,
  onDeselect,
  className,
}: CategoryListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.getAll.useQuery();

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      setIsOpen(false);
      setName('');
      setDescription('');
      await utils.categories.getAll.invalidate();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      await utils.categories.getAll.invalidate();
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
    createCategory.mutate({ name, description });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate({ id });
    }
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Categories</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description"
                />
              </div>
              <Button
                type="submit"
                disabled={createCategory.isPending || !name.trim()}
              >
                {createCategory.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories?.map((category: Category) => {
          const isSelected = selectedIds.includes(category.id);
          return (
            <Badge
              key={category.id}
              variant={isSelected ? 'primary' : 'default'}
              clickable={!!onSelect}
              onClick={() => {
                if (onSelect && !isSelected) {
                  onSelect(category.id);
                } else if (onDeselect && isSelected) {
                  onDeselect(category.id);
                }
              }}
              onRemove={
                !selectedIds.length
                  ? () => handleDelete(category.id)
                  : undefined
              }
            >
              {category.name}
            </Badge>
          );
        })}
        {categories?.length === 0 && (
          <p className="text-sm text-gray-500">No categories found</p>
        )}
      </div>
    </div>
  );
}

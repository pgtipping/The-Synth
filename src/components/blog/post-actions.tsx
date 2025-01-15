'use client';

import { Button } from '@/components/ui/button';
import { EditIcon, TrashIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';
import { type RouterOutputs } from '@/server/api/root';
import { type TRPCClientErrorLike } from '@trpc/client';
import { type AppRouter } from '@/server/api/root';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PostActionsProps {
  postId: string;
  published: boolean;
  onPublishToggle?: () => void;
}

type Post = RouterOutputs['posts']['getPostById'];

export function PostActions({
  postId,
  published,
  onPublishToggle,
}: PostActionsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const togglePublish = trpc.posts.togglePublish.useMutation({
    onSuccess: (data: { message: string }) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      if (onPublishToggle) {
        onPublishToggle();
      }
      router.refresh();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteDraft = trpc.posts.deleteDraft.useMutation({
    onSuccess: (data: { message: string }) => {
      toast({
        title: 'Success',
        description: data.message,
      });
      router.refresh();
      router.push('/drafts');
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePublishToggle = () => {
    togglePublish.mutate({
      id: postId,
      published: !published,
    });
  };

  const handleDelete = () => {
    deleteDraft.mutate({ id: postId });
  };

  const handleEditClick = () => {
    const editPath = published
      ? `/blog/${postId}/edit`
      : `/drafts/${postId}/edit`;
    router.push(editPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleEditClick}>
        <EditIcon className="icon-sm mr-2" />
        Edit
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
          >
            <TrashIcon className="icon-sm mr-2" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              {published ? ' post' : ' draft'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="outline" size="sm" onClick={handlePublishToggle}>
        {published ? (
          <>
            <EyeOffIcon className="icon-sm mr-2" />
            Unpublish
          </>
        ) : (
          <>
            <EyeIcon className="icon-sm mr-2" />
            Publish
          </>
        )}
      </Button>
    </div>
  );
}

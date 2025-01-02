'use client';

import { Button } from '@/components/ui/button';
import { EditIcon, TrashIcon } from 'lucide-react';

export function PostActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <EditIcon className="icon-sm mr-2" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
      >
        <TrashIcon className="icon-sm mr-2" />
        Delete
      </Button>
    </div>
  );
}

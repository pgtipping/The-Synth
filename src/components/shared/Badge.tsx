import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        default:
          'bg-gray-50 text-gray-600 ring-gray-500/10 hover:bg-gray-100 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
        primary:
          'bg-primary-50 text-primary-700 ring-primary-700/10 hover:bg-primary-100 dark:bg-primary-400/10 dark:text-primary-400 dark:ring-primary-400/20',
        secondary:
          'bg-secondary-50 text-secondary-700 ring-secondary-700/10 hover:bg-secondary-100 dark:bg-secondary-400/10 dark:text-secondary-400 dark:ring-secondary-400/20',
      },
      clickable: {
        true: 'cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      clickable: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  onRemove?: () => void;
}

export function Badge({
  className,
  variant,
  clickable,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, clickable }), className)}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-0.5 ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm hover:bg-black/10 dark:hover:bg-white/10"
          aria-hidden="true"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </button>
      )}
    </span>
  );
}

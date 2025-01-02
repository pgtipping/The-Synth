import { type ReactNode } from 'react';

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface WithClassName {
  className?: string;
}

'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    console.error('Editor error:', error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[500px] flex-col items-center justify-center space-y-4 rounded-lg border bg-card p-8">
          <h2 className="text-xl font-semibold">Editor Error</h2>
          <p className="text-muted-foreground">
            {this.state.error?.message || 'An error occurred in the editor.'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

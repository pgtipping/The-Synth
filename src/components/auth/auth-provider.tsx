'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

function AuthContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return null;
  }

  return children;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContent>{children}</AuthContent>;
}

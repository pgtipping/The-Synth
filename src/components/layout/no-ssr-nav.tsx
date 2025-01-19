'use client';

import dynamic from 'next/dynamic';
import { NavigationMenu } from './navigation-menu';

export const NoSSRNav = dynamic(() => Promise.resolve(NavigationMenu), {
  ssr: false,
});

'use client';

import { AppProvider } from '@/context/AppContext';
import { Toaster } from '@/components/ui/toaster';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex-grow">
        {children}
      </div>
      <Toaster />
    </AppProvider>
  );
}

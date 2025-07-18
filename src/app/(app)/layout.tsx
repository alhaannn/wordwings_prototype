
'use client';
import { SidebarNav } from '@/components/SidebarNav';
import { MobileNav } from '@/components/MobileNav';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoaded } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.replace('/auth');
    }
  }, [currentUser, isLoaded, router]);

  if (!isLoaded || !currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen">
           <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
           </div>
        </div>
    );
  }


  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-card lg:block">
        <SidebarNav />
      </aside>
       <div className="flex flex-col">
        <header className="lg:hidden flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <MobileNav />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

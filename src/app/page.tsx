
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { currentUser, isLoaded } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (currentUser) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth');
      }
    }
  }, [currentUser, isLoaded, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4 space-y-4 flex flex-col items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  );
}

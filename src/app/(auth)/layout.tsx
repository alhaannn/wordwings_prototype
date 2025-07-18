
'use client';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoaded } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, isLoaded, router]);

  if (!isLoaded || currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }
  
  return <>{children}</>;
}


'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Store,
  BookCheck,
  CircleDollarSign,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn Words', icon: GraduationCap },
  { href: '/story', label: 'Story Generator', icon: Bot },
  { href: '/market', label: 'Word Market', icon: Store },
  { href: '/quiz', label: 'Practice Quiz', icon: BookCheck },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { wordCoins, currentUser, logout } = useAppContext();

  return (
    <div className="flex h-full flex-col">
      <header className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FeatherIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary-dark">
            WordWings
          </h1>
        </Link>
        {currentUser && (
            <p className="text-sm text-muted-foreground mt-2 pl-1">Welcome, {currentUser.name}!</p>
        )}
      </header>

      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      <footer className="p-4 space-y-2">
        <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={logout}
        >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
        </Button>
        <div className="rounded-lg bg-primary/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
             <CircleDollarSign className="h-6 w-6 text-primary" />
             <span className="text-2xl font-bold text-primary">{wordCoins}</span>
          </div>
          <p className="text-sm text-primary/80">WordCoins</p>
        </div>
      </footer>
    </div>
  );
}


function FeatherIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" x2="2" y1="8" y2="22" />
        <line x1="17.5" x2="9" y1="15" y2="15" />
      </svg>
    )
  }

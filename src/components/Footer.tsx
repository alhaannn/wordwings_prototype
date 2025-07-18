
import Link from 'next/link';
import { Instagram, Github, Linkedin } from 'lucide-react';

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

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
             <Link href="/dashboard" className="flex items-center gap-2">
                <FeatherIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold font-headline text-primary-dark">
                    WordWings
                </h1>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">Expand your vocabulary with AI-powered stories and quizzes.</p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
             <div>
                <h3 className="text-lg font-semibold">Quick Links</h3>
                <ul className="mt-4 space-y-2">
                <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">Dashboard</Link></li>
                <li><Link href="/learn" className="text-sm text-muted-foreground hover:text-primary">Learn Words</Link></li>
                <li><Link href="/story" className="text-sm text-muted-foreground hover:text-primary">Story Generator</Link></li>
                <li><Link href="/quiz" className="text-sm text-muted-foreground hover:text-primary">Practice Quiz</Link></li>
                </ul>
            </div>
             <div>
                <h3 className="text-lg font-semibold">Resources</h3>
                <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="mailto:alhantemporary@gmail.com" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                </ul>
            </div>
             <div>
                <h3 className="text-lg font-semibold">Connect With Us</h3>
                <div className="flex mt-4 space-x-4">
                <Link href="https://www.instagram.com/alhaaannnn/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Instagram"><Instagram /></Link>
                <Link href="https://github.com/alhaannn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="GitHub"><Github /></Link>
                <Link href="https://www.linkedin.com/in/alhan-bellary-378418340/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="LinkedIn"><Linkedin /></Link>
                </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WordWings. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

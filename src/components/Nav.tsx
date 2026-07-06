'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Compass, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/chat', label: 'Advisor' },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5 border-b border-chart-line">
      <Link href="/" className="flex items-center gap-2 font-display text-lg tracking-tight">
        <Compass className="w-5 h-5 text-brass" strokeWidth={1.5} />
        Career Compass
      </Link>
      <div className="flex items-center gap-6 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'text-ink-dim hover:text-ink transition-colors',
              pathname === l.href && 'text-ink'
            )}
          >
            {l.label}
          </Link>
        ))}
        {session?.user?.email && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 text-ink-dim hover:text-ink transition-colors"
            title={session.user.email}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}

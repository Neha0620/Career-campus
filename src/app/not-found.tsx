import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <Compass className="w-10 h-10 text-brass mb-4" strokeWidth={1.5} />
      <h1 className="font-display text-3xl mb-2">Off the map</h1>
      <p className="text-ink-dim mb-6">There's no route to that page.</p>
      <Link href="/" className="text-brass hover:underline">
        Back to base camp →
      </Link>
    </main>
  );
}

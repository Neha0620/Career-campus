'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="font-display text-2xl mb-2">The chart didn't load</h1>
      <p className="text-ink-dim text-sm mb-6">{error.message || 'Something went wrong.'}</p>
      <button onClick={reset} className="text-brass hover:underline">
        Try again
      </button>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.email?.[0] ?? data.error ?? 'Could not create account');
        }
      }

      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error('Incorrect email or password.');
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <Link href="/" className="flex items-center gap-2 font-display text-lg mb-10">
        <Compass className="w-5 h-5 text-brass" strokeWidth={1.5} />
        Career Compass
      </Link>

      <div className="w-full max-w-sm bg-chart-panel border border-chart-line rounded-lg p-8">
        <div className="flex gap-5 mb-6 text-sm">
          <button
            onClick={() => setMode('signin')}
            className={mode === 'signin' ? 'text-ink font-medium' : 'text-ink-dim'}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode('signup')}
            className={mode === 'signup' ? 'text-ink font-medium' : 'text-ink-dim'}
          >
            Create account
          </button>
        </div>

        {mode === 'signup' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full bg-chart-bg border border-chart-line rounded-md px-4 py-2.5 text-sm mb-3"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          autoComplete="email"
          className="w-full bg-chart-bg border border-chart-line rounded-md px-4 py-2.5 text-sm mb-3"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full bg-chart-bg border border-chart-line rounded-md px-4 py-2.5 text-sm mb-4"
        />
        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
        <button
          onClick={submit}
          disabled={loading || !email || !password}
          className="w-full bg-brass text-chart-bg font-medium py-2.5 rounded-md disabled:opacity-40 hover:bg-brass-dim transition-colors"
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        {mode === 'signin' && (
          <p className="text-ink-dim text-xs mt-4 text-center">
            Demo account: demo@careercompass.dev / demo1234
          </p>
        )}
      </div>
    </main>
  );
}

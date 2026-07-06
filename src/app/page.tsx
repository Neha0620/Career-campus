'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, ArrowRight } from 'lucide-react';

// Signature element: a hand-drawn route line connecting three waypoints —
// "you are here", a skill milestone, and the target role — animating in on
// load like a route being plotted on a chart. This is the one visual idea
// the whole page is built around.
function RouteLine() {
  return (
    <svg viewBox="0 0 600 200" className="w-full max-w-2xl mx-auto" aria-hidden="true">
      <motion.path
        d="M40,160 C160,160 180,40 300,60 C420,80 440,20 560,40"
        fill="none"
        stroke="#E3A64F"
        strokeWidth="2"
        strokeDasharray="6 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
      />
      {[
        { x: 40, y: 160, label: 'You are here' },
        { x: 300, y: 60, label: 'Closing the gap' },
        { x: 560, y: 40, label: 'Target role' },
      ].map((p, i) => (
        <motion.g
          key={p.label}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.5, duration: 0.4 }}
        >
          <circle cx={p.x} cy={p.y} r="6" fill="#101826" stroke="#E3A64F" strokeWidth="2" />
          <text
            x={p.x}
            y={p.y - 16}
            textAnchor={i === 2 ? 'end' : i === 0 ? 'start' : 'middle'}
            className="fill-ink-dim text-[11px] font-mono"
          >
            {p.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

export default function Landing() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-chart bg-grid-lg opacity-[0.15] pointer-events-none" />

      <nav className="relative flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 font-display text-lg tracking-tight">
          <Compass className="w-5 h-5 text-brass" strokeWidth={1.5} />
          Career Compass
        </div>
        <Link
          href="/onboarding"
          className="text-sm text-ink-dim hover:text-ink transition-colors"
        >
          Plot my course →
        </Link>
      </nav>

      <section className="relative max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <p className="font-mono text-xs tracking-widest text-brass uppercase mb-4">
          Bearing — not just a résumé score
        </p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.1] mb-6">
          Know exactly what stands
          <br />
          between you and the role you want.
        </h1>
        <p className="text-ink-dim text-lg max-w-xl mx-auto mb-10">
          Paste your resume, name your target role, and get a real skill-gap
          reading and a week-by-week route to close it — not generic advice.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-brass text-chart-bg font-medium px-6 py-3 rounded-md hover:bg-brass-dim transition-colors"
        >
          Chart my route <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-16">
          <RouteLine />
        </div>
      </section>
    </main>
  );
}

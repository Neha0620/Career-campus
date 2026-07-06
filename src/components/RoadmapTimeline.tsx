'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import type { Milestone } from '@/types';
import { cn } from '@/lib/utils';

export function RoadmapTimeline({
  milestones,
  onToggle,
}: {
  milestones: Milestone[];
  onToggle: (id: string) => void;
}) {
  return (
    <ol className="relative border-l border-chart-line ml-3">
      {milestones
        .sort((a, b) => a.order - b.order)
        .map((m, i) => (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="mb-8 ml-6"
          >
            <button
              onClick={() => onToggle(m.id)}
              className={cn(
                'absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors',
                m.completed
                  ? 'bg-signal border-signal'
                  : 'bg-chart-bg border-chart-line hover:border-brass'
              )}
              aria-label={m.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {m.completed ? (
                <Check className="w-3.5 h-3.5 text-chart-bg" />
              ) : (
                <Circle className="w-2 h-2 text-ink-dim" />
              )}
            </button>
            <h3
              className={cn(
                'font-display text-lg',
                m.completed && 'line-through text-ink-dim'
              )}
            >
              {m.title}
            </h3>
            <p className="text-sm text-ink-dim mt-1 max-w-lg">{m.description}</p>
            <span className="inline-block mt-2 font-mono text-[11px] text-brass">
              ~{m.estWeeks} {m.estWeeks === 1 ? 'week' : 'weeks'}
            </span>
          </motion.li>
        ))}
    </ol>
  );
}

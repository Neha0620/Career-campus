'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ChatTurn } from '@/types';

export function ChatWindow({ messages, streaming }: { messages: ChatTurn[]; streaming: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-5">
      {messages.length === 0 && (
        <p className="text-ink-dim text-sm">
          Ask about a skill gap, whether a move makes sense, or how to sequence your next few months.
        </p>
      )}
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('max-w-lg', m.role === 'user' ? 'ml-auto text-right' : '')}
        >
          <div
            className={cn(
              'inline-block px-4 py-2.5 rounded-lg text-sm leading-relaxed',
              m.role === 'user'
                ? 'bg-brass text-chart-bg'
                : 'bg-chart-panel border border-chart-line text-ink'
            )}
          >
            {m.content}
            {streaming && i === messages.length - 1 && m.role === 'assistant' && (
              <span className="inline-block w-1.5 h-3.5 bg-ink-dim ml-1 animate-pulse align-middle" />
            )}
          </div>
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

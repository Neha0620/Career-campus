'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Nav } from '@/components/Nav';
import { ChatWindow } from '@/components/ChatWindow';
import type { ChatTurn } from '@/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);

  async function send() {
    if (!input.trim() || streaming) return;
    const nextMessages: ChatTurn[] = [...messages, { role: 'user', content: input }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: nextMessages }),
    });

    if (!res.body) {
      setStreaming(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      assistantText += decoder.decode(value, { stream: true });
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: assistantText };
        return copy;
      });
    }
    setStreaming(false);
  }

  return (
    <main className="flex flex-col h-screen">
      <Nav />
      <ChatWindow messages={messages} streaming={streaming} />
      <div className="border-t border-chart-line px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask your advisor anything…"
            className="flex-1 bg-chart-panel border border-chart-line rounded-md px-4 py-3 text-ink text-sm"
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="bg-brass text-chart-bg p-3 rounded-md disabled:opacity-40 hover:bg-brass-dim transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

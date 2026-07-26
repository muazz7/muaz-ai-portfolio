'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Square } from 'lucide-react';

import type { ChatStatus } from '@/hooks/use-portfolio-chat';

export function ChatInput({
  status,
  toolPending,
  onSend,
  onStop,
}: {
  status: ChatStatus;
  toolPending: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const busy = status !== 'idle';

  // Refocus once a reply lands so follow-ups need no click.
  useEffect(() => {
    if (status === 'idle') ref.current?.focus();
  }, [status]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setValue('');
    onSend(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pb-3 md:pb-5"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative w-full md:px-4"
      >
        <div className="border-border/80 bg-secondary/90 mx-auto flex items-center rounded-full border py-2 pr-2 pl-5 shadow-sm backdrop-blur-xl">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={toolPending ? 'One moment…' : 'Ask me anything'}
            aria-label="Ask me anything"
            autoComplete="off"
            className="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-base focus:outline-none"
          />

          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="flex cursor-pointer items-center justify-center rounded-full bg-neutral-800 p-2.5 text-white transition-all hover:bg-neutral-700"
            >
              <Square className="size-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={value.trim().length === 0}
              aria-label="Send message"
              className="flex cursor-pointer items-center justify-center rounded-full bg-[var(--brand)] p-2.5 text-white transition-all hover:brightness-110 disabled:cursor-default disabled:opacity-50"
            >
              <ArrowUp className="size-4.5" />
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}

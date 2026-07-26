'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { Suggestions } from '@/components/chat/suggestions';
import { usePortfolioChat } from '@/hooks/use-portfolio-chat';
import { PROFILE } from '@/lib/data/profile';

export function ChatView() {
  const searchParams = useSearchParams();
  const { messages, status, error, toolPending, send, stop, retry, reset } = usePortfolioChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  /** Guards against the initial query firing twice under StrictMode. */
  const bootstrapped = useRef(false);

  // Auto-submit whatever the landing page handed us.
  useEffect(() => {
    if (bootstrapped.current) return;
    const initial = searchParams.get('query');
    if (!initial) return;
    bootstrapped.current = true;
    send(initial);
  }, [searchParams, send]);

  // Stick to the bottom while a reply streams in.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, status]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const empty = messages.length === 0;

  return (
    <div className="relative flex h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(1,113,227,0.07),transparent_70%),radial-gradient(40%_35%_at_90%_95%,rgba(245,211,114,0.12),transparent_70%)]"
      />

      <ChatHeader onReset={reset} canReset={!empty} />

      <div ref={scrollRef} className="scrollbar-hidden flex-1 overflow-y-auto overscroll-contain">
        {empty ? <EmptyState onPick={send} /> : <MessageList messages={messages} status={status} onRetry={retry} />}
        <div ref={bottomRef} className="h-1" />
      </div>

      <div className="from-background via-background/90 bg-gradient-to-t to-transparent pt-2">
        <Suggestions onPick={send} defaultOpen={empty} disabled={status !== 'idle'} />
        <ChatInput status={status} toolPending={toolPending} onSend={send} onStop={stop} />
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 pt-28 pb-8 text-center md:pt-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div
          aria-hidden
          className="absolute inset-0 scale-125 rounded-full bg-gradient-to-br from-[#F5D372]/40 via-[#1C7F84]/25 to-[#123A63]/25 blur-2xl"
        />
        <Image
          src="/muaz.jpg"
          alt={PROFILE.fullName}
          width={400}
          height={400}
          priority
          className="relative size-24 rounded-full border-4 border-white/70 object-cover shadow-xl sm:size-28 dark:border-white/10"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        Ask me anything
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5 }}
        className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed"
      >
        I&apos;m {PROFILE.name} — {PROFILE.title.toLowerCase()} from {PROFILE.location}. My projects, my stack,
        whether I&apos;m free for work. Pick one below or just type.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.5 }}
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {[
          'Who are you?',
          "What's your best project?",
          'Are you open to work?',
        ].map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="border-border/70 bg-card/70 hover:bg-secondary cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium shadow-sm backdrop-blur-xl transition-all"
          >
            {q}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

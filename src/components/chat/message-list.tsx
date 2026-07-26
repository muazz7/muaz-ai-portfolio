'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, RotateCcw } from 'lucide-react';

import { Markdown } from '@/components/chat/markdown';
import { ToolRenderer } from '@/components/chat/tool-renderer';
import type { ChatStatus } from '@/hooks/use-portfolio-chat';
import type { ChatMessage } from '@/lib/ai/protocol';
import { PROFILE } from '@/lib/data/profile';

const TOOL_LABEL: Record<string, string> = {
  getPresentation: 'Pulling up my introduction',
  getProjects: 'Opening my project gallery',
  getSkills: 'Laying out my stack',
  getResume: 'Fetching my resume',
  getContact: 'Getting my contact card',
  getSports: 'Digging into the non-code half',
  getCrazy: 'Finding the good stories',
  getInternship: 'Checking my availability',
};

export function MessageList({
  messages,
  status,
  onRetry,
}: {
  messages: ChatMessage[];
  status: ChatStatus;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pt-28 pb-6 md:pt-32">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          return message.role === 'user' ? (
            <UserBubble key={message.id} message={message} />
          ) : (
            <AssistantTurn
              key={message.id}
              message={message}
              streaming={isLast && status !== 'idle'}
              onRetry={onRetry}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-[var(--brand)] px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-sm sm:max-w-[75%]">
        {message.content}
      </div>
    </motion.div>
  );
}

function AssistantTurn({
  message,
  streaming,
  onRetry,
}: {
  message: ChatMessage;
  streaming: boolean;
  onRetry: () => void;
}) {
  const running = message.tools.filter((t) => t.state === 'running');
  const hasText = message.content.trim().length > 0;

  return (
    <motion.div layout="position" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Attribution row. */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/muaz.jpg"
          alt=""
          width={64}
          height={64}
          className="border-border size-7 rounded-full border object-cover"
        />
        <span className="text-muted-foreground text-xs font-semibold">{PROFILE.name}</span>
      </div>

      {/* Tool activity. */}
      {running.map((tool) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground flex items-center gap-2.5 text-sm"
        >
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-current"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16 }}
              />
            ))}
          </span>
          {TOOL_LABEL[tool.name] ?? 'Working on it'}…
        </motion.div>
      ))}

      <ToolRenderer tools={message.tools} />

      {hasText ? (
        <div
          className={
            message.failed
              ? 'border-destructive/30 bg-destructive/5 text-destructive flex gap-2.5 rounded-2xl border p-3.5 text-sm'
              : 'text-foreground'
          }
        >
          {message.failed ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : null}
          {message.failed ? <span>{message.content}</span> : <Markdown content={message.content} />}
        </div>
      ) : null}

      {/* Thinking indicator before the first token. */}
      {streaming && !hasText && running.length === 0 ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-current"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16 }}
              />
            ))}
          </span>
          Thinking
        </div>
      ) : null}

      {message.failed ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium"
        >
          <RotateCcw className="size-3" />
          Try again
        </button>
      ) : null}
    </motion.div>
  );
}

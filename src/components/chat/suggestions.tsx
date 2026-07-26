'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Sparkles } from 'lucide-react';

import { QUESTION_CATEGORIES } from '@/lib/data/questions';
import { cn } from '@/lib/utils';

/**
 * Collapsible question suggestions above the input. Open by default on an empty
 * conversation, collapsed to a single pill once the visitor gets going.
 */
export function Suggestions({
  onPick,
  defaultOpen = false,
  disabled = false,
}: {
  onPick: (question: string) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState<string | null>(null);

  const category = QUESTION_CATEGORIES.find((c) => c.key === active);

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="border-border/70 bg-card/70 text-muted-foreground hover:text-foreground mb-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-xl transition-all"
        >
          <Sparkles className="size-3" />
          {open ? 'Hide suggestions' : 'Need ideas?'}
          <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-3">
              {/* Category row. */}
              <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-2.5">
                {QUESTION_CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const selected = active === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setActive(selected ? null : c.key)}
                      className={cn(
                        'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                        selected
                          ? 'border-transparent text-white shadow-sm'
                          : 'border-border/70 bg-card/70 hover:bg-secondary backdrop-blur-xl',
                      )}
                      style={selected ? { backgroundColor: c.color } : undefined}
                    >
                      <Icon className="size-3" style={selected ? undefined : { color: c.color }} />
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Questions for the chosen category, or one primary each. */}
              <div className="flex flex-wrap gap-2">
                {(category
                  ? category.questions
                  : QUESTION_CATEGORIES.map((c) => c.primary)
                ).map((question) => (
                  <motion.button
                    key={question}
                    type="button"
                    disabled={disabled}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => onPick(question)}
                    className="border-border/70 bg-card/70 hover:bg-secondary cursor-pointer rounded-2xl border px-3 py-2 text-left text-xs leading-snug shadow-sm backdrop-blur-xl transition-all disabled:cursor-default disabled:opacity-50"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { motion } from 'motion/react';
import { PartyPopper } from 'lucide-react';

import { ToolCard } from '@/components/tools/tool-card';
import { PROFILE } from '@/lib/data/profile';

const ACCENTS = ['#B95F9D', '#0171E3', '#C19433', '#3E9858', '#856ED9', '#329696'];

/** `limit` trims the list - "tell me one fun fact" should show exactly one. */
export function CrazyTool({ limit }: { limit?: number | null }) {
  const facts = limit && limit > 0 ? PROFILE.funFacts.slice(0, limit) : PROFILE.funFacts;
  const narrowed = facts.length < PROFILE.funFacts.length;

  return (
    <ToolCard
      icon={PartyPopper}
      title={narrowed && facts.length === 1 ? 'One true thing about me' : 'The stuff that raises eyebrows'}
      subtitle="All of it true"
      accent="#B95F9D"
    >
      <div className="space-y-2.5">
        {facts.map((fact, index) => {
          const accent = ACCENTS[index % ACCENTS.length];
          return (
            <motion.div
              key={fact}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className="border-border/70 bg-background/60 flex gap-3.5 rounded-2xl border p-4"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ backgroundColor: `${accent}1A`, color: accent }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm leading-relaxed">{fact}</p>
            </motion.div>
          );
        })}
      </div>
    </ToolCard>
  );
}

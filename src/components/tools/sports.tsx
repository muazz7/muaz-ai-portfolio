'use client';

import { motion } from 'motion/react';
import { Coffee, Heart, Info } from 'lucide-react';

import { Pill, ToolCard } from '@/components/tools/tool-card';
import { PROFILE } from '@/lib/data/profile';

/** `focus` keeps one half: what he does, or what holds his attention. */
export function SportsTool({ focus }: { focus?: string | null }) {
  const only = focus === 'hobbies' || focus === 'interests' ? focus : null;

  return (
    <ToolCard
      icon={Coffee}
      title={only === 'interests' ? 'What holds my attention' : PROFILE.offKeyboard.headline}
      subtitle="The non-code half"
      accent="#3E9858"
    >
      {only === 'interests' ? null : (
        <ul className="space-y-2.5">
          {PROFILE.offKeyboard.items.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: index * 0.06 }}
              className="border-border/70 bg-background/60 flex items-start gap-3 rounded-2xl border p-3.5 text-sm"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600">
                <Heart className="size-3" />
              </span>
              {item}
            </motion.li>
          ))}
        </ul>
      )}

      {only === 'hobbies' ? null : (
        <div className={only === 'interests' ? '' : 'mt-4'}>
          {only === 'interests' ? null : (
            <p className="text-muted-foreground mb-2.5 text-xs font-semibold tracking-wide uppercase">
              Things that hold my attention
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {PROFILE.interests.map((interest) => (
              <Pill key={interest} accent="#3E9858">
                {interest}
              </Pill>
            ))}
          </div>
        </div>
      )}

      <p className="text-muted-foreground border-border/60 mt-4 flex gap-2 border-t pt-3.5 text-xs leading-relaxed">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Muaz hasn&apos;t published much about life away from the keyboard, so treat this as light colour rather than
        gospel.
      </p>
    </ToolCard>
  );
}

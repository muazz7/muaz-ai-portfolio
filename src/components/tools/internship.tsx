'use client';

import { motion } from 'motion/react';
import { CalendarClock, CheckCircle2, Mail, MapPinned, Target, UserRoundSearch } from 'lucide-react';

import { Pill, ToolCard } from '@/components/tools/tool-card';
import { PROFILE } from '@/lib/data/profile';

/** `focus` keeps a single row - "when can you start" needs one line, not four. */
export function InternshipTool({ focus }: { focus?: string | null }) {
  const { availability } = PROFILE;

  const allRows = [
    { id: 'lookingFor', icon: Target, label: 'Looking for', value: availability.lookingFor, accent: '#0171E3' },
    { id: 'workStyle', icon: MapPinned, label: 'Work style', value: availability.workStyle, accent: '#3E9858' },
    { id: 'startDate', icon: CalendarClock, label: 'Start date', value: availability.startDate, accent: '#856ED9' },
    { id: 'focusAreas', icon: UserRoundSearch, label: 'Focus areas', value: availability.focus, accent: '#C19433' },
  ];

  const matched = allRows.filter((row) => row.id === focus);
  const narrowed = matched.length > 0;
  const rows = narrowed ? matched : allRows;

  return (
    <ToolCard bare>
      <div className="relative overflow-hidden px-5 py-5">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(70%_60%_at_10%_0%,rgba(62,152,88,0.16),transparent_70%)]"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">
                {availability.open ? "Yes - I'm open" : 'Currently not looking'}
              </h3>
              {availability.open ? (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs">{PROFILE.location} · {PROFILE.timezone}</p>
          </div>
        </div>
      </div>

      <div className="border-border/60 space-y-2.5 border-t p-5">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.05 }}
              className="border-border/70 bg-background/60 flex items-start gap-3 rounded-2xl border p-3.5"
            >
              <span
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${row.accent}1A`, color: row.accent }}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  {row.label}
                </p>
                <p className="text-sm font-medium first-letter:uppercase">{row.value}</p>
              </div>
            </motion.div>
          );
        })}

        {narrowed ? null : (
          <div className="pt-1.5">
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              What I bring
            </p>
            <div className="flex flex-wrap gap-2">
              {PROFILE.traits.map((trait) => (
                <Pill key={trait.label} accent="#3E9858">
                  {trait.label}
                </Pill>
              ))}
            </div>
          </div>
        )}

        <a
          href={`mailto:${PROFILE.email}?subject=${encodeURIComponent('Opportunity for Muaz')}`}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
        >
          <Mail className="size-3.5" />
          Email me about it
        </a>
      </div>
    </ToolCard>
  );
}

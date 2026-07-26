'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { GraduationCap, MapPin, Sparkles, Users } from 'lucide-react';

import { Pill, ToolCard } from '@/components/tools/tool-card';
import { PROFILE } from '@/lib/data/profile';

export function PresentationTool() {
  return (
    <ToolCard bare>
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(245,211,114,0.22),transparent_70%),radial-gradient(70%_60%_at_90%_20%,rgba(28,127,132,0.18),transparent_70%)]"
        />

        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="shrink-0"
          >
            <Image
              src="/muaz.jpg"
              alt={PROFILE.fullName}
              width={200}
              height={200}
              className="size-20 rounded-2xl border-2 border-white/70 object-cover shadow-lg sm:size-24 dark:border-white/10"
            />
          </motion.div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{PROFILE.fullName}</h2>
            <p className="text-muted-foreground text-sm font-medium">{PROFILE.title}</p>
            <p className="mt-2.5 text-sm leading-relaxed">{PROFILE.story.short}</p>
          </div>
        </div>
      </div>

      <div className="border-border/60 grid grid-cols-1 gap-px border-t sm:grid-cols-2">
        <Fact icon={MapPin} label="Based in" value={PROFILE.location} accent="#0171E3" />
        <Fact
          icon={GraduationCap}
          label="Studying"
          value={`${PROFILE.education[0].credential.replace('B.Sc. in ', '')} · ${PROFILE.education[0].institution}`}
          accent="#3E9858"
        />
        <Fact icon={Users} label="Also" value={PROFILE.roles[0].role} accent="#856ED9" />
        <Fact icon={Sparkles} label="From" value={PROFILE.hometown} accent="#C19433" />
      </div>

      <div className="border-border/60 border-t p-5">
        <p className="text-muted-foreground mb-2.5 text-xs font-semibold tracking-wide uppercase">
          How people describe working with me
        </p>
        <div className="flex flex-wrap gap-2">
          {PROFILE.traits.map((trait) => (
            <Pill key={trait.label} accent="#0171E3">
              {trait.label}
            </Pill>
          ))}
        </div>
      </div>
    </ToolCard>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-card/40 flex items-start gap-3 px-5 py-4">
      <span
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

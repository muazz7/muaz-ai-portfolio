'use client';

import { motion } from 'motion/react';
import { Briefcase, Download, FileText, GraduationCap, Mail } from 'lucide-react';

import { Pill, ToolCard } from '@/components/tools/tool-card';
import { PROFILE } from '@/lib/data/profile';
import { PROJECTS } from '@/lib/data/projects';

/** `focus` trims this to one section for a question about only that section. */
export function ResumeTool({ focus }: { focus?: string | null }) {
  const clientCount = PROJECTS.filter((p) => p.category === 'clients').length;
  const only = focus === 'education' || focus === 'roles' ? focus : null;

  return (
    <ToolCard
      icon={only === 'education' ? GraduationCap : only === 'roles' ? Briefcase : FileText}
      title={only === 'education' ? 'Education' : only === 'roles' ? 'Roles' : 'Resume'}
      subtitle={`${PROFILE.fullName} · ${PROFILE.title}`}
      accent="#0171E3"
    >
      {/* Headline numbers - only meaningful on the full card. */}
      {only ? null : (
        <div className="mb-5 grid grid-cols-3 gap-3">
          <Stat value={String(PROJECTS.length)} label="Public projects" />
          <Stat value={String(clientCount)} label="Built for clients" />
          <Stat value="2026" label="Graduating soon" />
        </div>
      )}

      {only === 'roles' ? null : (
        <Section icon={GraduationCap} title="Education" accent="#3E9858">
          {PROFILE.education.map((entry, index) => (
            <motion.div
              key={entry.institution}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className="border-border/70 relative border-l pb-4 pl-4 last:pb-0"
            >
              <span className="bg-background absolute top-1 -left-[4.5px] size-2 rounded-full border-2 border-[#3E9858]" />
              <div className="flex flex-wrap items-center gap-2">
                <h5 className="text-sm font-semibold">{entry.credential}</h5>
                {entry.current ? <Pill accent="#3E9858">Current</Pill> : null}
              </div>
              <p className="text-muted-foreground text-xs">
                {entry.institution} · {entry.location} · {entry.period}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{entry.detail}</p>
            </motion.div>
          ))}
        </Section>
      )}

      {only === 'education' ? null : (
        <Section icon={Briefcase} title="Roles" accent="#856ED9">
          {PROFILE.roles.map((role, index) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.06 }}
              className="border-border/70 relative border-l pb-4 pl-4 last:pb-0"
            >
              <span className="bg-background absolute top-1 -left-[4.5px] size-2 rounded-full border-2 border-[#856ED9]" />
              <h5 className="text-sm font-semibold">{role.role}</h5>
              <p className="text-muted-foreground text-xs">
                {role.org} · {role.period}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{role.detail}</p>
            </motion.div>
          ))}
        </Section>
      )}

      <div className="border-border/60 mt-5 flex flex-wrap gap-2.5 border-t pt-5">
        <a
          href={PROFILE.resumeUrl}
          download
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
        >
          <Download className="size-3.5" />
          Download PDF
        </a>
        <a
          href={`mailto:${PROFILE.email}`}
          className="border-border hover:bg-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all"
        >
          <Mail className="size-3.5" />
          {PROFILE.email}
        </a>
      </div>
    </ToolCard>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-border/70 bg-background/60 rounded-2xl border p-3 text-center">
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="text-muted-foreground text-[11px] leading-tight">{label}</p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-3.5" style={{ color: accent }} />
        <h4 className="text-xs font-semibold tracking-wide uppercase">{title}</h4>
      </div>
      {children}
    </div>
  );
}

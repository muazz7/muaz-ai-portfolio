'use client';

import { motion } from 'motion/react';
import {
  Brain,
  Code2,
  Layers,
  Server,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { Pill, ToolCard } from '@/components/tools/tool-card';
import { LEARNING_NOW, SKILL_GROUPS, findSkillGroup, type SkillGroup } from '@/lib/data/skills';

const ICONS: Record<SkillGroup['icon'], LucideIcon> = {
  code: Code2,
  sparkles: Sparkles,
  wrench: Wrench,
  smartphone: Smartphone,
  server: Server,
  brain: Brain,
};

/**
 * `focus` narrows this to one group, or to the learning list on its own. A
 * question about Flutter should not unfold all six categories.
 */
export function SkillsTool({ focus }: { focus?: string | null }) {
  const resolved = findSkillGroup(focus);

  if (resolved === 'learning') return <LearningCard standalone />;
  if (resolved) return <GroupCard group={resolved} />;

  return (
    <ToolCard icon={Layers} title="What I work with" subtitle="Grouped by what I actually reach for" accent="#856ED9">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SKILL_GROUPS.map((group, index) => {
          const Icon = ICONS[group.icon];
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-border/70 bg-background/60 rounded-2xl border p-4"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="flex size-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${group.color}1A`, color: group.color }}
                >
                  <Icon className="size-3.5" />
                </span>
                <h4 className="text-sm font-semibold">{group.title}</h4>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <Pill key={skill} accent={group.color} className="px-2 py-0.5 text-[11px]">
                    {skill}
                  </Pill>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <LearningCard />
    </ToolCard>
  );
}

/** A single group, on its own, when the question was about one area. */
function GroupCard({ group }: { group: SkillGroup }) {
  const Icon = ICONS[group.icon];

  return (
    <ToolCard icon={Icon} title={group.title} subtitle="The part you asked about" accent={group.color}>
      <div className="flex flex-wrap gap-2">
        {group.skills.map((skill, index) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: index * 0.04 }}
          >
            <Pill accent={group.color}>{skill}</Pill>
          </motion.span>
        ))}
      </div>
    </ToolCard>
  );
}

function LearningCard({ standalone = false }: { standalone?: boolean }) {
  const body = (
    <>
      <div className="mb-2.5 flex items-center gap-2">
        <TrendingUp className="size-3.5 text-emerald-600" />
        <h4 className="text-xs font-semibold tracking-wide uppercase">Levelling up right now</h4>
      </div>
      <ul className="text-muted-foreground space-y-1.5 text-sm">
        {LEARNING_NOW.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-emerald-600">→</span>
            {item}
          </li>
        ))}
      </ul>
    </>
  );

  if (standalone) {
    return (
      <ToolCard icon={TrendingUp} title="What I'm learning" subtitle="Honest about what's in progress" accent="#3E9858">
        <ul className="text-muted-foreground space-y-2 text-sm">
          {LEARNING_NOW.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.26, delay: index * 0.05 }}
              className="flex gap-2"
            >
              <span className="text-emerald-600">→</span>
              {item}
            </motion.li>
          ))}
        </ul>
      </ToolCard>
    );
  }

  return <div className="border-border/60 mt-4 rounded-2xl border border-dashed p-4">{body}</div>;
}

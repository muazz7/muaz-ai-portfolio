'use client';

import { motion } from 'motion/react';

import { ContactTool } from '@/components/tools/contact';
import { CrazyTool } from '@/components/tools/crazy';
import { InternshipTool } from '@/components/tools/internship';
import { PresentationTool } from '@/components/tools/presentation';
import { ProjectsTool } from '@/components/tools/projects';
import { ResumeTool } from '@/components/tools/resume';
import { SkillsTool } from '@/components/tools/skills';
import { SportsTool } from '@/components/tools/sports';
import type { ToolInvocation } from '@/lib/ai/protocol';

/**
 * The generative-UI switch: a tool name in, a real component out.
 *
 * This is the whole trick behind the site. The model never writes markup - it
 * picks a tool, and the browser decides what that looks like.
 */
export function ToolRenderer({ tools }: { tools: ToolInvocation[] }) {
  const ready = tools.filter((t) => t.state === 'done');
  if (ready.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {ready.map((tool) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {renderTool(tool)}
        </motion.div>
      ))}
    </div>
  );
}

function renderTool(tool: ToolInvocation) {
  const focus = readFocus(tool.result);

  switch (tool.name) {
    case 'getPresentation':
      return <PresentationTool />;
    case 'getProjects':
      return <ProjectsTool focus={focus} />;
    case 'getSkills':
      return <SkillsTool focus={focus} />;
    case 'getResume':
      return <ResumeTool focus={focus} />;
    case 'getContact':
      return <ContactTool focus={focus} />;
    case 'getSports':
      return <SportsTool focus={focus} />;
    case 'getCrazy':
      return <CrazyTool limit={readLimit(tool.result)} />;
    case 'getInternship':
      return <InternshipTool focus={focus} />;
    default:
      return null;
  }
}

/**
 * Every tool echoes the narrowing it applied back in its result, so the card on
 * screen shows exactly the slice the model answered about. `highlighted.slug` is
 * the older projects-only shape, kept as a fallback.
 */
function readFocus(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null;
  const payload = result as { focus?: unknown; highlighted?: { slug?: unknown } };
  if (typeof payload.focus === 'string' && payload.focus) return payload.focus;
  if (typeof payload.highlighted?.slug === 'string') return payload.highlighted.slug;
  return null;
}

function readLimit(result: unknown): number | null {
  if (!result || typeof result !== 'object') return null;
  const limit = (result as { limit?: unknown }).limit;
  return typeof limit === 'number' && limit > 0 ? limit : null;
}

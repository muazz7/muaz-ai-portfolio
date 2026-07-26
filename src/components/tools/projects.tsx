'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, LayoutGrid, Star } from 'lucide-react';

import { GithubIcon } from '@/components/brand-icons';
import { Pill } from '@/components/tools/tool-card';
import { cn } from '@/lib/utils';
import {
  CATEGORY_LABELS,
  PROJECTS,
  findProject,
  type Project,
  type ProjectCategory,
} from '@/lib/data/projects';

type Filter = 'all' | ProjectCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'apps', label: CATEGORY_LABELS.apps },
  { key: 'clients', label: CATEGORY_LABELS.clients },
];

const STATUS_STYLE: Record<Project['status'], { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-emerald-500/12 text-emerald-600 border-emerald-500/25' },
  wip: { label: 'Ongoing', className: 'bg-amber-500/12 text-amber-600 border-amber-500/25' },
  archived: { label: 'Archived', className: 'bg-neutral-500/12 text-neutral-500 border-neutral-500/25' },
};

/**
 * `focus` comes from the model's tool arguments, e.g. "tell me about Muaz OS".
 *
 * A focused question gets a focused answer: one project, in detail, with the
 * gallery available behind a button. Dropping 17 cards on someone who asked
 * about one build is noise.
 */
export function ProjectsTool({ focus }: { focus?: string | null }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);

  const focused = useMemo(() => findProject(focus), [focus]);

  const projects = useMemo(() => {
    const list = filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
    const sorted = [...list].sort((a, b) => b.weight - a.weight);
    if (!focused) return sorted;

    // Pull the highlighted project to the front rather than filtering the rest out.
    const index = sorted.findIndex((p) => p.slug === focused.slug);
    if (index <= 0) return sorted;
    return [sorted[index], ...sorted.slice(0, index), ...sorted.slice(index + 1)];
  }, [filter, focused]);

  if (focused && !showAll) {
    return <SingleProject project={focused} onShowAll={() => setShowAll(true)} />;
  }

  return (
    <div className="border-border/70 bg-card/70 w-full overflow-hidden rounded-3xl border shadow-sm backdrop-blur-xl">
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Everything I&apos;ve shipped</h3>
          <p className="text-muted-foreground text-xs">
            {PROJECTS.length} public projects · {PROJECTS.filter((p) => p.category === 'clients').length} built for
            other people
          </p>
        </div>

        <div className="bg-secondary/70 flex gap-1 rounded-full p-1" role="tablist" aria-label="Filter projects">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
                filter === f.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <motion.article
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
              className={cn(
                'group border-border/70 bg-background/60 relative flex flex-col rounded-2xl border p-4 transition-all hover:shadow-md',
                focused?.slug === project.slug && 'ring-2 ring-[var(--brand)]/40',
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="text-sm leading-tight font-semibold">{project.title}</h4>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                    STATUS_STYLE[project.status].className,
                  )}
                >
                  {STATUS_STYLE[project.status].label}
                </span>
              </div>

              <p className="text-muted-foreground mb-3 text-xs leading-relaxed">{project.tagline}</p>

              <div className="mb-3.5 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 3).map((tech) => (
                  <Pill key={tech} className="px-2 py-0.5 text-[10px]">
                    {tech}
                  </Pill>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-3 text-xs">
                {project.live ? (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 font-medium text-[var(--brand)] hover:underline"
                  >
                    Visit
                    <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
                >
                  <GithubIcon className="size-3" />
                  Code
                </a>
                {focused?.slug === project.slug ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--brand)]">
                    <Star className="size-3 fill-current" />
                    You asked about this
                  </span>
                ) : null}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * The focused view: everything about one project, nothing about the other
 * sixteen. The gallery is one click away for anyone who wants it.
 */
function SingleProject({ project, onShowAll }: { project: Project; onShowAll: () => void }) {
  const status = STATUS_STYLE[project.status];

  return (
    <div className="border-border/70 bg-card/70 w-full overflow-hidden rounded-3xl border shadow-sm backdrop-blur-xl">
      <div className="border-border/60 flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-base leading-tight font-semibold tracking-tight">{project.title}</h3>
            <span
              className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', status.className)}
            >
              {status.label}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            {CATEGORY_LABELS[project.category]} · {project.year}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--brand)]">
          <Star className="size-3 fill-current" />
          You asked about this
        </div>
      </div>

      <div className="p-5">
        <p className="mb-3 text-sm font-medium">{project.tagline}</p>
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{project.description}</p>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <Pill key={tech} className="px-2 py-0.5 text-[10px]">
              {tech}
            </Pill>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {project.live ? (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-medium text-[var(--brand)] hover:underline"
            >
              Visit it live
              <ArrowUpRight className="size-3" />
            </a>
          ) : null}
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
          >
            <GithubIcon className="size-3" />
            Source
          </a>

          <button
            type="button"
            onClick={onShowAll}
            className="border-border/70 hover:bg-secondary/70 text-muted-foreground hover:text-foreground ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium transition-colors"
          >
            <LayoutGrid className="size-3" />
            All {PROJECTS.length} projects
          </button>
        </div>
      </div>
    </div>
  );
}

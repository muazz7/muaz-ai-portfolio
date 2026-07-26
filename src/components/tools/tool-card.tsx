import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Shared chrome for every tool component, so eight different panels still read
 * as one coherent system.
 */
export function ToolCard({
  icon: Icon,
  title,
  subtitle,
  accent = '#0171E3',
  children,
  className,
  bare = false,
}: {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  accent?: string;
  children: ReactNode;
  className?: string;
  /** Skips the padded container - for components that manage their own layout. */
  bare?: boolean;
}) {
  return (
    <div
      className={cn(
        'border-border/70 bg-card/70 w-full overflow-hidden rounded-3xl border shadow-sm backdrop-blur-xl',
        className,
      )}
    >
      {title ? (
        <div className="border-border/60 flex items-center gap-3 border-b px-5 py-4">
          {Icon ? (
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accent}1A`, color: accent }}
            >
              <Icon className="size-4.5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight">{title}</h3>
            {subtitle ? <p className="text-muted-foreground truncate text-xs">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}

      <div className={bare ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

export function Pill({
  children,
  accent,
  className,
}: {
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        accent ? '' : 'border-border bg-secondary text-secondary-foreground',
        className,
      )}
      style={accent ? { backgroundColor: `${accent}14`, color: accent, borderColor: `${accent}33` } : undefined}
    >
      {children}
    </span>
  );
}

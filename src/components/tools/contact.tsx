'use client';

import type { ComponentType, SVGProps } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Globe, Mail, MapPin } from 'lucide-react';

import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  RedditIcon,
  WhatsappIcon,
  XIcon,
} from '@/components/brand-icons';
import { ToolCard } from '@/components/tools/tool-card';
import { CONTACT_CHANNELS, PROFILE, findChannel, type ContactChannelId } from '@/lib/data/profile';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Presentation only - the channel data itself lives in `data/profile`. */
const STYLE: Record<ContactChannelId, { icon: IconComponent; accent: string }> = {
  email: { icon: Mail, accent: '#0171E3' },
  whatsapp: { icon: WhatsappIcon, accent: '#25D366' },
  github: { icon: GithubIcon, accent: '#6E5494' },
  instagram: { icon: InstagramIcon, accent: '#C13584' },
  x: { icon: XIcon, accent: '#0F1419' },
  facebook: { icon: FacebookIcon, accent: '#1877F2' },
  reddit: { icon: RedditIcon, accent: '#FF4500' },
};

/**
 * `focus` narrows this to a single channel. Someone who asked for a WhatsApp
 * number gets a WhatsApp number, not a directory of every way to reach Muaz.
 */
export function ContactTool({ focus }: { focus?: string | null }) {
  const single = findChannel(focus);
  if (single) return <SingleChannel id={single.id} label={single.label} value={single.value} href={single.href} />;

  return (
    <ToolCard icon={Mail} title="Get in touch" subtitle="Email is fastest. I actually reply." accent="#C19433">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {CONTACT_CHANNELS.map((channel, index) => {
          const { icon: Icon, accent } = STYLE[channel.id];
          return (
            <motion.a
              key={channel.id}
              href={channel.href}
              target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer noopener"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="group border-border/70 bg-background/60 flex items-center gap-3 rounded-2xl border p-3.5 transition-all hover:shadow-md"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${accent}1A`, color: accent }}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wide uppercase opacity-60">{channel.label}</p>
                <p className="truncate text-sm font-medium">{channel.value}</p>
              </div>
            </motion.a>
          );
        })}
      </div>

      <div className="border-border/60 text-muted-foreground mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {PROFILE.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Globe className="size-3.5" />
          {PROFILE.timezone}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PROFILE.sites.map((site) => (
          <a
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noreferrer noopener"
            title={site.note}
            className="border-border hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all"
          >
            {site.label}
          </a>
        ))}
      </div>
    </ToolCard>
  );
}

/** One channel, one row. Nothing else. */
function SingleChannel({
  id,
  label,
  value,
  href,
}: {
  id: ContactChannelId;
  label: string;
  value: string;
  href: string;
}) {
  const { icon: Icon, accent } = STYLE[id];

  return (
    <div className="border-border/70 bg-card/70 w-full overflow-hidden rounded-3xl border shadow-sm backdrop-blur-xl">
      <a
        href={href}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel="noreferrer noopener"
        className="group flex items-center gap-4 p-5 transition-colors hover:bg-secondary/40"
      >
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{label}</p>
          <p className="truncate text-base font-semibold tracking-tight">{value}</p>
        </div>

        <ArrowUpRight className="text-muted-foreground group-hover:text-foreground ml-auto size-4 shrink-0 transition-colors" />
      </a>
    </div>
  );
}

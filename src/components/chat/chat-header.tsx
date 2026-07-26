'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, RotateCcw } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { WelcomeModal } from '@/components/welcome-modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PROFILE } from '@/lib/data/profile';

export function ChatHeader({ onReset, canReset }: { onReset: () => void; canReset: boolean }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-x-0 top-0 z-40"
    >
      {/* Fade so messages slide under the header instead of colliding with it. */}
      <div
        aria-hidden
        className="from-background via-background/85 pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent"
      />

      <div className="relative mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <WelcomeModal
            trigger={
              <button
                type="button"
                aria-label="About this site"
                className="border-border/70 bg-card/70 flex cursor-pointer items-center gap-2.5 rounded-full border py-1.5 pr-3.5 pl-1.5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md"
              >
                <Image
                  src="/muaz.jpg"
                  alt=""
                  width={64}
                  height={64}
                  className="size-7 rounded-full object-cover"
                />
                <span className="text-left">
                  <span className="block text-xs leading-tight font-semibold">{PROFILE.name}</span>
                  <span className="text-muted-foreground block text-[10px] leading-tight">
                    {PROFILE.title}
                  </span>
                </span>
              </button>
            }
          />
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-2">
            {canReset ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={onReset}
                    className="cursor-pointer rounded-full"
                    aria-label="Start a new conversation"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New conversation</TooltipContent>
              </Tooltip>
            ) : null}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="glass" size="icon" asChild className="rounded-full">
                  <Link href="/" aria-label="Back to home">
                    <Home className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Home</TooltipContent>
            </Tooltip>

            <ThemeToggle />
          </div>
        </TooltipProvider>
      </div>
    </motion.header>
  );
}

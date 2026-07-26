'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { GithubIcon } from '@/components/brand-icons';
import { FluidCanvas } from '@/components/fluid-canvas';
import { ThemeToggle } from '@/components/theme-toggle';
import { WelcomeModal } from '@/components/welcome-modal';
import { Button } from '@/components/ui/button';
import { PROFILE } from '@/lib/data/profile';
import { PLACEHOLDER_QUESTIONS, QUESTION_CATEGORIES } from '@/lib/data/questions';

export default function LandingPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate the placeholder so the input hints at what is possible.
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_QUESTIONS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  // Warm the chat route so the first navigation feels instant.
  useEffect(() => {
    router.prefetch('/chat');
  }, [router]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    router.push(`/chat?query=${encodeURIComponent(trimmed)}`);
  };

  const tiles = useMemo(() => QUESTION_CATEGORIES, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-10 md:pb-20">
      {/* Soft static wash underneath the fluid, so the page never looks empty. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(1,113,227,0.10),transparent_70%),radial-gradient(45%_40%_at_85%_85%,rgba(245,211,114,0.16),transparent_70%),radial-gradient(40%_35%_at_10%_75%,rgba(28,127,132,0.12),transparent_70%)]"
      />

      {/* Giant faded wordmark. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div
          aria-hidden
          className="hidden bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[10rem] leading-none font-black text-transparent select-none sm:block lg:text-[16rem]"
          style={{ marginBottom: '-2.5rem' }}
        >
          {PROFILE.wordmark}
        </div>
      </div>

      {/* Top-left: link out to the rest of my work. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="fixed top-6 left-4 z-40 md:top-8 md:left-6"
      >
        <Button
          asChild
          variant="glass"
          size="auto"
          className="group cursor-pointer rounded-full border px-4 py-2.5 transition-all duration-300 hover:shadow-xl"
        >
          <Link href={PROFILE.socials.github} target="_blank" rel="noreferrer noopener">
            <GithubIcon className="h-4 w-4" />
            <span className="text-foreground hidden text-sm font-medium sm:inline">See the code</span>
            <span className="text-foreground text-sm font-medium sm:hidden">Code</span>
            <ChevronRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:block" />
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="fixed top-6 right-4 z-40 md:top-8 md:right-6"
      >
        <ThemeToggle />
      </motion.div>

      {/* Hero copy. */}
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 mt-24 mb-6 flex flex-col items-center text-center md:mt-4 md:mb-10"
      >
        <div className="z-50">
          <WelcomeModal />
        </div>
        <h2 className="text-secondary-foreground mt-3 text-xl font-semibold md:text-2xl">
          Hey, I&apos;m {PROFILE.name} <span className="inline-block animate-[float_6s_ease-in-out_infinite]">👋</span>
        </h2>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">{PROFILE.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-md text-sm md:text-base">{PROFILE.headline}</p>
      </motion.div>

      {/* Portrait. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <div className="relative h-40 w-40 sm:h-52 sm:w-52 md:h-60 md:w-60">
          <div
            aria-hidden
            className="absolute inset-0 scale-110 rounded-full bg-gradient-to-br from-[#F5D372]/50 via-[#1C7F84]/30 to-[#123A63]/30 blur-2xl"
          />
          <Image
            src="/muaz.jpg"
            alt={`${PROFILE.fullName}, ${PROFILE.title}`}
            width={864}
            height={864}
            priority
            sizes="(max-width: 640px) 160px, 240px"
            className="relative h-full w-full rounded-full border-4 border-white/70 object-cover shadow-2xl dark:border-white/10"
          />
          {PROFILE.availability.open ? (
            <span className="absolute -right-1 bottom-3 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/80 dark:text-neutral-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {PROFILE.availability.headline}
            </span>
          ) : null}
        </div>
      </motion.div>

      {/* Ask box + tiles. */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 mt-8 flex w-full flex-col items-center justify-center md:px-0"
      >
        <form
          className="relative w-full max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <div className="mx-auto flex items-center rounded-full border border-neutral-200 bg-white/50 py-2.5 pr-2 pl-6 backdrop-blur-lg transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/70 dark:hover:border-neutral-600">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Ask me anything"
                className="w-full border-none bg-transparent text-base text-neutral-800 focus:outline-none dark:text-neutral-200"
                autoComplete="off"
              />
              {input.length === 0 ? (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-base text-neutral-500 dark:text-neutral-500"
                  >
                    {PLACEHOLDER_QUESTIONS[placeholderIndex]}
                  </motion.span>
                </AnimatePresence>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={input.trim().length === 0}
              aria-label="Submit question"
              className="flex cursor-pointer items-center justify-center rounded-full bg-[var(--brand)] p-2.5 text-white transition-all hover:brightness-110 disabled:cursor-default disabled:opacity-60"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="mt-4 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {tiles.map((category, index) => {
            const Icon = category.icon;
            const isLastOdd = index === tiles.length - 1 && tiles.length % 2 !== 0;
            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + index * 0.06, duration: 0.4 }}
                className={isLastOdd ? 'col-span-2 sm:col-span-1' : undefined}
              >
                <Button
                  variant="glass"
                  onClick={() => ask(category.primary)}
                  title={category.primary}
                  className="border-border hover:bg-border/30 aspect-square h-auto w-full cursor-pointer rounded-2xl border py-8 shadow-none active:scale-95 md:p-10"
                >
                  <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-1.5">
                    <Icon size={22} strokeWidth={2} style={{ color: category.color }} />
                    <span className="text-xs font-medium sm:text-sm">{category.label}</span>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* The fluid lives behind everything and ignores pointer events. */}
      <div className="pointer-events-none fixed top-0 left-0 -z-[5]">
        <FluidCanvas className="h-screen w-screen" />
      </div>
    </div>
  );
}

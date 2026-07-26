'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PROFILE } from '@/lib/data/profile';

/**
 * The "what am I looking at" modal, opened by the logo on both pages.
 */
export function WelcomeModal({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const defaultTrigger = (
    <Button
      variant="glass"
      size="auto"
      className="cursor-pointer rounded-2xl p-3 shadow-lg"
      aria-label={`About this site`}
    >
      <Image src="/logo.svg" width={100} height={100} alt="" className="w-6 md:w-8" priority />
      <span className="sr-only">About {PROFILE.name}&apos;s AI portfolio</span>
    </Button>
  );

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger ?? defaultTrigger}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="z-52 max-h-[85vh] overflow-auto rounded-3xl border-none p-0 shadow-2xl sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[880px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col"
          >
            <DialogHeader className="relative flex flex-row items-start justify-between px-6 pt-8 pb-4 md:px-8">
              <div>
                <DialogTitle className="flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl">
                  <Image src="/logo.svg" width={44} height={44} alt="" className="rounded-xl" />
                  Welcome to my AI portfolio
                </DialogTitle>
                <DialogDescription className="mt-2 text-base">
                  A portfolio you talk to instead of scroll through.
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="sticky top-0 right-0 cursor-pointer rounded-full bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto px-4 pb-2 md:px-8">
              <section className="bg-accent space-y-7 rounded-2xl p-6 md:p-8">
                <div className="space-y-2.5">
                  <h3 className="text-primary text-xl font-semibold">What is this?</h3>
                  <p className="text-accent-foreground text-base leading-relaxed">
                    I&apos;m {PROFILE.name} — a {PROFILE.title.toLowerCase()} from {PROFILE.location}. This is my{' '}
                    <strong>AI portfolio</strong>. Ask it anything: what I&apos;ve built, what I&apos;m good at,
                    whether I&apos;m free for work. It answers in my voice, from my own notes.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-primary text-xl font-semibold">Why?</h3>
                  <p className="text-accent-foreground text-base leading-relaxed">
                    A normal portfolio shows everyone the same thing. A recruiter, a client and a curious friend all
                    want different answers, and none of them want to hunt for them.
                    <br />
                    So this one becomes{' '}
                    <strong>whatever you specifically care about</strong> — and it renders real components, not just
                    walls of text.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-primary text-xl font-semibold">How it works</h3>
                  <p className="text-accent-foreground text-base leading-relaxed">
                    Your question goes to a language model that has my profile, every project and a set of written
                    notes in context. It can call tools that mount live UI — a project gallery, my skill board, my
                    contact card. Grounded in real data, so it should never make things up about me.
                  </p>
                </div>
              </section>
            </div>

            <div className="flex flex-col items-center gap-4 px-6 pt-5 pb-8 md:px-8">
              <Button onClick={() => setOpen(false)} className="h-auto rounded-full px-6 py-3" size="sm">
                Start chatting
              </Button>
              <div className="text-muted-foreground flex flex-wrap justify-center gap-1.5 text-center text-sm">
                <span>Built it myself. If you like it,</span>
                <button
                  type="button"
                  className="cursor-pointer text-blue-500 hover:underline"
                  onClick={() => {
                    setOpen(false);
                    router.push('/chat?query=How%20can%20I%20reach%20you%3F');
                  }}
                >
                  say hi.
                </button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}

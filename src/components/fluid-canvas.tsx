'use client';

import { useEffect, useRef } from 'react';

import { initFluidSimulation } from '@/lib/fluid-simulation';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * Mounts the WebGL fluid background. Skipped entirely when the visitor has
 * reduced-motion enabled, or when the GPU has no usable float texture path -
 * in both cases the page just shows the static gradient underneath.
 */
export function FluidCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    let dispose: (() => void) | undefined;

    // Defer a frame so the canvas has real layout dimensions to size against.
    const raf = requestAnimationFrame(() => {
      dispose = initFluidSimulation(canvas, {
        // Mobile GPUs get a lighter sim.
        dyeResolution: window.innerWidth < 768 ? 512 : 1024,
        simResolution: window.innerWidth < 768 ? 96 : 128,
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      dispose?.();
    };
  }, []);

  return <canvas ref={ref} id="fluid" className={className} aria-hidden="true" />;
}

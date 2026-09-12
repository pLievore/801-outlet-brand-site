'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';

/**
 * Top navigation progress bar.
 *
 * Provides immediate tactile visual feedback when navigating between server-rendered
 * pages, particularly valuable on preview environments (cold starts, unprimed caches)
 * and mobile networks.
 *
 * Automatically tracks document-level link navigations, animates across the top of
 * the viewport, and cleanly fades out as soon as the target route mounts.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  const [state, setState] = useState<'idle' | 'loading' | 'finishing'>('idle');
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // When pathname changes, route has loaded -> complete progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setState((current) => {
        if (current === 'loading') {
          setProgress(100);
          return 'finishing';
        }
        return current;
      });

      timerRef.current = setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 200);
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Listen to document link clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Only handle primary clicks without modifier keys
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore external, anchor hash, tel, mailto
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        anchor.target === '_blank'
      ) {
        return;
      }

      // Check if it's the exact same URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start loading animation immediately
      setState('loading');
      setProgress(25);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setProgress((prev) => (prev < 80 ? 75 : prev));
      }, 250);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  if (state === 'idle' || reducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2.5px]"
    >
      <div
        className="h-full bg-[rgb(var(--accent))] shadow-[0_0_8px_rgba(var(--accent),0.6)] transition-[width,opacity] duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: state === 'finishing' ? 0 : 1,
        }}
      />
    </div>
  );
}

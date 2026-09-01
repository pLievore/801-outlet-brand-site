'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { HAPTIC, haptic } from '../../src/lib/haptics';

type GalleryImage = { url: string; alt: string | null };

type Props = {
  images: GalleryImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomTriggerRef = useRef<HTMLButtonElement>(null);
  // The global CSS rule collapses transitions, but Motion drives these
  // transforms in JavaScript and never sees it. A full-screen zoom that scales
  // in is exactly the movement someone asking for less motion is avoiding.
  const reducedMotion = useReducedMotion();
  const zoomDialogRef = useRef<HTMLDivElement>(null);

  /**
   * Swiping the photo is how a phone expects to move through a gallery, and
   * without it the only way through was aiming at thumbnails the size of a
   * stamp. Most of the people looking at these sofas are holding a phone.
   *
   * The gesture only claims the finger once it is clearly horizontal —
   * otherwise it would fight the page scroll, which is the same finger doing
   * the far more common thing.
   */
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const swipeProps = {
    onPointerDown: (event: React.PointerEvent) => {
      swipeStart.current = { x: event.clientX, y: event.clientY };
      swiped.current = false;
    },
    onPointerMove: (event: React.PointerEvent) => {
      const start = swipeStart.current;
      if (!start || swiped.current || images.length < 2) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 44 || Math.abs(dx) <= Math.abs(dy)) return;

      swiped.current = true;
      const direction = dx < 0 ? 1 : -1;
      setActiveIndex(
        (index) => (index + direction + images.length) % images.length
      );
      haptic(HAPTIC.tap);
    },
    onPointerUp: () => {
      swipeStart.current = null;
    },
    onPointerCancel: () => {
      swipeStart.current = null;
      swiped.current = false;
    },
  };
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const main = images[activeIndex] ?? images[0];

  // Four photos read clearly; past that the strip turns into a wall of stamps.
  // The fifth tile becomes the way through to the rest — the photo is still
  // shown under a veil, so it reads as "more of this", not as a button.
  // With exactly five there is nothing to hide, so all five are shown plainly.
  const VISIBLE_THUMBS = 4;
  const hasOverflow = images.length > VISIBLE_THUMBS + 1;
  const thumbs = images.slice(0, VISIBLE_THUMBS + 1);
  const overflowCount = images.length - VISIBLE_THUMBS;

  useEffect(() => {
    if (!zoomOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')
        setActiveIndex((i) => (i - 1 + images.length) % images.length);

      if (e.key === 'Tab') {
        const focusable = zoomDialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [zoomOpen, images.length]);

  if (!main) return null;

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {/* Main image — clickable */}
        <motion.button
          ref={zoomTriggerRef}
          type="button"
          {...swipeProps}
          onClick={() => {
            // A swipe ends with a click on the same element; without this the
            // viewer would open on every photo change.
            if (swiped.current) {
              swiped.current = false;
              return;
            }
            setZoomOpen(true);
          }}
          whileHover={reducedMotion ? undefined : { scale: 1.005 }}
          transition={{
            duration: reducedMotion ? 0 : 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="group block w-full overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2"
          aria-label="Open larger view"
        >
          <div className="relative aspect-4/3 bg-neutral-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={main.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute inset-0"
              >
                <Image
                  src={main.url}
                  alt={main.alt || productName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Zoom hint */}
            <div className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[rgb(var(--fg))] opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
              <svg
                className="size-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14zm-3-7h6m-3-3v6"
                />
              </svg>
              Click to zoom
            </div>
          </div>
        </motion.button>

        {/* Thumbnails */}
        {images.length > 1 ? (
          <div
            className="grid gap-2 sm:gap-3"
            // One row, however many tiles there are: three photos should not
            // sit in a five-column grid trailing empty space.
            style={{
              gridTemplateColumns: `repeat(${thumbs.length}, minmax(0, 1fr))`,
            }}
          >
            {thumbs.map((img, i) => {
              const isOverflowTile = hasOverflow && i === VISIBLE_THUMBS;

              return (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => {
                    setActiveIndex(i);
                    // The tile promises the rest of the photos, so it opens
                    // the viewer that actually has them.
                    if (isOverflowTile) setZoomOpen(true);
                  }}
                  aria-label={
                    isOverflowTile
                      ? `See all ${images.length} photos`
                      : `View image ${i + 1} of ${images.length}`
                  }
                  aria-pressed={!isOverflowTile && i === activeIndex}
                  className={
                    'group relative overflow-hidden rounded-2xl border bg-white transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 ' +
                    (!isOverflowTile && i === activeIndex
                      ? 'border-[rgb(var(--accent))] ring-1 ring-[rgb(var(--accent))]/30'
                      : 'border-[rgb(var(--border))] hover:-translate-y-[1px] hover:border-[rgb(var(--accent))]/40 hover:shadow-sm')
                  }
                >
                  <div className="relative aspect-4/3 bg-neutral-100">
                    <Image
                      src={img.url}
                      alt={isOverflowTile ? '' : img.alt || productName}
                      fill
                      sizes="(max-width: 768px) 33vw, 16vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                    {isOverflowTile ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-neutral-900/55 text-base font-semibold text-white backdrop-blur-[2px] transition group-hover:bg-neutral-900/45"
                      >
                        +{overflowCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            ref={zoomDialogRef}
            key="zoom-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md"
            onClick={() => setZoomOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} image gallery`}
          >
            <motion.div
              key={`zoom-${main.url}`}
              initial={
                reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
              }
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{
                duration: reducedMotion ? 0 : 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              {...swipeProps}
              className="relative max-h-[90vh] max-w-[92vw] touch-pan-y"
            >
              <Image
                src={main.url}
                alt={main.alt || productName}
                width={1600}
                height={1200}
                className="max-h-[90vh] w-auto rounded-2xl object-contain shadow-2xl"
                priority
              />
            </motion.div>

            {/* Close */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prev / next */}
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i - 1 + images.length) % images.length);
                  }}
                  aria-label="Previous image"
                  className="absolute left-5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i + 1) % images.length);
                  }}
                  aria-label="Next image"
                  className="absolute right-5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur tabular-nums">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type GalleryImage = { url: string; alt: string | null };

type Props = {
  images: GalleryImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const main = images[activeIndex] ?? images[0];

  // Lock scroll while zoom open + ESC to close + arrow nav
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')
        setActiveIndex((i) => (i - 1 + images.length) % images.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [zoomOpen, images.length]);

  if (!main) return null;

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {/* Main image — clickable */}
        <motion.button
          type="button"
          onClick={() => setZoomOpen(true)}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {images.slice(0, 6).map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1} of ${images.length}`}
                aria-pressed={i === activeIndex}
                className={
                  'group relative overflow-hidden rounded-2xl border bg-white transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 ' +
                  (i === activeIndex
                    ? 'border-[rgb(var(--accent))] ring-1 ring-[rgb(var(--accent))]/30'
                    : 'border-[rgb(var(--border))] hover:-translate-y-[1px] hover:border-[rgb(var(--accent))]/40 hover:shadow-sm')
                }
              >
                <div className="relative aspect-4/3 bg-neutral-100">
                  <Image
                    src={img.url}
                    alt={img.alt || productName}
                    fill
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.04]"
                  />
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            key="zoom-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md"
            onClick={() => setZoomOpen(false)}
          >
            <motion.div
              key={`zoom-${main.url}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[92vw]"
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

'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

const VIDEO_SRC =
  'https://cdn.shopify.com/videos/c/o/v/703f72d549f54e06aa04ecc7adfbf1b8.mp4';

/**
 * Showroom tour video (moved over from the legacy theme page). The file is
 * ~43 MB, so nothing is fetched until the visitor asks to play: the poster
 * carries the first paint and the click starts playback with sound.
 */
export function ShowroomVideo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-black">
      {playing ? (
        <video
          ref={videoRef}
          className="size-full object-contain"
          src={VIDEO_SRC}
          poster="/brand/showroom-video-poster.jpg"
          controls
          autoPlay
          playsInline
          preload="auto"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 size-full cursor-pointer"
          aria-label="Play the showroom tour video"
        >
          <Image
            src="/brand/showroom-video-poster.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-[rgb(var(--fg))] shadow-lg transition group-hover:scale-105">
              <Play aria-hidden="true" className="ml-1 size-7 fill-current" />
            </span>
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Watch with sound
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function connectionAllowsVideo(): boolean {
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
  if (!connection) return true;
  if (connection.saveData) return false;
  return !/(^|-)2g$/.test(connection.effectiveType ?? '');
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function useShowVideo(): boolean {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () =>
      !window.matchMedia(REDUCED_MOTION_QUERY).matches &&
      connectionAllowsVideo(),
    // Server snapshot: render only the poster.
    () => false
  );
}

/**
 * Poster-first hero. The server renders only the lightweight poster image
 * (fast LCP); the looping video mounts after hydration and only when the
 * visitor's connection and motion preferences allow it.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const showVideo = useShowVideo();

  useEffect(() => {
    if (!showVideo) return;
    const video = ref.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch {
        // Autoplay blocked: the poster keeps the hero presentable.
      }
    };

    tryPlay();
    video.addEventListener('canplay', tryPlay);
    return () => video.removeEventListener('canplay', tryPlay);
  }, [showVideo]);

  return (
    <div className="relative h-full w-full">
      <Image
        src="/brand/hero-poster.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {showVideo ? (
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          poster="/brand/hero-poster.jpg"
          controls={false}
          disablePictureInPicture
        >
          <source src="/brand/hero.mp4" type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}

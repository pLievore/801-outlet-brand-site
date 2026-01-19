'use client';

import { useEffect, useRef } from 'react';

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        v.muted = true;
        v.playsInline = true;
        await v.play();
      } catch {
        // Se o browser bloquear, não tem o que fazer.
        // O usuário precisará tocar.
      }
    };

    tryPlay();
    v.addEventListener('canplay', tryPlay);

    return () => v.removeEventListener('canplay', tryPlay);
  }, []);

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      autoPlay
      muted
      playsInline
      loop
      preload="metadata"
      poster="/brand/hero-poster.jpg"
      controls={false}
      disablePictureInPicture
    >
      <source src="/brand/hero.mp4" type="video/mp4" />
    </video>
  );
}

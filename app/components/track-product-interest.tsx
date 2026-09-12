'use client';

import { useEffect } from 'react';
import { recordClientProductView } from '../../src/lib/leads/client';

export function TrackProductInterest({
  handle,
  title,
  image,
  price,
}: {
  handle: string;
  title: string;
  image?: string | null;
  price?: string | null;
}) {
  useEffect(() => {
    recordClientProductView({ handle, title, image, price });
  }, [handle, title, image, price]);

  return null;
}

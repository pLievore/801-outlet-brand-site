import type { CSSProperties } from 'react';
import { Star } from 'lucide-react';

import {
  customerReviews,
  type CustomerReview,
} from '../../src/lib/content/reviews';
import { FadeIn } from './motion';
import { Container } from './ui/container';

/** Google's 4-colour mark, used to attribute the review source. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/**
 * Star colour is a deeper gold than Google's: same warm read, but it clears
 * the 3:1 contrast floor for graphical objects on white (WCAG 1.4.11).
 */
function Stars({
  rating,
  className = 'size-3.5',
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Rated ${rating} out of 5 stars`}
      className="flex gap-0.5 text-[#c8791a]"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={
            index < rating
              ? `${className} fill-current`
              : `${className} text-[rgb(var(--border))]`
          }
        />
      ))}
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

function ReviewCard({ review }: { review: CustomerReview }) {
  return (
    <li className="mr-5 flex w-[86vw] max-w-[380px] shrink-0 flex-col sm:w-[380px]">
      <figure className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-[rgb(var(--border))] bg-white p-7 shadow-[0_1px_2px_rgba(12,22,31,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[rgb(var(--sage)/0.4)] hover:shadow-[0_18px_40px_-24px_rgba(12,22,31,0.35)]">
        {/* Decorative quote mark — the serif face gives it the editorial feel. */}
        <span
          aria-hidden="true"
          className="font-display pointer-events-none absolute -right-1 -top-8 select-none text-[7rem] leading-none text-[rgb(var(--sage)/0.14)]"
        >
          &rdquo;
        </span>

        <Stars rating={review.rating} />

        <blockquote className="relative mt-4 flex-1 text-[0.95rem] leading-7 text-[rgb(var(--fg)/0.85)]">
          {review.quote}
          {review.truncated ? '…' : ''}
        </blockquote>

        <figcaption className="mt-6 flex items-center gap-3 border-t border-[rgb(var(--border))] pt-5">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--sage-soft))] text-xs font-bold tracking-wide text-[rgb(var(--sage-ink))] ring-1 ring-inset ring-[rgb(var(--sage)/0.2)]"
          >
            {initialsOf(review.author)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold">
              {review.author}
            </span>
            <span className="block text-xs text-[rgb(var(--muted))]">
              {review.date}
            </span>
          </span>
          <GoogleMark className="size-4 shrink-0 opacity-80" />
        </figcaption>
      </figure>
    </li>
  );
}

function MarqueeRow({
  reviews,
  durationSeconds,
  label,
}: {
  reviews: CustomerReview[];
  durationSeconds: number;
  label: string;
}) {
  return (
    <div
      className="reviews-marquee py-5"
      style={
        { '--marquee-duration': `${durationSeconds}s` } as CSSProperties
      }
    >
      <div className="reviews-marquee-track">
        <ul aria-label={label} className="flex">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
        {/* Second set exists only to make the loop seamless. */}
        <ul aria-hidden="true" className="reviews-marquee-duplicate flex">
          {reviews.map((review) => (
            <ReviewCard key={`dup-${review.id}`} review={review} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const total = customerReviews.length;
  const average =
    customerReviews.reduce((sum, review) => sum + review.rating, 0) / total;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="relative overflow-hidden border-y border-[rgb(var(--border))] bg-gradient-to-b from-[rgb(var(--sage-soft)/0.7)] via-[rgb(var(--bg))] to-[rgb(var(--bg))] py-16 md:py-24"
    >
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--sage-ink))]">
              CUSTOMER REVIEWS
            </p>
            <h2
              id="reviews-heading"
              className="font-display mt-4 text-4xl leading-tight tracking-tight md:text-5xl"
            >
              Utah keeps sending <span className="italic">friends</span>
            </h2>

            <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-[rgb(var(--border))] bg-white/80 px-5 py-3 backdrop-blur-sm">
              <GoogleMark className="size-5" />
              <span className="text-sm font-bold tabular-nums">
                {average.toFixed(1)}
              </span>
              <Stars rating={Math.round(average)} className="size-4" />
              <span className="text-sm text-[rgb(var(--muted))]">
                from our latest Google reviews
              </span>
            </div>
          </div>
        </FadeIn>
      </Container>

      <div className="mt-10">
        <MarqueeRow
          reviews={customerReviews}
          durationSeconds={Math.max(total * 9, 30)}
          label="Customer reviews"
        />
      </div>
    </section>
  );
}

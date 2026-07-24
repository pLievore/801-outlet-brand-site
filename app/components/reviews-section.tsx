import { Star } from 'lucide-react';

import {
  customerReviews,
  REVIEWS_SOURCE_LABEL,
  type CustomerReview,
} from '../../src/lib/content/reviews';
import { FadeIn } from './motion';
import { Container } from './ui/container';
import { Section } from './ui/section';

function Stars({ rating }: { rating: number }) {
  return (
    <div
      role="img"
      aria-label={`Rated ${rating} out of 5 stars`}
      className="flex gap-0.5 text-[rgb(var(--sage-ink))]"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={
            index < rating
              ? 'size-4 fill-current'
              : 'size-4 text-[rgb(var(--border-strong))]'
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: CustomerReview }) {
  return (
    <li className="mr-4 flex w-[85vw] max-w-sm shrink-0 flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-6 sm:w-[380px]">
      <Stars rating={review.rating} />
      <blockquote className="mt-4 flex-1 text-sm leading-6 text-[rgb(var(--fg))]">
        “{review.quote}
        {review.truncated ? '…' : ''}”
      </blockquote>
      <footer className="mt-5 flex items-baseline justify-between gap-3 border-t border-[rgb(var(--border))] pt-4">
        <span className="text-sm font-semibold">{review.author}</span>
        <span className="text-xs text-[rgb(var(--muted))]">{review.date}</span>
      </footer>
    </li>
  );
}

export function ReviewsSection() {
  // One card takes ~7s to travel the viewport; the cycle covers a full set.
  const durationSeconds = Math.max(customerReviews.length * 7, 28);

  return (
    <Section aria-labelledby="reviews-heading">
      <Container>
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
                CUSTOMER REVIEWS
              </p>
              <h2
                id="reviews-heading"
                className="mt-3 font-display text-3xl tracking-tight md:text-4xl"
              >
                What our customers <span className="italic">say</span>
              </h2>
            </div>
            <p className="text-xs text-[rgb(var(--muted))]">
              {REVIEWS_SOURCE_LABEL}
            </p>
          </div>
        </FadeIn>
      </Container>

      <div
        className="reviews-marquee mt-8"
        style={
          { '--marquee-duration': `${durationSeconds}s` } as React.CSSProperties
        }
      >
        <div className="reviews-marquee-track">
          <ul aria-label="Customer reviews" className="flex">
            {customerReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
          {/* Second set only exists to make the loop seamless. */}
          <ul aria-hidden="true" className="reviews-marquee-duplicate flex">
            {customerReviews.map((review) => (
              <ReviewCard key={`dup-${review.id}`} review={review} />
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

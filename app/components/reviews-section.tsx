import { Star } from 'lucide-react';

import {
  customerReviews,
  REVIEWS_SOURCE_LABEL,
} from '../../src/lib/content/reviews';
import { FadeIn } from './motion';
import { Container } from './ui/container';
import { Section } from './ui/section';

function FiveStars() {
  return (
    <div
      role="img"
      aria-label="Rated 5 out of 5 stars"
      className="flex gap-0.5 text-[rgb(var(--sage-ink))]"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} aria-hidden="true" className="size-4 fill-current" />
      ))}
    </div>
  );
}

export function ReviewsSection() {
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

      <Container size="wide" className="mt-8">
        <ul
          aria-label="Customer reviews"
          tabIndex={0}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 focus-visible:outline-2 focus-visible:outline-[rgb(var(--accent))]"
        >
          {customerReviews.map((review) => (
            <li
              key={review.id}
              className="flex w-[85%] max-w-sm shrink-0 snap-start flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-6 sm:w-[46%] lg:w-[31%]"
            >
              <FiveStars />
              <blockquote className="mt-4 flex-1 text-sm leading-6 text-[rgb(var(--fg))]">
                “{review.quote}
                {review.truncated ? '…' : ''}”
              </blockquote>
              <footer className="mt-5 flex items-baseline justify-between gap-3 border-t border-[rgb(var(--border))] pt-4">
                <span className="text-sm font-semibold">{review.author}</span>
                <span className="text-xs text-[rgb(var(--muted))]">
                  {review.date}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

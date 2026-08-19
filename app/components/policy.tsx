import type { ReactNode } from 'react';

import { formatPolicyDate } from '../../src/lib/content/policies';

/**
 * Shared shell for the policy pages, matching the editorial treatment the
 * privacy and terms pages already use: eyebrow, display heading, standfirst
 * and a dated header.
 */
export function PolicyHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        {eyebrow}
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-6xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
        {intro}
      </p>
      <div className="mt-4 text-xs text-[rgb(var(--muted))]">
        Last updated: {formatPolicyDate()}
      </div>
    </div>
  );
}

export function PolicySection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-10">
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
        {title}
      </h2>
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

/** One rule of the policy: a heading and its explanation. */
export function PolicyCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
        {children}
      </div>
    </div>
  );
}

/** Emphasised block for the things a customer most often gets wrong. */
export function PolicyCallout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-[rgb(var(--sage-soft))] p-6 md:p-8">
      <h3 className="text-sm font-bold text-[rgb(var(--sage-ink))]">{title}</h3>
      <div className="mt-2 text-xs leading-relaxed text-[rgb(var(--sage-ink))]/85">
        {children}
      </div>
    </div>
  );
}

/** Numbered steps, for the "how do I actually do this" part of a policy. */
export function PolicySteps({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6"
        >
          <span className="font-display text-3xl italic text-[rgb(var(--border-strong))]">
            0{index + 1}
          </span>
          <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[rgb(var(--muted))]">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}

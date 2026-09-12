'use client';

import { useState, useTransition } from 'react';
import { CalendarCheck, Check, Loader2 } from 'lucide-react';

import { FormError } from '../../components/form-error';
import type { BookingDay } from '../../../src/lib/content/booking';
import { requestAppointmentAction } from '../../actions/appointment';

const inputClass =
  'min-h-11 w-full rounded-xl border border-[rgb(var(--border-strong))] bg-white px-4 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/15';

export function AppointmentForm({ days }: { days: BookingDay[] }) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? '');
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeDay = days.find((day) => day.date === selectedDate) ?? days[0];

  if (days.length === 0) {
    return (
      <p className="text-sm text-[rgb(var(--muted))]">
        Online booking is temporarily unavailable. Text or call (801) 854-6060
        and we will find a time for you.
      </p>
    );
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <p className="text-lg font-bold">You&apos;re booked!</p>
        <p className="max-w-sm text-sm text-[rgb(var(--muted))]">
          We&apos;ll see you on <strong>{confirmed}</strong>. A confirmation is
          on its way to your email, and our team will follow up by text or phone
          call.
        </p>
      </div>
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);

    if (!selectedTime) {
      setError('Please pick a time for your visit.');
      return;
    }

    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      notes: String(formData.get('notes') ?? ''),
      company: String(formData.get('company') ?? ''),
      date: selectedDate,
      time: selectedTime,
    };

    startTransition(async () => {
      const result = await requestAppointmentAction(payload);
      if (result.ok) {
        setConfirmed(result.confirmedFor ?? 'your selected time');
      } else {
        setError(result.error ?? 'Something went wrong. Please try again.');
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* min-w-0: a fieldset defaults to min-width:min-content, which would
          stretch past the card instead of letting the day strip scroll. */}
      <fieldset className="min-w-0">
        <legend className="text-sm font-bold">1. Pick a day</legend>
        <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2">
          {days.map((day) => {
            const active = day.date === activeDay?.date;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDate(day.date);
                  setSelectedTime('');
                }}
                aria-pressed={active}
                className={`flex min-w-[72px] shrink-0 snap-start flex-col items-center rounded-2xl border px-3 py-2.5 transition ${
                  active
                    ? 'border-[rgb(var(--sage-ink))] bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]'
                    : 'border-[rgb(var(--border))] bg-white hover:border-[rgb(var(--fg))]'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  {day.weekdayLabel}
                </span>
                <span className="text-sm font-bold">{day.dayLabel}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="text-sm font-bold">2. Pick a time</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {activeDay?.slots.map((slot) => {
            const active = slot.value === selectedTime;
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => setSelectedTime(slot.value)}
                aria-pressed={active}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${
                  active
                    ? 'border-[rgb(var(--sage-ink))] bg-[rgb(var(--sage-ink))] text-white'
                    : 'border-[rgb(var(--border))] bg-white hover:border-[rgb(var(--fg))]'
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="min-w-0 space-y-3">
        <legend className="text-sm font-bold">3. Your details</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">Full name</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Full name"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="sr-only">Phone</span>
            <input
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder="Phone number"
              className={inputClass}
            />
          </label>
        </div>
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            placeholder="Email address"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="sr-only">What are you looking for?</span>
          <textarea
            name="notes"
            rows={3}
            placeholder="What are you looking for? (optional)"
            className="w-full rounded-xl border border-[rgb(var(--border-strong))] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/15"
          />
        </label>
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
      </fieldset>

      <FormError>{error}</FormError>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[rgb(var(--sage-ink))] px-6 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <CalendarCheck aria-hidden="true" className="size-4" />
        )}
        {pending ? 'Booking…' : 'Book my visit'}
      </button>
      <p className="text-xs text-[rgb(var(--muted))]">
        Weekday visits only — Saturday and Sunday are open for walk-ins, no
        booking needed.
      </p>
    </form>
  );
}

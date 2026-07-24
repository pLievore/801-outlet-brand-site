/**
 * Showroom hours — single source of truth for every surface that shows them.
 * Weekdays run by appointment; weekends are open for walk-ins.
 */
export type ShowroomHours = {
  days: string;
  time: string;
  mode: 'appointment' | 'walk-in';
};

export const SHOWROOM_HOURS: ShowroomHours[] = [
  { days: 'Monday – Friday', time: '10 AM – 8 PM', mode: 'appointment' },
  { days: 'Saturday', time: '10 AM – 8 PM', mode: 'walk-in' },
  { days: 'Sunday', time: '12 PM – 6 PM', mode: 'walk-in' },
];

export const MODE_LABEL: Record<ShowroomHours['mode'], string> = {
  appointment: 'By appointment',
  'walk-in': 'Walk-ins welcome',
};

/** Compact one-line summary for tight spaces (footer, cards). */
export const HOURS_SUMMARY =
  'Mon – Fri: 10 AM – 8 PM (by appointment) · Sat: 10 AM – 8 PM · Sun: 12 PM – 6 PM (walk-ins)';

/**
 * Appointment slots (weekdays only — Sat/Sun are walk-in, see SHOWROOM_HOURS).
 * Hourly starts from opening to one hour before close.
 */
export const APPOINTMENT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export function formatAppointmentHour(hour24: number): string {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${period}`;
}

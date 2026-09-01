import { Container } from '../../components/ui/container';

/**
 * The account page reads the customer and their orders from Shopify on every
 * request — it is never prerendered, so there is a real gap between the tap and
 * the screen. The skeleton holds the shape of the orders table so the rows do
 * not shove the heading when they arrive.
 */
export default function LoadingAccount() {
  return (
    <Container className="py-12 md:py-16">
      <Bar className="h-3 w-32" />
      <Bar className="mt-4 h-11 w-72 max-w-full" />
      <Bar className="mt-4 h-4 w-96 max-w-full" />

      <div
        aria-hidden="true"
        className="mt-10 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 px-5 py-5 ${
              index > 0 ? 'border-t border-[rgb(var(--border))]' : ''
            }`}
          >
            <div className="min-w-0 flex-1">
              <Bar className="h-4 w-40" />
              <Bar className="mt-2 h-3 w-28" />
            </div>
            <Bar className="h-4 w-20 shrink-0" />
          </div>
        ))}
      </div>

      <span className="sr-only" role="status">
        Loading your account.
      </span>
    </Container>
  );
}

function Bar({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[rgb(var(--surface-muted))] ${className}`}
    />
  );
}

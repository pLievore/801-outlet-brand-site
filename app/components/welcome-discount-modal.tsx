'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, Gift, Sparkles, X } from 'lucide-react';

import { HAPTIC, haptic } from '../../src/lib/haptics';
import { saveClientContact, syncLeadToServer } from '../../src/lib/leads/client';
import { useCart } from './cart/cart-provider';
import { buttonStyles } from './ui/button';

const WELCOME_CODE = 'WELCOME50';
const STORAGE_UNLOCKED_KEY = '801_welcome_unlocked';
const STORAGE_DISMISSED_KEY = '801_welcome_dismissed_at';
const DISMISS_COOLOFF_DAYS = 7;

const emptySubscribe = () => () => {};

function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useStoredUnlocked(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return Boolean(localStorage.getItem(STORAGE_UNLOCKED_KEY));
      } catch {
        return false;
      }
    },
    () => false
  );
}

export function WelcomeDiscountModal() {
  const { cart, applyDiscount, openCart } = useCart();
  const reducedMotion = useReducedMotion();
  const hasMounted = useHasMounted();
  const storedUnlocked = useStoredUnlocked();

  const [isOpen, setIsOpen] = useState(false);
  const [unlockedNow, setUnlockedNow] = useState(false);
  const [contactInput, setContactInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const isUnlocked = storedUnlocked || unlockedNow;

  useEffect(() => {
    try {
      const unlocked = localStorage.getItem(STORAGE_UNLOCKED_KEY);
      if (unlocked) return;

      const dismissedAt = localStorage.getItem(STORAGE_DISMISSED_KEY);
      if (dismissedAt) {
        const diff = Date.now() - parseInt(dismissedAt, 10);
        const days = diff / (1000 * 60 * 60 * 24);
        if (days < DISMISS_COOLOFF_DAYS) {
          return;
        }
      }

      // Automatically show modal after 5 seconds of initial browsing
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    } catch {
      // LocalStorage access restricted in private mode
    }
  }, []);

  const handleDismiss = () => {
    haptic(HAPTIC.tap);
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, Date.now().toString());
    } catch {}
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = contactInput.trim();
    if (!clean) {
      setInputError('Please enter your email or mobile phone.');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    const isPhone = clean.replace(/\D/g, '').length >= 10;

    if (!isEmail && !isPhone) {
      setInputError('Please enter a valid email address or 10-digit phone number.');
      return;
    }

    setInputError(null);
    setUnlockedNow(true);
    haptic(HAPTIC.commit);

    try {
      localStorage.setItem(STORAGE_UNLOCKED_KEY, WELCOME_CODE);
      saveClientContact(clean, isEmail ? 'email' : 'phone');

      const cartData = cart
        ? {
            hasItems: cart.lines.length > 0,
            totalQuantity: cart.totalQuantity,
            totalAmount: cart.total.amount,
            items: cart.lines.map((l) => ({
              title: l.merchandise.productTitle,
              variantTitle: l.merchandise.variantTitle,
              quantity: l.quantity,
              price: l.lineTotal.amount,
            })),
            discountCode: cart.discountCodes[0]?.code,
          }
        : null;

      void syncLeadToServer(
        { contact: clean, channel: isEmail ? 'email' : 'phone' },
        cartData
      );

      // Fire lead capture beacon
      void fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'lead_capture',
          channel: isEmail ? 'email' : 'phone',
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(WELCOME_CODE);
    setCopied(true);
    haptic(HAPTIC.tap);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToCart = async () => {
    haptic(HAPTIC.commit);
    setApplied(true);
    await applyDiscount(WELCOME_CODE);
    setIsOpen(false);
    if (cart && cart.lines.length > 0) {
      openCart();
    }
    void syncLeadToServer();
  };

  if (!hasMounted) return null;

  return (
    <>
      {/* Floating launcher pill on bottom-left (above tab-bar on mobile) */}
      {!isOpen ? (
        <motion.button
          type="button"
          onClick={() => {
            setIsOpen(true);
            haptic(HAPTIC.tap);
          }}
          initial={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={reducedMotion ? {} : { scale: 1.05 }}
          whileTap={reducedMotion ? {} : { scale: 0.96 }}
          className="fixed bottom-[calc(var(--tab-bar-total)+1rem)] left-4 z-30 flex items-center gap-2 rounded-full border border-[rgb(var(--border-strong))] bg-white/95 px-3 py-1.5 text-xs font-bold text-[rgb(var(--fg))] shadow-lg backdrop-blur-md transition hover:border-[rgb(var(--accent))] hover:bg-white lg:bottom-6 lg:left-6 print:hidden"
          aria-label="Unlock $50 Off Coupon"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))]">
            <Gift className="size-3.5" />
          </span>
          <span>$50 Off</span>
        </motion.button>
      ) : null}

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 print:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleDismiss}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Modal Body */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="welcome-modal-title"
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 30, scale: 0.97 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 20, scale: 0.97 }
              }
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-[rgb(var(--border))] bg-white p-6 shadow-2xl sm:rounded-3xl md:p-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute right-4 top-4 rounded-full p-2 text-[rgb(var(--muted))] transition hover:bg-neutral-100 hover:text-[rgb(var(--fg))]"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>

              {!isUnlocked ? (
                /* Capture View */
                <div className="space-y-4 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent)/0.1)] px-3 py-1 text-[11px] font-bold text-[rgb(var(--accent))]">
                    <Sparkles className="size-3.5" />
                    <span>WELCOME OFFER</span>
                  </div>

                  <div>
                    <h2
                      id="welcome-modal-title"
                      className="font-display text-2xl font-bold tracking-tight text-[rgb(var(--fg))] sm:text-3xl"
                    >
                      Get $50 off your first furniture piece
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))] sm:text-sm">
                      Enter your email or phone to unlock code{' '}
                      <strong className="font-mono text-[rgb(var(--fg))]">
                        WELCOME50
                      </strong>{' '}
                      for $50 off any sectional or sofa order over $500.
                    </p>
                  </div>

                  <form onSubmit={handleUnlock} className="mt-4 space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Email or mobile phone number"
                        value={contactInput}
                        onChange={(e) => {
                          setContactInput(e.target.value);
                          if (inputError) setInputError(null);
                        }}
                        className="min-h-12 w-full rounded-2xl border border-[rgb(var(--border-strong))] bg-neutral-50/50 px-4 text-sm font-medium outline-none transition focus:border-[rgb(var(--accent))] focus:bg-white focus:ring-2 focus:ring-[rgb(var(--accent)/0.15)]"
                      />
                      {inputError ? (
                        <p className="mt-1.5 text-left text-xs text-red-600">
                          {inputError}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      className={buttonStyles({
                        variant: 'primary',
                        size: 'lg',
                        className: 'w-full shadow-md',
                      })}
                    >
                      Unlock $50 Coupon
                    </button>
                  </form>

                  <p className="text-center text-[10px] text-[rgb(var(--muted))]">
                    No spam ever. Walk in this weekend or order online for Salt Lake City delivery.
                  </p>
                </div>
              ) : (
                /* Unlocked Code View */
                <div className="space-y-4 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    <Check className="size-3.5" />
                    <span>COUPON UNLOCKED</span>
                  </div>

                  <div>
                    <h2
                      id="welcome-modal-title"
                      className="font-display text-2xl font-bold tracking-tight text-[rgb(var(--fg))] sm:text-3xl"
                    >
                      Here is your $50 coupon!
                    </h2>
                    <p className="mt-1 text-xs text-[rgb(var(--muted))] sm:text-sm">
                      Enjoy $50 off any sofa, sectional or designer piece over $500.
                    </p>
                  </div>

                  {/* Code Card */}
                  <div className="my-4 flex items-center justify-between rounded-2xl border-2 border-dashed border-[rgb(var(--sage))] bg-[rgb(var(--sage-soft))] p-4">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--sage-ink))]">
                        Coupon Code
                      </span>
                      <span className="font-mono text-xl font-black tracking-widest text-[rgb(var(--fg))] sm:text-2xl">
                        {WELCOME_CODE}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[rgb(var(--fg))] shadow-xs transition hover:bg-neutral-100"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleApplyToCart}
                      className={buttonStyles({
                        variant: 'primary',
                        size: 'lg',
                        className: 'w-full gap-2 shadow-md',
                      })}
                    >
                      {applied ? (
                        <>
                          <Check className="size-4" /> Applied!
                        </>
                      ) : cart && cart.lines.length > 0 ? (
                        <>
                          <Sparkles className="size-4" /> Apply code to my cart
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" /> Apply code to my order
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="w-full py-2 text-center text-xs font-semibold text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
                    >
                      Continue browsing
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

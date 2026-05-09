'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/delivery', label: 'Delivery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function MobileNav({ phoneHref }: { phoneHref: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center rounded-full p-2 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <motion.div
          animate={open ? 'open' : 'closed'}
          className="relative size-5"
        >
          {/* Top bar */}
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 7 },
            }}
            transition={{ duration: 0.25 }}
            className="absolute top-[3px] left-0 block h-[1.5px] w-5 bg-[rgb(var(--fg))] origin-center"
          />
          {/* Middle bar */}
          <motion.span
            variants={{
              closed: { opacity: 1, scaleX: 1 },
              open: { opacity: 0, scaleX: 0 },
            }}
            transition={{ duration: 0.2 }}
            className="absolute top-[9px] left-0 block h-[1.5px] w-5 bg-[rgb(var(--fg))]"
          />
          {/* Bottom bar */}
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -7 },
            }}
            transition={{ duration: 0.25 }}
            className="absolute top-[15px] left-0 block h-[1.5px] w-5 bg-[rgb(var(--fg))] origin-center"
          />
        </motion.div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            key="drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-[57px] z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/95 px-5 py-6 shadow-lg backdrop-blur md:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={
                        'flex items-center rounded-xl px-4 py-3 text-base font-semibold transition ' +
                        (active
                          ? 'bg-[rgb(var(--fg))] text-white'
                          : 'text-[rgb(var(--fg))] hover:bg-neutral-100')
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href={phoneHref}
                className="flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white py-3 text-sm font-semibold text-[rgb(var(--fg))] transition hover:bg-neutral-50"
              >
                Call us
              </a>
              <Link
                href="/account"
                className="flex items-center justify-center rounded-full bg-[rgb(var(--fg))] py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                My account
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

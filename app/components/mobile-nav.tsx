'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

import type { NavigationLink } from '../../src/lib/navigation/types';
import { Button, buttonStyles } from './ui/button';
import { Drawer } from './ui/dialog';

export function MobileNav({
  phoneHref,
  links,
}: {
  phoneHref: string;
  links: NavigationLink[];
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <motion.span
          aria-hidden="true"
          className="relative block size-5"
          animate={open && !reducedMotion ? { rotate: 90 } : { rotate: 0 }}
        >
          <span className="absolute left-0 top-1 block h-px w-5 bg-current" />
          <span className="absolute left-0 top-2.5 block h-px w-5 bg-current" />
          <span className="absolute left-0 top-4 block h-px w-5 bg-current" />
        </motion.span>
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        title="Menu"
        description="Explore 801 Outlet"
      >
        <nav className="flex min-h-full flex-col p-5" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {links.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              const className =
                'flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-semibold transition ' +
                (active
                  ? 'bg-[rgb(var(--sage-ink))] text-white'
                  : 'text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-muted))]');

              return (
                <li key={link.id}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className={className}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className={className}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-auto border-t border-[rgb(var(--border))] pt-6">
            <a
              href={phoneHref}
              className={buttonStyles({
                variant: 'sage',
                size: 'lg',
                className: 'w-full',
              })}
              onClick={() => setOpen(false)}
            >
              Call 801 Outlet
            </a>
            <p className="mt-4 text-center text-xs leading-relaxed text-[rgb(var(--muted))]">
              Showroom visits are available by appointment only.
            </p>
          </div>
        </nav>
      </Drawer>
    </>
  );
}

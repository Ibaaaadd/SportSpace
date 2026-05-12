"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

type ScrollLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  duration?: number;
  offset?: number;
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ScrollLink({
  href,
  duration = 650,
  offset = 0,
  onClick,
  ...rest
}: ScrollLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (!href.startsWith("#")) {
      return;
    }

    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();

    if (prefersReducedMotion()) {
      target.scrollIntoView();
      return;
    }

    const start = window.scrollY;
    const targetRect = target.getBoundingClientRect();
    const end = start + targetRect.top - offset;
    const delta = end - start;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, start + delta * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}

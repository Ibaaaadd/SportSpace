"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps, Transition } from "framer-motion";
import type { ReactNode } from "react";

type RevealBaseProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  variant?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale";
  offset?: number;
  scaleFrom?: number;
  once?: boolean;
  amount?: number;
};

type RevealDivProps = RevealBaseProps & HTMLMotionProps<"div">;

type RevealSectionProps = RevealBaseProps & HTMLMotionProps<"section">;

function getTransition(delay?: number, duration?: number): Transition {
  return {
    duration: duration ?? 0.5,
    ease: [0.16, 1, 0.3, 1],
    delay,
  };
}

function getViewport(once?: boolean, amount?: number) {
  return {
    once: once ?? true,
    amount: amount ?? 0.2,
  };
}

function getInitialState(
  variant: RevealBaseProps["variant"],
  offset?: number,
  scaleFrom?: number,
  y?: number
) {
  const distance = offset ?? 24;

  switch (variant) {
    case "slide-down":
      return { opacity: 0, y: -(y ?? distance) };
    case "slide-left":
      return { opacity: 0, x: distance };
    case "slide-right":
      return { opacity: 0, x: -distance };
    case "scale":
      return { opacity: 0, scale: scaleFrom ?? 0.96 };
    case "fade":
      return { opacity: 0 };
    case "slide-up":
    default:
      return { opacity: 0, y: y ?? distance };
  }
}

function getAnimateState(variant: RevealBaseProps["variant"]) {
  if (variant === "scale") {
    return { opacity: 1, scale: 1 };
  }

  return { opacity: 1, x: 0, y: 0 };
}

export function Reveal({
  children,
  delay,
  duration,
  y,
  variant,
  offset,
  scaleFrom,
  once,
  amount,
  ...rest
}: RevealDivProps) {
  const resolvedVariant = variant ?? "slide-up";

  return (
    <motion.div
      initial={getInitialState(resolvedVariant, offset, scaleFrom, y)}
      whileInView={getAnimateState(resolvedVariant)}
      viewport={getViewport(once, amount)}
      transition={getTransition(delay, duration)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealSection({
  children,
  delay,
  duration,
  y,
  variant,
  offset,
  scaleFrom,
  once,
  amount,
  ...rest
}: RevealSectionProps) {
  const resolvedVariant = variant ?? "slide-up";

  return (
    <motion.section
      initial={getInitialState(resolvedVariant, offset, scaleFrom, y)}
      whileInView={getAnimateState(resolvedVariant)}
      viewport={getViewport(once, amount)}
      transition={getTransition(delay, duration)}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

"use client";

import {
  useEffect,
  useRef,
  useState,
  createElement,
  type ReactNode,
  type RefObject,
  type ElementType,
} from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  animationNum: number;
  customVariants?: {
    visible: (i: number) => {
      transition: { delay: number; duration: number };
    };
  };
  timelineRef: RefObject<HTMLElement | null>;
}

/**
 * Scroll-triggered reveal component with staggered delays.
 * Uses IntersectionObserver — consistent with the existing `useReveal` pattern,
 * no external animation library required.
 */
export function TimelineContent({
  children,
  as = "div",
  className,
  animationNum,
  customVariants,
  timelineRef,
}: TimelineContentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  // Calculate stagger delay from variants or fallback
  const delay = customVariants
    ? customVariants.visible(animationNum).transition.delay
    : animationNum * 0.4;
  const duration = customVariants
    ? customVariants.visible(animationNum).transition.duration
    : 0.5;

  useEffect(() => {
    const target = timelineRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [timelineRef]);

  return createElement(
    as,
    {
      ref: elementRef,
      className: cn(className),
      style: {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-20px)",
        filter: isVisible ? "blur(0px)" : "blur(10px)",
        transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s, filter ${duration}s ease ${delay}s`,
      },
    },
    children
  );
}

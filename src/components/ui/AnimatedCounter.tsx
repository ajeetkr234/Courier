import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (countRef.current) {
        countRef.current.innerText = `${prefix}${value.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`;
      }
      return;
    }

    if (!countRef.current) return;

    const ctx = gsap.context(() => {
      const counter = { val: 0 };
      gsap.to(counter, {
        val: value,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: countRef.current,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          if (countRef.current) {
            const formatted = counter.val.toLocaleString('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });
            countRef.current.innerText = `${prefix}${formatted}${suffix}`;
          }
        },
      });
    }, countRef);

    return () => ctx.revert();
  }, [value, prefix, suffix, decimals]);

  return <span ref={countRef} className={className}>{prefix}0{suffix}</span>;
};

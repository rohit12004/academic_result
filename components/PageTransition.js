"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import { gsap } from "gsap";
import { usePathname, useRouter } from "next/navigation";

const TransitionContext = createContext();

export const useTransition = () => useContext(TransitionContext);

export default function PageTransition({ children }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const pathRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const [pendingRoute, setPendingRoute] = useState(null);

  const topPath = "M 0 0 V 0 Q 50 0 100 0 V 0 z";
  const fullPath = "M 0 0 V 100 Q 50 100 100 100 V 0 z";
  const bottomPath = "M 0 100 V 100 Q 50 100 100 100 V 100 z";
  const curveDown = "M 0 0 V 50 Q 50 100 100 50 V 0 z";
  const curveUncover = "M 0 50 V 100 Q 50 100 100 100 V 50 z";

  const animateIn = () => {
    if (!pathRef.current) return;
    setIsAnimating(true);
    const tl = gsap.timeline();
    tl.set(pathRef.current, { attr: { d: fullPath } });
    tl.to(pathRef.current, {
      attr: { d: curveUncover },
      duration: 0.3,
      ease: "none",
    }).to(pathRef.current, {
      attr: { d: bottomPath },
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => setIsAnimating(false)
    });
  };

  const animateOut = (href) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => {
        router.push(href);
      }
    });

    tl.set(pathRef.current, { attr: { d: topPath } });
    tl.to(pathRef.current, {
      attr: { d: curveDown },
      duration: 0.3,
      ease: "power2.in",
    }).to(pathRef.current, {
      attr: { d: fullPath },
      duration: 0.3,
      ease: "none",
    });
  };

  useEffect(() => {
    // Initial entrance on first load
    animateIn();
    
    // Fail-safe: ensure transition is hidden after 1s even if animation fails
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle route changes (animate down on mount of new page layout state)
  useEffect(() => {
    animateIn();
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ animateOut, isAnimating }}>
      <div className="relative">
        {children}
        <div className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${isAnimating ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
          <svg
            className="w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="page-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#000000" />
                <stop offset="1" stopColor="#000000" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              className="fill-[url(#page-grad)] stroke-[url(#page-grad)] stroke-[2px]"
              d={topPath}
            />
          </svg>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

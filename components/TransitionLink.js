"use client";

import Link from "next/link";
import { useTransition } from "./PageTransition";
import { useRouter } from "next/navigation";

export default function TransitionLink({ href, children, className, ...props }) {
  const { animateOut, isAnimating } = useTransition();
  const router = useRouter();

  const handleClick = (e) => {
    if (props.onClick) props.onClick(e);
    
    if (e.defaultPrevented) return;
    
    e.preventDefault();
    if (isAnimating) return;
    
    // If it's the current path, don't animate
    if (window.location.pathname === href) return;

    animateOut(href);
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick} 
      className={className} 
      {...props}
    >
      {children}
    </Link>
  );
}

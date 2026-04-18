"use client";

import { useState, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleDelay: number;
}

export default function StarBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate stars only on client to avoid hydration mismatch
    // We use a small timeout to avoid the "cascading renders" lint error
    // which can happen if setState is called synchronously in useEffect
    const timer = setTimeout(() => {
      setStars(
        Array.from({ length: 60 }, () => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          twinkleSpeed: Math.random() * 3 + 2,
          twinkleDelay: Math.random() * 5,
        }))
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (stars.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }} // Ensure it's behind everything
      aria-hidden="true"
    >
      {stars.map((star, i) => (
        <div
          key={i}
          className="star animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.twinkleSpeed}s`,
            animationDelay: `${star.twinkleDelay}s`,
          }}
        />
      ))}
    </div>
  );
}

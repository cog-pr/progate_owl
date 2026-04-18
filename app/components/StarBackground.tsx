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
    setStars(
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 3 + 2,
        twinkleDelay: Math.random() * 5,
      }))
    );
  }, []);

  if (stars.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
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
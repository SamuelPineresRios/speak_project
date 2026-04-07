"use client";

import React, { useEffect, useState } from "react";

export function TechBackground() {
  const [elements, setElements] = useState<{ id: number; left: string; top: string; duration: string; delay: string; opacity: number }[]>([]);

  useEffect(() => {
    // Generate random floating squares / binary-like elements
    const newElements = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `-${Math.random() * 20}s`,
      opacity: Math.random() * 0.15 + 0.05,
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0wIDQwIEwxMDAgMCIvPjwvZz48L3N2Zz4=')] opacity-30" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Floating tech nodes */}
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute w-2 h-2 md:w-3 md:h-3 border border-cyan-500/30 font-mono text-[10px] text-cyan-500/40 flex items-center justify-center overflow-hidden"
          style={{
            left: el.left,
            top: el.top,
            opacity: el.opacity,
            animation: `float-up ${el.duration} linear infinite`,
            animationDelay: el.delay,
            backgroundColor: el.id % 5 === 0 ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
            boxShadow: el.id % 5 === 0 ? '0 0 10px rgba(6, 182, 212, 0.3)' : 'none',
          }}
        >
          {el.id % 3 === 0 ? (Math.random() > 0.5 ? '1' : '0') : ''}
        </div>
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950" />
    </div>
  );
}
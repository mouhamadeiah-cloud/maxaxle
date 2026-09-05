import React from 'react';

/**
 * NebulaBackground component (Metallic Edition)
 * Renders the premium brushed aluminum / stainless steel canvas with realistic striations,
 * directional reflections, and radial specular flare matching Image 2.
 */
export const NebulaBackground: React.FC = () => {
  return (
    <div 
      id="maxfleet-metallic-background" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-metallic-canvas"
      aria-hidden="true"
    >
      {/* 1. Horizontal Brushed Metal Micro-Striations Texture */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.08) 0px,
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px,
              transparent 3px
            ),
            repeating-linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.08) 0px,
              rgba(0, 0, 0, 0.08) 1px,
              transparent 1px,
              transparent 4px
            )
          `
        }}
      />

      {/* 2. Large Central Machined Radial Flare (Behind Central Home Hub Dial) */}
      <div 
        id="metallic-center-flare"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] sm:w-[1000px] sm:h-[1000px] rounded-full opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(230, 243, 255, 0.35) 0%, rgba(185, 205, 222, 0.2) 35%, rgba(120, 142, 160, 0.05) 65%, transparent 85%)'
        }}
      />

      {/* 3. Subtle Vertical Sheen & Depth Gradient Bands */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.2) 25%, rgba(255, 255, 255, 0.25) 50%, rgba(0, 0, 0, 0.2) 75%, rgba(255, 255, 255, 0.15) 100%)'
        }}
      />

      {/* 4. Soft Vignette for Realistic Enterprise Bevel */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(15, 23, 35, 0.5) 100%)'
        }}
      />
    </div>
  );
};

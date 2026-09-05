import React from 'react';

/**
 * SteelPlateBackground
 * Renders the exact high-precision brushed stainless steel texture with:
 * - Concentric circular lathe milling grain centered on the workspace hub
 * - Horizontal hairline partition seam under the header
 * - Anisotropic specular light rays and central corona
 * - Clean, flawless industrial finish with NO watermarks or logos
 */
export const SteelPlateBackground: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Base Layer: Solid Industrial Dark Titanium / Milled Steel Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#627586] via-[#526475] to-[#425261]" />

      {/* 2. Anisotropic Conical Lathe Light Reflections (Specular Hourglass Flares) */}
      <div 
        className="absolute inset-0 opacity-75"
        style={{
          background: `
            conic-gradient(
              from 45deg at 50% 48%,
              rgba(255, 255, 255, 0.35) 0deg,
              rgba(40, 58, 76, 0.20) 35deg,
              rgba(255, 255, 255, 0.48) 75deg,
              rgba(30, 48, 65, 0.25) 120deg,
              rgba(255, 255, 255, 0.40) 165deg,
              rgba(40, 58, 76, 0.22) 215deg,
              rgba(255, 255, 255, 0.52) 255deg,
              rgba(32, 50, 68, 0.28) 305deg,
              rgba(255, 255, 255, 0.35) 360deg
            )
          `
        }}
      />

      {/* 3. Central Radial Lathe Concentric Rings & Soft Flare Corona */}
      <div 
        className="absolute inset-0 opacity-65"
        style={{
          background: `
            radial-gradient(
              ellipse 75% 65% at 50% 48%,
              rgba(255, 255, 255, 0.70) 0%,
              rgba(220, 235, 248, 0.40) 18%,
              rgba(175, 198, 218, 0.20) 38%,
              rgba(120, 145, 170, 0.10) 58%,
              transparent 80%
            )
          `
        }}
      />

      {/* 4. High-Precision Lathe Milled Concentric Orbital Grooves (SVG) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-55"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="lathe-glow" cx="50%" cy="48%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="35%" stopColor="#cbd9e7" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#7a92a7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Lathe Circles matching the circular pattern in the image */}
        <g stroke="url(#lathe-glow)" fill="none" opacity="0.65">
          <circle cx="50%" cy="48%" r="45" strokeWidth="0.8" />
          <circle cx="50%" cy="48%" r="85" strokeWidth="0.75" />
          <circle cx="50%" cy="48%" r="135" strokeWidth="1.0" strokeDasharray="3 2" />
          <circle cx="50%" cy="48%" r="185" strokeWidth="0.9" />
          <circle cx="50%" cy="48%" r="240" strokeWidth="1.2" />
          <circle cx="50%" cy="48%" r="300" strokeWidth="0.8" strokeDasharray="6 4" />
          <circle cx="50%" cy="48%" r="365" strokeWidth="1.1" />
          <circle cx="50%" cy="48%" r="435" strokeWidth="0.85" />
          <circle cx="50%" cy="48%" r="510" strokeWidth="1.3" strokeDasharray="12 8" />
          <circle cx="50%" cy="48%" r="590" strokeWidth="0.9" />
          <circle cx="50%" cy="48%" r="680" strokeWidth="1.0" />
          <circle cx="50%" cy="48%" r="780" strokeWidth="1.4" />
        </g>
      </svg>

      {/* 5. Fine Horizontal Brushed Hairline Scratches Texture */}
      <div 
        className="absolute inset-0 opacity-45 mix-blend-overlay"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.45) 0px,
              rgba(0, 0, 0, 0.08) 1px,
              rgba(255, 255, 255, 0.25) 2px,
              rgba(0, 0, 0, 0.12) 3px,
              rgba(255, 255, 255, 0.35) 4px
            )
          `
        }}
      />

      {/* 6. Top Horizontal Precision Seam Line (Matching image header partition line - Desktop only) */}
      <div className="hidden md:block absolute top-16 left-0 right-0 h-[2px] z-10">
        {/* Dark hairline groove */}
        <div className="w-full h-[1px] bg-black/35 shadow-[0_1px_0_rgba(255,255,255,0.65)]" />
      </div>

    </div>
  );
};

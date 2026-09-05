import React from 'react';

interface CoinOrbitalNodeProps {
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showRings?: boolean;
  hasFlashAction?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  id?: string;
  type?: 'button' | 'div';
}

export const DualLayerScanningRings: React.FC<{
  outerInsetClass?: string;
  innerInsetClass?: string;
  outerStrokeWidth?: number;
  innerStrokeWidth?: number;
}> = ({
  outerInsetClass = "-inset-[5px] sm:-inset-[6px]",
  innerInsetClass = "-inset-[2.5px] sm:-inset-[3px]",
  outerStrokeWidth = 0.95,
  innerStrokeWidth = 0.65,
}) => (
  <div className="absolute inset-0 pointer-events-none overflow-visible select-none z-10">
    {/* 1. Outer Ring: 75% Arc rotating Clockwise */}
    <div className={`absolute ${outerInsetClass} animate-spin-clockwise-slow`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#ffffff"
          strokeWidth={outerStrokeWidth}
          strokeDasharray="75 25"
          pathLength={100}
          strokeLinecap="round"
          className="opacity-95 drop-shadow-[0_0_2.5px_rgba(255,255,255,0.95)]"
        />
      </svg>
    </div>

    {/* 2. Inner Ring: Even Thinner 75% Arc rotating Counter-Clockwise */}
    <div className={`absolute ${innerInsetClass} animate-spin-counter-fast`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#ffffff"
          strokeWidth={innerStrokeWidth}
          strokeDasharray="75 25"
          pathLength={100}
          strokeLinecap="round"
          className="opacity-90 drop-shadow-[0_0_2px_rgba(255,255,255,0.85)]"
        />
      </svg>
    </div>
  </div>
);

export const CoinOrbitalNode: React.FC<CoinOrbitalNodeProps> = ({
  children,
  size = 'sm',
  className = '',
  showRings = true,
  hasFlashAction = true,
  onClick,
  title,
  id,
  type = 'div',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  }[size];

  const ringInsets = {
    xs: { outer: '-inset-[4px]', inner: '-inset-[2px]' },
    sm: { outer: '-inset-[5px] sm:-inset-[6px]', inner: '-inset-[2.5px] sm:-inset-[3px]' },
    md: { outer: '-inset-[7px] sm:-inset-[9px]', inner: '-inset-[3px] sm:-inset-[4px]' },
    lg: { outer: '-inset-[9px] sm:-inset-[12px]', inner: '-inset-[4px] sm:-inset-[5px]' },
  }[size];

  const Component = type === 'button' ? 'button' : 'div';

  return (
    <Component
      id={id}
      type={type === 'button' ? 'button' : undefined}
      onClick={onClick}
      title={title}
      className={`relative ${sizeClasses} rounded-full flex items-center justify-center shrink-0 cursor-pointer hub-coin-node transition-all duration-300 group hover:scale-110 active:scale-95 ${hasFlashAction ? 'hover:shadow-[0_0_20px_rgba(255,255,255,0.95)]' : ''} ${className}`}
    >
      {/* Dual Concentric Scanning Rings */}
      {showRings && (
        <DualLayerScanningRings
          outerInsetClass={ringInsets.outer}
          innerInsetClass={ringInsets.inner}
        />
      )}

      {/* Recessed Concentric Inner Groove Ring */}
      <div className="absolute inset-1 rounded-full hub-knopf-groove pointer-events-none" />

      {/* Flash Ripple Aura on Hover */}
      {hasFlashAction && (
        <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/45 to-transparent blur-2xs animate-pulse" />
      )}

      {/* Center Icon/Content with Debossed Engraving */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
};

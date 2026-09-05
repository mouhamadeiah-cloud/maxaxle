import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Layers, 
  Folder, 
  FileText, 
  Settings,
  Sparkles,
  X,
  GripHorizontal
} from 'lucide-react';
import { NavTab } from '../types';
import { DualLayerScanningRings } from './CoinOrbitalNode';
import { aiService } from '../services/aiService';

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenMaxAi?: () => void;
  stockCount?: number;
  customerCount?: number;
  openInvoicesCount?: number;
}

interface NavSatelliteItem {
  id: NavTab | 'max_ai';
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isAiAction?: boolean;
  isPrimary?: boolean;
  colorTheme?: 'emerald' | 'amber' | 'blue' | 'slate' | 'violet';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMaxAi,
  stockCount = 0,
  openInvoicesCount = 0
}) => {
  // Radial Arc Menu Open / Closed State
  const [isOpen, setIsOpen] = useState(false);
  const [aiConnected, setAiConnected] = useState<boolean>(() => aiService.getConnectionStatus().isConnected);

  useEffect(() => {
    const unsub = aiService.subscribeConnectionStatus((status) => {
      setAiConnected(status.isConnected);
    });
    return unsub;
  }, []);

  // Horizontal position percentage (0 = left, 0.5 = center, 1 = right)
  // Default to 1.0 (bottom-right)
  const [horizontalPos, setHorizontalPos] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('maxfleet_mobile_fab_pos_x');
      return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 1.0;
    } catch {
      return 1.0;
    }
  });

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const startPosRef = useRef<number>(1.0);
  const hasDraggedRef = useRef<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Save position preference
  useEffect(() => {
    try {
      localStorage.setItem('maxfleet_mobile_fab_pos_x', horizontalPos.toString());
    } catch {
      // ignore
    }
  }, [horizontalPos]);

  // Pure German navigation items arranged in natural sequential order along the arc:
  // [0] Home (bottom), [1] Lager, [2] Operationen, [3] Rechnungen, [4] Setup, [5] MAX AI (top)
  const satelliteItems: NavSatelliteItem[] = [
    {
      id: 'home',
      label: 'Home',
      sublabel: 'Übersicht',
      icon: Home,
      colorTheme: 'blue'
    },
    {
      id: 'lager',
      label: 'Lager',
      sublabel: 'Bestand',
      icon: Layers,
      badge: stockCount > 0 ? stockCount : undefined,
      colorTheme: 'slate'
    },
    {
      id: 'operationen',
      label: 'Operationen',
      sublabel: 'Dokumente',
      icon: FileText,
      isPrimary: true,
      colorTheme: 'emerald'
    },
    {
      id: 'rechnungen',
      label: 'Rechnungen',
      sublabel: 'Finanzen',
      icon: Folder,
      badge: openInvoicesCount > 0 ? openInvoicesCount : undefined,
      colorTheme: 'amber'
    },
    {
      id: 'einstellungen',
      label: 'Setup',
      sublabel: 'System',
      icon: Settings,
      colorTheme: 'slate'
    },
    {
      id: 'max_ai',
      label: 'MAX AI',
      sublabel: 'Copilot',
      icon: Sparkles,
      isAiAction: true,
      colorTheme: 'violet'
    }
  ];

  // Helper to find info about current active tab
  const activeTabItem = satelliteItems.find(item => item.id === activeTab) || satelliteItems[0];
  const ActiveIcon = activeTabItem.icon;

  // Pointer drag handling along bottom horizontal axis
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== undefined) return;
    
    dragStartXRef.current = e.clientX;
    startPosRef.current = horizontalPos;
    hasDraggedRef.current = false;
    setIsDragging(true);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }

    const screenW = window.innerWidth || 360;
    const effectiveWidth = Math.max(160, screenW - 100);
    const deltaRatio = deltaX / effectiveWidth;
    
    const newPos = Math.max(0, Math.min(1, startPosRef.current + deltaRatio));
    setHorizontalPos(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Snap smoothly to Left (0.0), Center (0.5), or Right (1.0)
    if (horizontalPos > 0.75) {
      setHorizontalPos(1.0);
    } else if (horizontalPos < 0.25) {
      setHorizontalPos(0.0);
    } else if (horizontalPos >= 0.35 && horizontalPos <= 0.65) {
      setHorizontalPos(0.5);
    }
  };

  // Click on main trigger dial
  const handleMainTriggerClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    setIsOpen(prev => !prev);
  };

  // Click a satellite item
  const handleSatelliteClick = (item: NavSatelliteItem) => {
    if (item.id === 'max_ai') {
      if (onOpenMaxAi) {
        onOpenMaxAi();
      }
    } else {
      setActiveTab(item.id);
    }
    setIsOpen(false);
  };

  // Helper to build a smooth SVG curve through a list of points
  const getSmoothSvgPath = (pts: { x: number; y: number }[], offsetX: number, offsetY: number) => {
    if (pts.length < 2) return '';
    const p = pts.map(pt => ({ x: pt.x + offsetX, y: pt.y + offsetY }));
    let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = i > 0 ? p[i - 1] : p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = i < p.length - 2 ? p[i + 2] : p2;
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  // Precise geometry mapping matching the user's sketch and mobile vertical screen proportions:
  // A compact, elegant sweeping curve extending upwards and comfortably within screen margins.
  // Guarantees zero overlapping, uniform spacing, and no off-screen clipping.
  const isRightSide = horizontalPos >= 0.65;
  const isLeftSide = horizontalPos <= 0.35;

  // Base coordinates for the 6 items when anchored on the Right (FAB on bottom-right)
  // [0] Home, [1] Lager, [2] Operationen, [3] Rechnungen, [4] Setup, [5] MAX AI
  const rightSidePositions = [
    { x: -96, y: -16 },
    { x: -92, y: -72 },
    { x: -80, y: -126 },
    { x: -62, y: -178 },
    { x: -36, y: -228 },
    { x: -2, y: -276 }
  ];

  // Function to calculate exact coordinate of node i
  const getNodePosition = (index: number) => {
    if (isRightSide) {
      return rightSidePositions[index] || { x: 0, y: 0 };
    } else if (isLeftSide) {
      // Mirror X coordinates for left-side placement
      const base = rightSidePositions[index] || { x: 0, y: 0 };
      return { x: -base.x, y: base.y };
    } else {
      // Symmetrical fan arch for center placement
      const centerPositions = [
        { x: -105, y: -70 },
        { x: -68, y: -140 },
        { x: -24, y: -195 },
        { x: 24, y: -195 },
        { x: 68, y: -140 },
        { x: 105, y: -70 }
      ];
      return centerPositions[index] || { x: 0, y: 0 };
    }
  };

  // Coordinates array for all 6 nodes
  const allNodePositions = satelliteItems.map((_, i) => getNodePosition(i));

  const centerSvgX = 260;
  const centerSvgY = 320;
  const arcPath = getSmoothSvgPath(allNodePositions, centerSvgX, centerSvgY);

  const leftStyle = `calc(16px + (100% - 104px) * ${horizontalPos})`;

  return (
    <div 
      id="maxfleet-mobile-orbital-fab-container"
      className="md:hidden fixed inset-x-0 bottom-0 pointer-events-none z-50 select-none print:hidden"
    >
      {/* Dark Backdrop Overlay when open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200 z-40"
        />
      )}

      {/* Horizontal Drag Track Guide */}
      {(isDragging || !isOpen) && (
        <div 
          ref={trackRef}
          className="fixed bottom-2 left-4 right-4 h-7 bg-slate-950/85 border border-slate-800/90 rounded-full flex items-center justify-between px-3 shadow-xl backdrop-blur-md pointer-events-none z-30 opacity-70"
        >
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span>Links</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400">
            <GripHorizontal className="w-3.5 h-3.5" />
            <span>Horizontal verschiebbar</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
            <span>Rechts</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      )}

      {/* Radial Hub Root Anchor */}
      <div 
        style={{ left: leftStyle }}
        className="fixed bottom-5 pointer-events-auto z-50 transition-[left] duration-150 ease-out"
      >
        {/* Curved Arc Display when Open (Matching User Sketch) */}
        {isOpen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            
            {/* SVG Layer: 
                1. Smooth sweeping organic curve passing through all nodes
                2. Horizontal leader lines extending to each label */}
            <svg 
              className="absolute pointer-events-none overflow-visible"
              style={{ 
                width: '520px', 
                height: '600px', 
                transform: 'translate(0, 0)',
                left: '-260px',
                top: '-320px'
              }}
            >
              <defs>
                {/* Arc Track Glow Gradient */}
                <linearGradient id="orbit-arc-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                  <stop offset="45%" stopColor="#10b981" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.95" />
                </linearGradient>

                {/* Leader Line Glow */}
                <filter id="leader-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 1. The Single Continuous Sweeping Curve (Der Hauptbogen aus der Skizze) */}
              <path
                d={arcPath}
                fill="none"
                stroke="url(#orbit-arc-gradient)"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                className="opacity-85"
              />

              {/* 2. Horizontal Leader Lines Extending to Each Text Label */}
              {satelliteItems.map((item, idx) => {
                const { x, y } = getNodePosition(idx);
                const nodeSvgX = centerSvgX + x;
                const nodeSvgY = centerSvgY + y;
                const isActive = activeTab === item.id;
                
                // Leader line extends horizontally:
                // Leftwards if on right side, Rightwards if on left side
                const leaderLength = 24;
                const coinRadius = 22;
                const lineStartX = isLeftSide ? (nodeSvgX + coinRadius) : (nodeSvgX - coinRadius);
                const lineEndX = isLeftSide ? (lineStartX + leaderLength) : (lineStartX - leaderLength);

                return (
                  <g key={`leader-group-${item.id}`}>
                    {/* Leader Line */}
                    <line
                      x1={lineStartX}
                      y1={nodeSvgY}
                      x2={lineEndX}
                      y2={nodeSvgY}
                      stroke={item.isAiAction ? '#a855f7' : (isActive ? '#10b981' : '#64748b')}
                      strokeWidth={isActive || item.isAiAction ? '2' : '1.2'}
                      strokeDasharray={isActive ? 'none' : '2 2'}
                      filter={isActive || item.isAiAction ? 'url(#leader-glow)' : undefined}
                    />

                    {/* Small anchor dot at label connector */}
                    <circle
                      cx={lineEndX}
                      cy={nodeSvgY}
                      r={isActive ? '3' : '2'}
                      fill={item.isAiAction ? '#c084fc' : (isActive ? '#34d399' : '#94a3b8')}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Render Each Satellite Node & Its Connected Label */}
            {satelliteItems.map((item, idx) => {
              const { x, y } = getNodePosition(idx);
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    transitionDelay: `${idx * 25}ms`
                  }}
                  className="absolute pointer-events-auto animate-in zoom-in-50 fade-in duration-200"
                >
                  <div className="relative flex items-center justify-center">
                    
                    {/* Compact, Perfectly Formatted Label Positioned at the End of the Leader Line */}
                    <div 
                      className={`absolute whitespace-nowrap pointer-events-none transition-all duration-200 ${
                        isLeftSide 
                          ? 'left-[50px] text-left items-start' 
                          : 'right-[50px] text-right items-end'
                      } flex flex-col justify-center`}
                    >
                      <div className={`px-2 py-0.5 rounded-lg bg-slate-950/92 border shadow-xl backdrop-blur-md flex flex-col ${
                        isLeftSide ? 'items-start' : 'items-end'
                      } ${
                        item.isAiAction
                          ? 'border-violet-500/80 shadow-[0_0_14px_rgba(168,85,247,0.5)] ring-1 ring-violet-400/50'
                          : isActive
                            ? 'border-emerald-400/90 shadow-[0_0_14px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400/60'
                            : 'border-slate-700/80'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider leading-none ${
                            item.isAiAction 
                              ? 'text-violet-300 font-extrabold' 
                              : isActive 
                                ? 'text-emerald-300 font-extrabold' 
                                : 'text-slate-200'
                          }`}>
                            {item.label}
                          </span>

                          {isActive && !item.isAiAction && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>

                        <span className="text-[8px] font-bold text-slate-400 leading-none mt-0.5">
                          {item.sublabel}
                        </span>
                      </div>
                    </div>

                    {/* Circular Stainless Steel Coin Node on the Arc (Size: 44px x 44px) */}
                    <button
                      type="button"
                      onClick={() => handleSatelliteClick(item)}
                      aria-label={item.label}
                      className={`group relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 focus:outline-hidden ${
                        item.isAiAction
                          ? 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-400 text-white border-2 border-white shadow-[0_0_24px_rgba(168,85,247,0.9),0_4px_14px_rgba(0,0,0,0.85)]'
                          : isActive
                            ? 'hub-coin-node-active scale-105 text-white shadow-[0_0_24px_rgba(255,255,255,0.9),0_4px_14px_rgba(0,0,0,0.9)] ring-2 ring-emerald-400'
                            : 'hub-coin-node text-slate-800 shadow-[0_4px_14px_rgba(0,0,0,0.8)]'
                      }`}
                    >
                      {/* Active scanning ring */}
                      {isActive && !item.isAiAction && (
                        <DualLayerScanningRings
                          outerInsetClass="-inset-[3px]"
                          innerInsetClass="-inset-[1.5px]"
                          outerStrokeWidth={0.8}
                          innerStrokeWidth={0.5}
                        />
                      )}

                      {/* AI Pulsing Aura */}
                      {item.isAiAction && (
                        <div className="absolute -inset-1 rounded-full border border-violet-300 animate-ping opacity-35 pointer-events-none" />
                      )}

                      <div className="absolute inset-1 rounded-full hub-knopf-groove pointer-events-none" />

                      {/* Icon */}
                      <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                        item.isAiAction ? 'text-white stroke-[2.4]' : isActive ? 'text-white stroke-[2.5]' : 'text-slate-800 stroke-[2.2]'
                      }`} />

                      {/* Badge if present */}
                      {item.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[15px] text-[8.5px] font-black leading-none rounded-full bg-emerald-400 text-slate-950 border border-white shadow-md flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}

                      {/* AI Connection Status Dot for max_ai button */}
                      {item.isAiAction && (
                        <span 
                          className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white z-20 shadow-xs ${
                            aiConnected 
                              ? 'bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse' 
                              : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          }`} 
                          title={aiConnected ? 'Max AI Verbunden' : 'Max AI Nicht Verbunden'}
                        />
                      )}
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* Central Master Trigger Button: Shows Current Page Name & Icon (The 'X' Dial in the Sketch) */}
        <div className="relative flex flex-col items-center">
          
          {/* Horizontal Drag Tab on top of dial */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-12 h-3 mb-1 rounded-full bg-slate-800/90 border border-slate-600/90 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg hover:bg-slate-700 transition"
            title="Horizontal verschieben"
          >
            <div className="w-6 h-[2px] rounded-full bg-emerald-400/80" />
          </div>

          {/* Main Dial Button - Large 68px x 68px */}
          <button
            type="button"
            onClick={handleMainTriggerClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label={`Aktuelle Seite: ${activeTabItem.label}. Menü öffnen.`}
            className={`group relative w-17 h-17 rounded-full flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-all duration-300 focus:outline-hidden ${
              isOpen 
                ? 'scale-105 shadow-[0_0_36px_rgba(16,185,129,0.85)]' 
                : 'hover:scale-105 active:scale-95 shadow-[0_12px_28px_rgba(0,0,0,0.9)]'
            }`}
          >
            {/* Machined Stainless Steel Dial Body */}
            <div
              className={`absolute inset-0 rounded-full hub-center-dial transition-all duration-300 ${
                isOpen 
                  ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.85)]' 
                  : 'group-hover:shadow-[0_0_25px_rgba(255,255,255,0.8)]'
              }`}
            />

            {/* Specular Chrome Outer Bevel Arc */}
            <div className={`absolute inset-[-3px] rounded-full border pointer-events-none ${
              isOpen 
                ? 'border-emerald-400/90 border-t-white animate-[spin_4s_linear_infinite]' 
                : 'border-white/70 border-t-white animate-[spin_12s_linear_infinite]'
            }`} />

            {/* Inner Recessed Concentric Groove */}
            <div className="absolute inset-1.5 rounded-full hub-knopf-groove pointer-events-none" />

            {/* Center Content: Current Page Icon & Name, or Close 'X' */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 pointer-events-none">
              {isOpen ? (
                <>
                  <X className="w-6 h-6 text-slate-900 stroke-[3] animate-in zoom-in-75 duration-150" />
                  <span className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-none mt-0.5">
                    Schließen
                  </span>
                </>
              ) : (
                <>
                  {/* Current Active Page Icon */}
                  <ActiveIcon className="w-5 h-5 text-slate-900 stroke-[2.4] mb-0.5" />

                  {/* Current Active Page Name */}
                  <span className="text-[9px] font-black tracking-wide block uppercase hub-engraved-text leading-none max-w-[54px] truncate">
                    {activeTabItem.label}
                  </span>

                  {/* Subtitle */}
                  <span className="text-[6.5px] font-bold leading-none hub-engraved-text-subtle text-slate-700 mt-0.5">
                    Menü
                  </span>
                </>
              )}
            </div>

            {/* Notification Badge on Trigger */}
            {!isOpen && openInvoicesCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse shadow-md" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

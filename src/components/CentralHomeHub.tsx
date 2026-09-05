import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  ArrowRight,
  Globe
} from 'lucide-react';
import { NavTab } from '../types';

/* ========================================================================= */
/* CUSTOM MINTED SVG ICONS DESIGNED FOR ENGRAVED STAINLESS STEEL COIN FINISH */
/* ========================================================================= */

// 1. Lager: Sleek side-profile vector silhouette of an automobile (Laser-Etched Metal Finish)
const SleekCarSilhouetteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Aerodynamic Car Body Profile: Front Bumper -> Hood -> Windshield -> Roofline -> Rear Deck */}
    <path d="M1.5 15.5h2.2M8.2 15.5h7.6M19.8 15.5h2.7" />
    <path d="M2.5 15.5c0-1.8 1.2-3.2 2.8-3.5l3.2-3.8c.8-1 2-1.7 3.3-1.7h4.8c1.3 0 2.5.7 3.2 1.8l2.7 3.7c1.3.3 2 1.5 2 3.5v.5H22" />
    {/* Window Split & Pillar Etch */}
    <path d="M8.2 11.5h8.8c.8 0 1.5.4 1.9 1.1l1.1 1.9H7.2l1-3z" />
    <path d="M12.5 8.5v5" />
    {/* Front & Rear Wheels with Alloy Hubs */}
    <circle cx="6" cy="15.5" r="2.3" strokeWidth="2" fill="none" />
    <circle cx="6" cy="15.5" r="0.8" strokeWidth="1.2" fill="none" />
    <circle cx="18" cy="15.5" r="2.3" strokeWidth="2" fill="none" />
    <circle cx="18" cy="15.5" r="0.8" strokeWidth="1.2" fill="none" />
    {/* Headlight & Taillight Laser Etches */}
    <path d="M2.8 13h1.2" strokeWidth="1.5" />
    <path d="M21 13.5h1" strokeWidth="1.5" />
  </svg>
);

// 2. Kunden: Two customer silhouettes (man and woman standing one behind the other)
const DualCustomersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Background Customer Silhouette */}
    <circle cx="8" cy="6.5" r="3.2" />
    <path d="M2 19a5.8 5.8 0 0 1 10.8-2" />
    {/* Foreground Customer Silhouette (Female contour with shoulder curve) */}
    <circle cx="16" cy="8.5" r="3.2" />
    <path d="M11.5 20a5.5 5.5 0 0 1 10.5 0" />
    <path d="M13.5 12c1.2 1.2 3.8 1.2 5 0" strokeWidth="1.8" />
  </svg>
);

// 3. Finanzen: Clear Euro (€) currency symbol
const EuroCurrencyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18.5 6a7.8 7.8 0 0 0-11.2 3.8H15" />
    <path d="M4.5 9.8h11.5" />
    <path d="M4 14.2h12.5" />
    <path d="M7.3 14.2a7.8 7.8 0 0 0 11.2 3.8" />
  </svg>
);

// 4. Rechnungsliste / Dokumente: Clean Windows-style Folder (Pure Folder Symbol without any writing)
const WindowsFolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Classic Windows Explorer folder: Top tab and front folder body */}
    <path d="M3 6a2 2 0 0 1 2-2h4.5a2 2 0 0 1 1.4.6L12.5 6.5H19a2 2 0 0 1 2 2v1.5" strokeWidth="1.8" />
    <rect x="2" y="9" width="20" height="11" rx="1.5" strokeWidth="2" />
  </svg>
);

// 5. Hub / Operations (Single Document Sheet): A pristine single document page with top-right dog-ear fold and clean lines
const SingleDocumentSheetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Single sheet outline with clean folded corner */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" strokeWidth="2" />
    {/* Corner Fold Triangle */}
    <polyline points="14 2 14 8 20 8" strokeWidth="2" />
    {/* Document Text Lines */}
    <line x1="8" y1="13" x2="16" y2="13" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="8" y1="17" x2="13" y2="17" strokeWidth="1.9" strokeLinecap="round" />
    <line x1="8" y1="9" x2="10" y2="9" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

/* ========================================================================= */
/* DUAL-LAYER ROTATING SCANNING RINGS (75% ARCS CLOCKWISE & COUNTER-CLOCKWISE)*/
/* ========================================================================= */
interface DualLayerScanningRingsProps {
  outerInsetClass?: string;
  innerInsetClass?: string;
  outerStrokeWidth?: number;
  innerStrokeWidth?: number;
}

const DualLayerScanningRings: React.FC<DualLayerScanningRingsProps> = ({
  outerInsetClass = "-inset-[7px] sm:-inset-[9px]",
  innerInsetClass = "-inset-[3px] sm:-inset-[4px]",
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

interface CentralHomeHubProps {
  onNavigate: (tab: NavTab) => void;
  onOpenMaxAi: () => void;
  stockCount?: number;
  customerCount?: number;
  openInvoicesCount?: number;
}

interface HubItem {
  id: NavTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  angleDeg: number;
}

export const CentralHomeHub: React.FC<CentralHomeHubProps> = ({
  onNavigate,
  onOpenMaxAi,
}) => {
  const [hoveredItem, setHoveredItem] = useState<HubItem | null>(null);

  const rawHubItems: Omit<HubItem, 'angleDeg'>[] = [
    {
      id: 'neu',
      label: 'Neu / Erfassen',
      shortLabel: '+',
      icon: Plus,
      description: 'Neues Fahrzeug aufnehmen, Schnellkaufvertrag oder Neukunde anlegen',
    },
    {
      id: 'lager',
      label: 'Mein Lager',
      shortLabel: 'Lager',
      icon: SleekCarSilhouetteIcon,
      description: 'Fahrzeugbestand, Stellplatz, Aufbereitungskosten & Margen',
    },
    {
      id: 'kunden',
      label: 'Kundenliste',
      shortLabel: 'Kunden',
      icon: DualCustomersIcon,
      description: 'Kundenstammkartei, B2B & B2C Kontakte, Schlüsselübergabe',
    },
    {
      id: 'operationen',
      label: 'Operationen & Dokumente',
      shortLabel: 'Hub',
      icon: SingleDocumentSheetIcon,
      description: 'Zentraler Dokumenten- & Vertrags-Hub (Rechnungen, Verträge & Übergabe)',
    },
    {
      id: 'rechnungen',
      label: 'Dokumente',
      shortLabel: 'Dokumente',
      icon: WindowsFolderIcon,
      description: 'Rechnungsliste, Belegverwaltung, Mahnwesen & Export',
    },
    {
      id: 'finanzen',
      label: 'Finanzen & Kasse',
      shortLabel: 'Finanzen',
      icon: EuroCurrencyIcon,
      description: 'Kassenbuch, Bareinlagen, Barabhebungen & Banküberblick',
    },
    {
      id: 'showroom',
      label: 'Web Vorschau',
      shortLabel: 'Web',
      icon: Globe,
      description: 'Digitaler Showroom, Web-Präsenz & Händler-Website',
    }
  ];

  // Mathematically uniform orbital distribution (360° / 7 = 51.43° per sector, starting from 270° Top)
  const hubItems: HubItem[] = rawHubItems.map((item, index) => ({
    ...item,
    angleDeg: (270 + (index * 360) / rawHubItems.length) % 360,
  }));

  return (
    <div id="central-home-hub-container" className="relative flex flex-col items-center justify-center mt-1 mb-2 sm:mt-2 sm:mb-3 select-none">
      
      {/* Soft Ambient Specular Lighting emanating behind centerpiece */}
      <div className="absolute w-[450px] sm:w-[600px] md:w-[700px] h-[450px] sm:h-[600px] md:h-[700px] rounded-full hub-center-flare pointer-events-none opacity-40" />

      {/* Main Circular Hub Arena */}
      <div className="relative w-[340px] sm:w-[450px] md:w-[500px] h-[340px] sm:h-[450px] md:h-[500px] flex items-center justify-center">
        
        {/* SVG Machined Steel Orbit Tracks & Precise Lathe Rings */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 500 500"
        >
          <defs>
            <linearGradient id="metallic-track-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#8fa3b3" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4a5c6d" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Radial Spokes to all satellite positions */}
          {hubItems.map((item) => {
            const rad = (item.angleDeg * Math.PI) / 180;
            const x2 = 250 + Math.cos(rad) * 180;
            const y2 = 250 + Math.sin(rad) * 180;
            return (
              <line
                key={item.id}
                x1="250"
                y1="250"
                x2={x2}
                y2={y2}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeOpacity="0.45"
                strokeDasharray="4 6"
              />
            );
          })}

          {/* Outer Fine Machined Steel Orbit Ring */}
          <circle
            cx="250"
            cy="250"
            r="195"
            fill="none"
            stroke="url(#metallic-track-grad)"
            strokeWidth="1.8"
            strokeDasharray="16 12 4 12"
            opacity="0.5"
            className="animate-[spin_90s_linear_infinite]"
          />

          {/* Middle Precision Guideline */}
          <circle
            cx="250"
            cy="250"
            r="155"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="40 60 80 40"
            opacity="0.35"
            className="animate-[spin_60s_linear_infinite_reverse]"
          />

          {/* Inner Core Accent Ring */}
          <circle
            cx="250"
            cy="250"
            r="88"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </svg>

        {/* ========================================================================= */}
        {/* CENTERPIECE: MAX AI ASSISTANT (CONVEX TURNED STAINLESS STEEL DIAL)        */}
        {/* ========================================================================= */}
        <div 
          id="centerpiece-max-ai-hub"
          onClick={onOpenMaxAi}
          className="group relative z-20 w-36 sm:w-44 h-36 sm:h-44 rounded-full flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all duration-300 hover:scale-105"
          title="Klicken für Max AI Chat & Autohaus Copilot"
        >
          {/* Dual-Layer Rotating Scanning Rings (75% Arcs Clockwise & Counter-Clockwise) */}
          <DualLayerScanningRings
            outerInsetClass="-inset-[9px] sm:-inset-[12px]"
            innerInsetClass="-inset-[4px] sm:-inset-[5.5px]"
            outerStrokeWidth={0.8}
            innerStrokeWidth={0.55}
          />

          {/* Machined Metallic Dial Frame with Specular Chrome Bevel matching KNOPF.png */}
          <div 
            className="absolute inset-0 rounded-full hub-center-dial transition-all duration-300 group-hover:shadow-[0_0_45px_rgba(255,255,255,0.9),0_16px_35px_rgba(60,80,100,0.35)]" 
          />

          {/* Flash Aura Shimmer on Hover */}
          <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/40 to-transparent blur-sm animate-pulse" />

          {/* Inner Recessed Concentric Groove Ring from KNOPF.png */}
          <div className="absolute inset-2 sm:inset-2.5 rounded-full hub-knopf-groove pointer-events-none" />

          {/* Content inside Centerpiece: Fully Debossed / Engraved matching KNOPF.png */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 pointer-events-none">
            {hoveredItem ? (
              // Dynamic Preview when hovering one of the 6 surrounding icons
              <div className="animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center max-w-[115px] sm:max-w-[135px]">
                <span className="text-[9px] font-extrabold uppercase tracking-wider block truncate hub-engraved-text">
                  {hoveredItem.shortLabel}
                </span>
                <span className="text-[11px] sm:text-xs font-black line-clamp-1 hub-engraved-text">
                  {hoveredItem.label}
                </span>
                <span className="text-[8px] sm:text-[9px] line-clamp-2 leading-tight mt-0.5 font-bold hub-engraved-text-subtle">
                  {hoveredItem.description}
                </span>
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black mt-0.5 hub-engraved-text">
                  <span>Öffnen</span>
                  <ArrowRight className="w-2.5 h-2.5 hub-engraved-icon" />
                </div>
              </div>
            ) : (
              // Default Max AI dial view matching KNOPF.png: 8-point Star, MAX AI, Autonomy Engine, RESET pill
              <>
                {/* 8-Point Engraved Starburst Icon Matching KNOPF.png */}
                <div className="pt-0.5 pb-0.5 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-5 h-5 sm:w-6 sm:h-6 hub-engraved-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Primary vertical and horizontal cross rays */}
                    <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.6" />
                    <line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.6" />
                    {/* Diagonal 45-degree rays */}
                    <line x1="5" y1="5" x2="19" y2="19" strokeWidth="1.2" />
                    <line x1="19" y1="5" x2="5" y2="19" strokeWidth="1.2" />
                    {/* Central milled star node */}
                    <circle cx="12" cy="12" r="1.2" strokeWidth="1.2" fill="none" />
                  </svg>
                </div>

                {/* Main Engraved Typography: MAX AI */}
                <span className="text-base sm:text-lg font-black tracking-wider block uppercase hub-engraved-text leading-tight">
                  MAX AI
                </span>

                {/* Subtitle: Autonomy Engine */}
                <span className="text-[9.5px] sm:text-[10.5px] font-semibold block tracking-normal leading-tight hub-engraved-text-subtle">
                  Autonomy Engine
                </span>

                {/* Engraved RESET Pill */}
                <div className="pt-1.5">
                  <span className="inline-block px-3 py-0.5 rounded-full hub-knopf-reset-pill text-[8px] sm:text-[9px] font-black uppercase tracking-widest hub-engraved-text">
                    RESET
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FIXED ICON RING: 6 OPERATIONS IN CIRCULAR METALLIC COIN BUTTONS           */}
        {/* ========================================================================= */}
        {hubItems.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredItem?.id === item.id;
          
          return (
            <div
              key={item.id}
              id={`hub-ring-item-${item.id}`}
              style={{
                position: 'absolute',
                transform: `translate(calc(cos(${item.angleDeg}deg) * var(--hub-radius)), calc(sin(${item.angleDeg}deg) * var(--hub-radius)))`,
              }}
              className="[--hub-radius:125px] sm:[--hub-radius:165px] md:[--hub-radius:185px] z-30 transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  isHovered ? 'scale-125 z-40' : 'scale-100 hover:scale-115'
                }`}
                title={`${item.label} - ${item.description}`}
              >
                {/* 3D Minted Metallic Coin Medallion with Engraved Icon and Inner Recessed Groove Ring */}
                <div 
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isHovered
                      ? 'hub-coin-node-active scale-105'
                      : 'hub-coin-node'
                  }`}
                >
                  {/* Dual-Layer Rotating Scanning Rings (75% Arcs Clockwise & Counter-Clockwise) */}
                  <DualLayerScanningRings
                    outerInsetClass="-inset-[7px] sm:-inset-[9px]"
                    innerInsetClass="-inset-[2.5px] sm:-inset-[3.5px]"
                    outerStrokeWidth={0.95}
                    innerStrokeWidth={0.65}
                  />

                  {/* Inner Recessed Concentric Groove Ring matching MAX AI Button */}
                  <div className="absolute inset-1 sm:inset-1.5 rounded-full hub-knopf-groove pointer-events-none" />

                  {/* Flash Action Hover Glow */}
                  <div className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-radial from-white/50 to-transparent blur-xs animate-pulse" />

                  <Icon className={`relative z-10 w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110 hub-engraved-icon ${
                    item.id === 'lager' ? 'hub-engraved-debossed-colorless' : ''
                  } ${
                    isHovered ? 'stroke-[2.6]' : 'stroke-[2.2]'
                  }`} />
                </div>
              </button>
            </div>
          );
        })}

      </div>

    </div>
  );
};


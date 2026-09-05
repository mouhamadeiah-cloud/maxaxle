import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isEntered, setIsEntered] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // Equal & symmetrical 0.52s duration
  const TRANSITION_DURATION_MS = 520;

  // On open, start from 100% offscreen right and glide smoothly in
  useEffect(() => {
    if (isOpen) {
      // Ensure page is immediately scrolled to the very top so user sees the header right away
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      setDragOffset(0);
      setIsExiting(false);
      setIsDragging(false);
      // Small frame delay to ensure browser registers initial 100% state before animating to 0%
      const timer = requestAnimationFrame(() => {
        setIsEntered(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsEntered(false);
      setIsExiting(false);
    }
  }, [isOpen]);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    // Gracefully slide out to the right with exact same duration
    setTimeout(() => {
      onClose();
      setIsExiting(false);
      setIsEntered(false);
      setDragOffset(0);
    }, TRANSITION_DURATION_MS);
  };

  // Touch Handlers for Swipe Right to Dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Detect gesture direction on initial movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    // Only drag horizontally if swiping to the right (positive diffX)
    if (isHorizontalSwipe.current && diffX > 0) {
      const resistedOffset = Math.min(diffX * 0.85, window.innerWidth);
      setDragOffset(resistedOffset);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    
    // If dragged more than 75px to the right, dismiss smoothly
    if (dragOffset > 75) {
      handleDismiss();
    } else {
      setDragOffset(0);
    }
    
    setIsDragging(false);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  };

  if (!isOpen) return null;

  // Determine current transform:
  // Not entered yet -> 100%
  // Exiting -> 100%
  // Dragging -> dragOffset px
  // Entered and idle -> 0%
  let currentTransform = 'translate3d(0, 0, 0)';
  if (isExiting) {
    currentTransform = 'translate3d(100%, 0, 0)';
  } else if (!isEntered) {
    currentTransform = 'translate3d(100%, 0, 0)';
  } else if (dragOffset > 0) {
    currentTransform = `translate3d(${dragOffset}px, 0, 0)`;
  }

  const currentOpacity = dragOffset > 0 ? Math.max(0.4, 1 - dragOffset / 400) : (isExiting ? 0.3 : 1);

  return (
    <div 
      id="maxfleet-slide-panel-container"
      className="relative w-full min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========================================================================= */}
      {/* 1. FIXED RETURN ARROW (Middle-Left Edge, Position Fixed z-index: 1000)     */}
      {/* Never moves or scrolls even when user scrolls inside the sub-page         */}
      {/* ========================================================================= */}
      <div 
        id="slide-panel-fixed-center-left-arrow"
        style={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000
        }}
        className="select-none group"
      >
        <button
          type="button"
          id="slide-panel-edge-back-arrow-btn"
          onClick={handleDismiss}
          aria-label="Zurück zum Home Hub (Klicken oder nach rechts wischen)"
          title="Zurück zum Home Hub (Klicken oder nach rechts wischen)"
          className="flex items-center gap-1.5 py-4 pl-2 pr-3 sm:py-5 sm:pl-2.5 sm:pr-4 rounded-r-2xl metallic-pill text-slate-950 shadow-[0_4px_20px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 group-hover:pr-5 cursor-pointer active:scale-95 border-y border-r border-white/80"
        >
          {/* Permanent gentle slow flashing arrow pointing right */}
          <div className="flex flex-col items-center gap-1.5">
            <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 text-slate-900 group-hover:text-black animate-subtle-slow-flash transition-colors drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]" />
            <span className="text-[9px] font-black uppercase text-slate-900 [writing-mode:vertical-lr] tracking-widest hidden sm:inline py-1 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
              Zurück
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. SLIDING PANEL BODY (Symmetrical and deliberate 0.52s cubic-bezier)     */}
      {/* ========================================================================= */}
      <div
        id="maxfleet-slide-panel-body"
        style={{
          transform: currentTransform,
          opacity: currentOpacity,
          transition: isDragging 
            ? 'none' 
            : `transform ${TRANSITION_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${TRANSITION_DURATION_MS * 0.85}ms ease`
        }}
        className="relative w-full will-change-transform pl-6 sm:pl-8"
      >
        {children}
      </div>
    </div>
  );
};

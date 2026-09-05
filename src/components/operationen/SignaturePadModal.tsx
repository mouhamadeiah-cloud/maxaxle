import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  X, 
  RotateCcw, 
  Check, 
  Trash2,
  ShieldCheck
} from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  signeeName: string;
  role: 'Verkäufer' | 'Käufer' | 'Kunde' | 'Mitarbeiter' | 'Probefahrer' | 'Autohaus';
  onSaveSignature: (signatureDataUrl: string) => void;
  initialSignature?: string;
  defaultMerchantSignatureUrl?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  title,
  signeeName,
  role,
  onSaveSignature,
  initialSignature,
  defaultMerchantSignatureUrl
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState<string>('#0f172a'); // default slate-900

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Adjust canvas resolution for sharp retina display
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2.5;

      if (initialSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = initialSignature;
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
        setHasDrawn(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, initialSignature, penColor]);

  if (!isOpen) return null;

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
      <div className="metallic-modal-container rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-600/60 space-y-4 animate-in fade-in zoom-in-95 text-white my-0 sm:my-1">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl metallic-node flex items-center justify-center font-bold">
              <PenTool className="w-5 h-5 metallic-debossed-icon" />
            </div>
            <div>
              <h3 className="font-black text-slate-100 text-base">
                {title || `Unterschrift ${role}`}
              </h3>
              <p className="text-xs text-slate-400">
                Vertragspartei: <strong className="text-emerald-300">{signeeName || role}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5 metallic-debossed-icon" />
          </button>
        </div>

        {/* Instructions & Pen Color Selector */}
        <div className="text-xs text-slate-300 metallic-card p-2.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Stiftfarbe:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPenColor('#0f172a')}
                className={`w-5 h-5 rounded-full bg-slate-900 border-2 transition ${penColor === '#0f172a' ? 'border-emerald-400 scale-110 shadow-xs' : 'border-slate-600'}`}
                title="Schwarz"
              />
              <button
                type="button"
                onClick={() => setPenColor('#1d4ed8')}
                className={`w-5 h-5 rounded-full bg-blue-700 border-2 transition ${penColor === '#1d4ed8' ? 'border-emerald-400 scale-110 shadow-xs' : 'border-slate-600'}`}
                title="Königsblau"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {defaultMerchantSignatureUrl && (
              <button
                type="button"
                onClick={() => {
                  onSaveSignature(defaultMerchantSignatureUrl);
                  onClose();
                }}
                className="metallic-btn-secondary px-2.5 py-1 text-[11px] font-bold text-emerald-300 rounded-lg transition cursor-pointer flex items-center gap-1"
                title="Gespeicherte Standard-Händlersignatur aus Einstellungen einfügen"
              >
                <ShieldCheck className="w-3.5 h-3.5 metallic-debossed-icon" />
                <span>Standard-Signatur</span>
              </button>
            )}
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-0.5 rounded border border-slate-700 bg-slate-900/60">
              Touch / Pen
            </span>
          </div>
        </div>

        {/* Signature Canvas Box */}
        <div className="relative border-2 border-dashed border-slate-400/50 rounded-2xl bg-slate-100 overflow-hidden touch-none h-56 flex flex-col justify-between p-3">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          {/* Sign baseline indicator */}
          <div className="pointer-events-none border-b border-slate-300 w-full flex justify-between items-center text-[10px] text-slate-500 pb-1">
            <span>✕ Unterschrift {role}</span>
            <span>{signeeName}</span>
          </div>
        </div>

        {/* Legal notice & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
          <button
            type="button"
            onClick={handleClear}
            className="metallic-btn-secondary px-3 py-2 text-xs font-bold text-slate-300 hover:text-rose-400 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 metallic-debossed-icon" />
            <span>Zurücksetzen</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="metallic-btn-secondary px-4 py-2 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasDrawn}
              className="metallic-btn-primary px-5 py-2 text-xs font-bold text-slate-950 rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 metallic-debossed-icon" />
              <span>Unterschrift übernehmen</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

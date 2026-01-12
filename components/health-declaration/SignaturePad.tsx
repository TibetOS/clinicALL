import { useState, useRef, useEffect } from 'react';
import { PenTool, Eraser, Type } from 'lucide-react';
import { Button, Input } from '../ui';

type SignaturePadProps = {
  onEnd: (data: string | null) => void;
  onClear?: () => void;
  lang?: 'he' | 'en';
};

export const SignaturePad = ({ onEnd, onClear, lang = 'he' }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');

  // Translations
  const t = (he: string, en: string) => lang === 'he' ? he : en;

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);

    // Prevent scrolling on touch
    if ('touches' in e) e.preventDefault();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    if ('touches' in e) e.preventDefault();
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
      onEnd(canvasRef.current?.toDataURL() || null);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setTypedName('');
    onEnd(null);
    if (onClear) onClear();
  };

  // Handle typed signature - renders text to canvas
  const handleTypedSignature = (name: string) => {
    setTypedName(name);
    if (!name.trim()) {
      clearCanvas();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw typed signature
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic 32px "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    setHasSignature(true);
    onEnd(canvas.toDataURL());
  };

  // Initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.offsetWidth || 500;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, []);

  return (
    <div className="space-y-3">
      {/* Mode toggle for accessibility */}
      <div className="flex gap-2 text-sm" role="tablist" aria-label={t('בחר שיטת חתימה', 'Choose signature method')}>
        <button
          role="tab"
          aria-selected={signatureMode === 'draw'}
          onClick={() => { setSignatureMode('draw'); clearCanvas(); }}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            signatureMode === 'draw'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <PenTool size={14} className="inline mr-1" />
          {t('צייר חתימה', 'Draw signature')}
        </button>
        <button
          role="tab"
          aria-selected={signatureMode === 'type'}
          onClick={() => { setSignatureMode('type'); clearCanvas(); }}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            signatureMode === 'type'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Type size={14} className="inline mr-1" />
          {t('הקלד שם', 'Type name')}
        </button>
      </div>

      {/* Type signature input (accessibility alternative) */}
      {signatureMode === 'type' && (
        <div className="space-y-2">
          <Input
            type="text"
            value={typedName}
            onChange={(e) => handleTypedSignature(e.target.value)}
            placeholder={t('הקלד את שמך המלא', 'Type your full name')}
            className="text-lg"
            aria-label={t('הקלד את שמך לחתימה', 'Type your name for signature')}
          />
          <p className="text-xs text-gray-500">
            {t('החתימה שלך תופיע בסגנון כתב יד', 'Your signature will appear in handwriting style')}
          </p>
        </div>
      )}

      {/* Canvas signature pad */}
      <div
        className={`relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 ${signatureMode === 'draw' ? 'touch-none' : ''}`}
        role="img"
        aria-label={t('אזור חתימה', 'Signature area')}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={signatureMode === 'draw' ? startDrawing : undefined}
          onMouseMove={signatureMode === 'draw' ? draw : undefined}
          onMouseUp={signatureMode === 'draw' ? endDrawing : undefined}
          onMouseLeave={signatureMode === 'draw' ? endDrawing : undefined}
          onTouchStart={signatureMode === 'draw' ? startDrawing : undefined}
          onTouchMove={signatureMode === 'draw' ? draw : undefined}
          onTouchEnd={signatureMode === 'draw' ? endDrawing : undefined}
          className={`w-full h-[200px] rounded-xl ${signatureMode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
          aria-hidden={signatureMode === 'type'}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 bg-white/80 backdrop-blur-sm shadow-sm"
            onClick={clearCanvas}
            aria-label={t('נקה חתימה', 'Clear signature')}
          >
            <Eraser size={14} className="mr-1"/> {t('נקה', 'Clear')}
          </Button>
        </div>
        {!hasSignature && signatureMode === 'draw' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="text-center">
              <PenTool className="mx-auto mb-2" />
              <span className="text-sm">{t('חתום כאן', 'Sign Here')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

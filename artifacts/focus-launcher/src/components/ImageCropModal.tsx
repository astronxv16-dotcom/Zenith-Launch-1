import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageDataUrl: string;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export function ImageCropModal({ isOpen, imageDataUrl, onClose, onConfirm }: ImageCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [isOpen, imageDataUrl]);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imgRef.current = img;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setDragging(true);
    dragStart.current = { x: clientX, y: clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const doDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (clientX - dragStart.current.x),
      y: dragStart.current.oy + (clientY - dragStart.current.y),
    });
  }, [dragging]);

  const endDrag = useCallback(() => setDragging(false), []);

  const handleConfirm = () => {
    const container = containerRef.current;
    if (!container || !imgRef.current) return;

    const rect = container.getBoundingClientRect();
    const displayW = rect.width;
    const displayH = rect.height;

    const canvas = document.createElement("canvas");
    const targetW = window.screen.width * window.devicePixelRatio;
    const targetH = window.screen.height * window.devicePixelRatio;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaledImgW = displayW * scale;
    const scaledImgH = (imgSize.h / imgSize.w) * scaledImgW;
    const imgLeft = (displayW - scaledImgW) / 2 + offset.x;
    const imgTop = (displayH - scaledImgH) / 2 + offset.y;

    const scaleRatio = imgSize.w / scaledImgW;
    const srcX = (-imgLeft) * scaleRatio;
    const srcY = (-imgTop) * scaleRatio;
    const srcW = displayW * scaleRatio;
    const srcH = displayH * scaleRatio;

    ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
    const result = canvas.toDataURL("image/jpeg", 0.92);
    onConfirm(result);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.95)' }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-none">
            <button onClick={onClose} className="p-2 rounded-full bg-white/8">
              <X className="w-5 h-5 text-white/60" />
            </button>
            <p className="text-sm font-light text-white/40">Drag to reposition</p>
            <button onClick={handleConfirm} className="p-2 rounded-full bg-white/14 flex items-center gap-1.5 px-4">
              <Check className="w-4 h-4 text-white/70" />
              <span className="text-sm font-light text-white/65">Use</span>
            </button>
          </div>

          {/* Crop area — shows phone screen ratio */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-2xl"
              style={{
                width: '100%',
                maxWidth: 360,
                aspectRatio: '9/19.5',
                border: '1.5px solid rgba(255,255,255,0.2)',
                cursor: dragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onMouseDown={e => startDrag(e.clientX, e.clientY)}
              onMouseMove={e => doDrag(e.clientX, e.clientY)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={e => { e.preventDefault(); doDrag(e.touches[0].clientX, e.touches[0].clientY); }}
              onTouchEnd={endDrag}
            >
              <img
                src={imageDataUrl}
                onLoad={handleImgLoad}
                draggable={false}
                style={{
                  position: 'absolute',
                  width: `${100 * scale}%`,
                  height: 'auto',
                  left: `${50 + (offset.x / (containerRef.current?.clientWidth || 1)) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  maxWidth: 'none',
                }}
                alt="crop preview"
              />
              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
                `,
                backgroundSize: '33.33% 33.33%',
              }} />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-6 pb-12 pt-4">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.15))}
              className="p-3 rounded-full bg-white/8 active:bg-white/14">
              <ZoomOut className="w-5 h-5 text-white/50" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-1 w-32 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-white/35 rounded-full transition-all" style={{ width: `${((scale - 0.5) / 2.5) * 100}%` }} />
              </div>
            </div>
            <button onClick={() => setScale(s => Math.min(3, s + 0.15))}
              className="p-3 rounded-full bg-white/8 active:bg-white/14">
              <ZoomIn className="w-5 h-5 text-white/50" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

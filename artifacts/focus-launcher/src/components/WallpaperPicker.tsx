import { useRef, useState } from "react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageCropModal } from "@/components/ImageCropModal";

interface WallpaperPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { id: 'none', name: 'Pure Dark', gradient: 'linear-gradient(160deg, #0d0f14 0%, #13151c 100%)' },
  { id: 'deep-space', name: 'Deep Space', gradient: 'linear-gradient(160deg, #0a0a1a 0%, #0d1533 50%, #12052a 100%)' },
  { id: 'carbon', name: 'Carbon', gradient: 'linear-gradient(160deg, #111318 0%, #1a1d26 100%)' },
  { id: 'midnight', name: 'Midnight', gradient: 'linear-gradient(160deg, #0c0e18 0%, #111828 100%)' },
  { id: 'graphite', name: 'Graphite', gradient: 'linear-gradient(160deg, #151719 0%, #1e2127 100%)' },
];

export const WALLPAPER_GRADIENTS: Record<string, string> = Object.fromEntries(
  PRESETS.map(p => [p.id, p.gradient])
);

const sheetStyle: React.CSSProperties = {
  background: 'rgba(12,14,20,0.90)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '28px 28px 0 0',
};

export function WallpaperPicker({ isOpen, onClose }: WallpaperPickerProps) {
  const { state, setWallpaper, setWallpaperImage } = useLauncherStore();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file" });
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setPendingImageUrl(ev.target?.result as string);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    setShowCrop(false);
    setPendingImageUrl(null);
    setWallpaperImage(croppedDataUrl);
    onClose();
    toast({ title: "Wallpaper applied" });
  };

  const handleCropClose = () => {
    setShowCrop(false);
    setPendingImageUrl(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[100] bg-black/35"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-[101] p-6"
              style={{ ...sheetStyle, paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-light text-white/65">Wallpaper</h2>
                <button onClick={onClose} className="p-2 rounded-full bg-white/6 border border-white/7" data-testid="btn-close-wallpaper">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Gallery with crop note */}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl mb-1 bg-white/5 border border-white/7 active:bg-white/8 transition-colors"
                data-testid="btn-pick-from-gallery"
              >
                <ImagePlus className="w-5 h-5 text-white/38" />
                <div className="text-left">
                  <span className="text-sm font-light text-white/50 block">Choose from gallery</span>
                  <span className="text-[10px] font-light text-white/25">Crop & reposition after selecting</span>
                </div>
                {state.wallpaperImage && (
                  <div className="ml-auto w-8 h-8 rounded-lg flex-none overflow-hidden"
                    style={{ backgroundImage: `url(${state.wallpaperImage})`, backgroundSize: 'cover' }} />
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} data-testid="input-wallpaper-file" />

              {state.wallpaperImage && (
                <button onClick={() => { setWallpaperImage(null); onClose(); }}
                  className="w-full text-left py-2.5 px-4 rounded-xl text-xs font-light text-white/30 active:bg-white/5 mb-4">
                  Remove custom wallpaper
                </button>
              )}

              <p className="text-[10px] font-light tracking-[0.22em] uppercase text-white/22 mb-3 mt-2">Dark Presets</p>

              <div className="flex gap-3 overflow-x-auto pb-1">
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => { setWallpaper(preset.id); onClose(); }}
                    className="relative flex-none w-[72px] h-32 rounded-xl transition-transform active:scale-95 overflow-hidden"
                    style={{ background: preset.gradient }}
                    data-testid={`btn-wallpaper-${preset.id}`}
                  >
                    {state.wallpaper === preset.id && !state.wallpaperImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/8">
                        <Check className="w-5 h-5 text-white/55" />
                      </div>
                    )}
                    <span className="absolute bottom-2 left-0 right-0 text-[9px] text-center font-light text-white/30">{preset.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Crop modal */}
      {pendingImageUrl && (
        <ImageCropModal
          isOpen={showCrop}
          imageDataUrl={pendingImageUrl}
          onClose={handleCropClose}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
}

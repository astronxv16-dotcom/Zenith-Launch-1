import { useRef } from "react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export const WALLPAPER_GRADIENTS: Record<string, string> = {
  'none': 'linear-gradient(160deg, #0d0f14 0%, #13151c 100%)',
  'deep-space': 'linear-gradient(160deg, #0a0a1a 0%, #0d1533 50%, #12052a 100%)',
  'carbon': 'linear-gradient(160deg, #111318 0%, #1a1d26 100%)',
  'midnight': 'linear-gradient(160deg, #0c0e18 0%, #111828 100%)',
  'graphite': 'linear-gradient(160deg, #151719 0%, #1e2127 100%)',
};

const sheetStyle: React.CSSProperties = {
  background: 'rgba(14,16,22,0.85)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '28px 28px 0 0',
};

export function WallpaperPicker({ isOpen, onClose }: WallpaperPickerProps) {
  const { state, setWallpaper, setWallpaperImage } = useLauncherStore();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setWallpaperImage(dataUrl);
      onClose();
      toast({ title: "Wallpaper set" });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 240 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-6 pb-14"
            style={sheetStyle}
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-light text-white/70">Wallpaper</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
                data-testid="btn-close-wallpaper"
              >
                <X className="w-4 h-4 text-white/45" />
              </button>
            </div>

            {/* Gallery pick */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl mb-5 active:bg-white/8 transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
              data-testid="btn-pick-from-gallery"
            >
              <ImagePlus className="w-5 h-5 text-white/40" />
              <span className="text-sm font-light text-white/55">Choose from gallery</span>
              {state.wallpaperImage && (
                <div
                  className="ml-auto w-8 h-8 rounded-lg overflow-hidden flex-none"
                  style={{ backgroundImage: `url(${state.wallpaperImage})`, backgroundSize: 'cover' }}
                />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-wallpaper-file"
            />

            <p className="text-[11px] font-light tracking-widest uppercase text-white/25 mb-3">Dark Presets</p>

            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => { setWallpaper(preset.id); onClose(); }}
                  className="relative flex-none w-20 h-36 rounded-2xl snap-center transition-transform active:scale-95"
                  style={{ background: preset.gradient }}
                  data-testid={`btn-wallpaper-${preset.id}`}
                >
                  {state.wallpaper === preset.id && !state.wallpaperImage && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/8">
                      <Check className="w-5 h-5 text-white/50" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-0 right-0 text-[10px] text-center font-light text-white/35">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

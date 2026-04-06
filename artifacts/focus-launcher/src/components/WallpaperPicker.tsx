import { useLauncherStore } from "@/hooks/useLauncherStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface WallpaperPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { id: 'misty-lavender', name: 'Misty Lavender', gradient: 'linear-gradient(135deg, #e6e6fa, #f0f8ff)' },
  { id: 'warm-sand', name: 'Warm Sand', gradient: 'linear-gradient(135deg, #f5f5dc, #faf0e6)' },
  { id: 'ocean-fog', name: 'Ocean Fog', gradient: 'linear-gradient(135deg, #e0ffff, #f0f8ff)' },
  { id: 'forest-morning', name: 'Forest Morning', gradient: 'linear-gradient(135deg, #f0fff0, #f5fffa)' },
  { id: 'rose-dusk', name: 'Rose Dusk', gradient: 'linear-gradient(135deg, #fff0f5, #ffe4e1)' }
];

export function WallpaperPicker({ isOpen, onClose }: WallpaperPickerProps) {
  const { state, setWallpaper } = useLauncherStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-3xl p-6 pb-12 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">Wallpaper</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5" data-testid="btn-close-wallpaper">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setWallpaper(preset.id)}
                  className="relative flex-none w-24 h-40 rounded-2xl snap-center transition-transform hover:scale-105"
                  style={{ background: preset.gradient }}
                  data-testid={`btn-wallpaper-${preset.id}`}
                >
                  {state.wallpaper === preset.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl">
                      <Check className="w-6 h-6 text-black/60" />
                    </div>
                  )}
                  <span className="absolute bottom-3 left-0 right-0 text-xs text-center font-medium text-black/60 mix-blend-overlay">
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

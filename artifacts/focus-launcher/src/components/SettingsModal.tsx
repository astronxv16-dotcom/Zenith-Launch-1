import { motion, AnimatePresence } from "framer-motion";
import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useLauncherStore, FavoritesAlign } from "@/hooks/useLauncherStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallpaper: () => void;
}

export function SettingsModal({ isOpen, onClose, onOpenWallpaper }: SettingsModalProps) {
  const { state, setFavoritesAlign } = useLauncherStore();

  const alignOptions: { value: FavoritesAlign; icon: typeof AlignLeft; label: string }[] = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-3xl p-6 pb-14"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-light opacity-80">Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full glass-panel-light" data-testid="btn-close-settings">
                <X className="w-4 h-4 opacity-50" />
              </button>
            </div>

            {/* Wallpaper */}
            <div className="mb-6">
              <p className="text-xs font-light tracking-widest uppercase opacity-30 mb-3">Wallpaper</p>
              <button
                onClick={() => { onClose(); setTimeout(onOpenWallpaper, 180); }}
                className="w-full text-left py-3.5 px-4 glass-panel-light rounded-2xl text-sm font-light opacity-70 active:scale-[0.98] transition-transform"
                data-testid="btn-open-wallpaper"
              >
                Change wallpaper
              </button>
            </div>

            {/* Favorites alignment */}
            <div>
              <p className="text-xs font-light tracking-widest uppercase opacity-30 mb-3">Favorites alignment</p>
              <div className="flex gap-2">
                {alignOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setFavoritesAlign(value)}
                    className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95 ${
                      state.favoritesAlign === value
                        ? 'glass-panel ring-1 ring-white/20'
                        : 'glass-panel-light opacity-50'
                    }`}
                    data-testid={`btn-align-${value}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-light">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

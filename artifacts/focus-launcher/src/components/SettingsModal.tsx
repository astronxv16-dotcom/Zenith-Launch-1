import { motion, AnimatePresence } from "framer-motion";
import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useLauncherStore, FavoritesAlign } from "@/hooks/useLauncherStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallpaper: () => void;
}

const sheetStyle: React.CSSProperties = {
  background: 'rgba(14,16,22,0.80)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '28px 28px 0 0',
};

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-light text-white/70">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
                data-testid="btn-close-settings"
              >
                <X className="w-4 h-4 text-white/45" />
              </button>
            </div>

            {/* Wallpaper */}
            <div className="mb-6">
              <p className="text-[11px] font-light tracking-widest uppercase text-white/28 mb-3">Wallpaper</p>
              <button
                onClick={onOpenWallpaper}
                className="w-full text-left py-3.5 px-4 rounded-2xl text-sm font-light text-white/55 active:bg-white/8 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                data-testid="btn-open-wallpaper"
              >
                Change wallpaper
              </button>
            </div>

            {/* Favorites alignment */}
            <div>
              <p className="text-[11px] font-light tracking-widest uppercase text-white/28 mb-3">Favorites alignment</p>
              <div className="flex gap-2">
                {alignOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setFavoritesAlign(value)}
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
                    style={
                      state.favoritesAlign === value
                        ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', opacity: 0.55 }
                    }
                    data-testid={`btn-align-${value}`}
                  >
                    <Icon className="w-5 h-5 text-white/60" />
                    <span className="text-xs font-light text-white/50">{label}</span>
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

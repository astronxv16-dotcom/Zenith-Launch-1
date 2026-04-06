import { motion, AnimatePresence } from "framer-motion";
import { X, AlignLeft, AlignCenter, AlignRight, Eye } from "lucide-react";
import { useLauncherStore, FavoritesAlign, ClockFormat } from "@/hooks/useLauncherStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallpaper: () => void;
}

// THE FIX: maxHeight + overflowY so the sheet never exceeds the viewport in landscape or portrait
const sheetStyle: React.CSSProperties = {
  background: 'rgba(12,14,20,0.94)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '24px 24px 0 0',
  maxHeight: '82dvh',
  overflowY: 'auto',
  paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
};

export function SettingsModal({ isOpen, onClose, onOpenWallpaper }: SettingsModalProps) {
  const { state, setFavoritesAlign, setClockFormat, updateApp } = useLauncherStore();

  const alignOptions: { value: FavoritesAlign; icon: typeof AlignLeft; label: string }[] = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
  ];

  const hiddenApps = state.apps.filter(a => a.isHidden);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={sheetStyle}
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 sticky top-0"
              style={{ background: 'rgba(12,14,20,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <h2 className="text-base font-light text-white/65">Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-white/6 border border-white/7" data-testid="btn-close-settings">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div className="px-6 pb-2">
              {/* Wallpaper */}
              <Section label="Wallpaper">
                <button
                  onClick={onOpenWallpaper}
                  className="w-full text-left py-3.5 px-4 rounded-xl text-sm font-light text-white/50 bg-white/5 border border-white/7 active:bg-white/8 transition-colors"
                  data-testid="btn-open-wallpaper"
                >
                  Change wallpaper
                </button>
              </Section>

              {/* Clock format */}
              <Section label="Clock format">
                <div className="flex gap-2">
                  {(['12h', '24h'] as ClockFormat[]).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setClockFormat(fmt)}
                      className="flex-1 py-3.5 rounded-xl text-sm font-light transition-all active:scale-95"
                      style={
                        (state.clockFormat ?? '12h') === fmt
                          ? { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.70)' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.28)' }
                      }
                    >
                      {fmt === '12h' ? '12h  AM/PM' : '24h'}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Alignment */}
              <Section label="Favorites alignment">
                <div className="flex gap-2">
                  {alignOptions.map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setFavoritesAlign(value)}
                      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all active:scale-95"
                      style={
                        state.favoritesAlign === value
                          ? { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', opacity: 0.5 }
                      }
                      data-testid={`btn-align-${value}`}
                    >
                      <Icon className="w-5 h-5 text-white/55" />
                      <span className="text-xs font-light text-white/45">{label}</span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Hidden apps */}
              <Section label={`Hidden Apps${hiddenApps.length > 0 ? ` (${hiddenApps.length})` : ''}`}>
                {hiddenApps.length === 0 ? (
                  <p className="text-sm font-light text-white/25 py-2">No hidden apps.</p>
                ) : (
                  <div className="space-y-1.5">
                    {hiddenApps.map(app => (
                      <div key={app.id}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/7">
                        <span className="text-sm font-light text-white/50">{app.name}</span>
                        <button
                          onClick={() => updateApp(app.id, { isHidden: false })}
                          className="flex items-center gap-1.5 text-xs font-light text-white/35 hover:text-white/55 transition-colors"
                          data-testid={`btn-unhide-${app.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Unhide
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-light tracking-[0.22em] uppercase text-white/25 mb-3">{label}</p>
      {children}
    </div>
  );
}

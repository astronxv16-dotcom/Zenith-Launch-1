import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PlannerEntry {
  [hourKey: string]: string;
}

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5 AM → 11 PM

function formatHour(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getSlotStyle(hour: number): React.CSSProperties {
  if (hour < 9) {
    const t = (hour - 5) / 4;
    return {
      background: `rgba(${Math.round(255 * (0.04 + 0.01 * (1 - t)))}, ${Math.round(200 * 0.03)}, ${Math.round(100 * 0.02)}, ${0.04 + 0.02 * (1 - t)})`,
    };
  }
  if (hour < 17) {
    return { background: 'rgba(255,255,255,0.025)' };
  }
  if (hour < 21) {
    const t = (hour - 17) / 4;
    return {
      background: `rgba(${Math.round(60 * 0.02)}, ${Math.round(80 * 0.02)}, ${Math.round(200 * (0.04 + 0.02 * t))}, ${0.04 + 0.02 * t})`,
    };
  }
  return { background: 'rgba(20,30,80,0.06)' };
}

function getSectionLabel(hour: number): string | null {
  if (hour === 5) return "Morning";
  if (hour === 12) return "Afternoon";
  if (hour === 17) return "Evening";
  if (hour === 21) return "Night";
  return null;
}

export function DailyPlanner({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const today = getTodayKey();
  const storageKey = `planner_${today}`;
  const [entries, setEntries] = useState<PlannerEntry>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch { return {}; }
  });
  const [editingHour, setEditingHour] = useState<number | null>(null);
  const [draftText, setDraftText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentHour = new Date().getHours();

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(entries)); } catch { /* ignore */ }
  }, [entries, storageKey]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const hourIdx = HOURS.findIndex(h => h >= Math.max(currentHour - 1, 5));
      const el = scrollRef.current.children[hourIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isOpen, currentHour]);

  const saveEntry = (hour: number) => {
    if (draftText.trim()) {
      setEntries(prev => ({ ...prev, [hour]: draftText.trim() }));
    } else {
      setEntries(prev => { const n = { ...prev }; delete n[hour]; return n; });
    }
    setEditingHour(null);
    setDraftText("");
  };

  const now = new Date();
  const dateLabel = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-[81] flex flex-col"
            style={{
              height: '90dvh',
              background: 'rgba(8,10,16,0.92)',
              backdropFilter: 'blur(40px) saturate(160%)',
              WebkitBackdropFilter: 'blur(40px) saturate(160%)',
              borderRadius: '28px 28px 0 0',
              border: '1px solid rgba(255,255,255,0.07)',
              borderBottom: 'none',
            }}
            onTouchStart={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-none">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.14)' }} />
            </div>

            {/* Header */}
            <div className="px-6 pt-2 pb-4 flex items-start justify-between flex-none">
              <div>
                <h2 className="text-xl font-extralight tracking-wide" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Daily Plan
                </h2>
                <p className="text-[11px] font-light tracking-wide mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {dateLabel}
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-1 p-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.40)' }} />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-6 flex-none" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

            {/* Time slots */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
              {HOURS.map(hour => {
                const label = getSectionLabel(hour);
                const isNow = hour === currentHour;
                const hasEntry = !!entries[hour];
                const isEditing = editingHour === hour;
                const slotStyle = getSlotStyle(hour);

                return (
                  <div key={hour}>
                    {/* Section label */}
                    {label && (
                      <p className="text-[9px] font-light tracking-[0.28em] uppercase px-2 pt-2 pb-1"
                        style={{ color: 'rgba(255,255,255,0.20)' }}>
                        {label}
                      </p>
                    )}

                    {/* Slot */}
                    <motion.div
                      layout
                      className="rounded-2xl overflow-hidden"
                      style={{
                        ...slotStyle,
                        border: isNow
                          ? '1px solid rgba(255,255,255,0.18)'
                          : hasEntry
                          ? '1px solid rgba(255,255,255,0.08)'
                          : '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <button
                        className="w-full flex items-start gap-4 px-4 py-3 text-left"
                        onClick={() => {
                          if (!isEditing) {
                            setEditingHour(hour);
                            setDraftText(entries[hour] || "");
                          }
                        }}
                      >
                        {/* Time label */}
                        <div className="flex-none w-12 pt-0.5">
                          <span
                            className="text-[11px] font-light tabular-nums"
                            style={{ color: isNow ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.22)' }}
                          >
                            {formatHour(hour)}
                          </span>
                          {isNow && (
                            <div className="mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(180,200,255,0.6)' }} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-[20px]">
                          {isEditing ? (
                            <input
                              autoFocus
                              type="text"
                              value={draftText}
                              onChange={e => setDraftText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEntry(hour); if (e.key === 'Escape') { setEditingHour(null); setDraftText(""); } }}
                              onBlur={() => saveEntry(hour)}
                              onClick={e => e.stopPropagation()}
                              className="w-full bg-transparent outline-none text-sm font-light"
                              style={{ color: 'rgba(255,255,255,0.75)' }}
                              placeholder={isNow ? "What's happening now?" : "Add plan..."}
                            />
                          ) : hasEntry ? (
                            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                              {entries[hour]}
                            </p>
                          ) : (
                            <p className="text-[12px] font-light" style={{ color: 'rgba(255,255,255,0.12)' }}>
                              {isNow ? "Now · tap to plan" : "—"}
                            </p>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  </div>
                );
              })}
              <div className="h-8" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

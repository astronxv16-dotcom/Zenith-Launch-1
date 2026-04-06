import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

const calStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '14px',
};

const popupStyle: React.CSSProperties = {
  background: 'rgba(16,18,26,0.96)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
  minWidth: '220px',
};

export function MiniCalendar() {
  const today = new Date();
  const { state, setCalendarEvent, deleteCalendarEvent } = useLauncherStore();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [editText, setEditText] = useState("");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; type: 'prev' | 'curr' | 'next' }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'curr' });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, type: 'next' });

  const isToday = (day: number, type: string) =>
    type === 'curr' && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleDayClick = (e: React.MouseEvent, day: number, type: string) => {
    if (type !== 'curr') return;
    const key = toKey(year, month, day);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setSelectedKey(key);
    setEditText(state.calendarEvents[key] || "");
    // Position popup near the clicked cell
    setPopupPos({ top: rect.bottom + 6, left: Math.max(8, rect.left - 80) });
  };

  const saveEvent = () => {
    if (!selectedKey) return;
    if (editText.trim()) {
      setCalendarEvent(selectedKey, editText.trim());
    } else {
      deleteCalendarEvent(selectedKey);
    }
    setSelectedKey(null);
    setPopupPos(null);
  };

  return (
    <div style={calStyle} data-testid="mini-calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-xl active:bg-white/8 transition-colors" data-testid="btn-cal-prev">
          <ChevronLeft className="w-4 h-4 text-white/28" />
        </button>
        <span className="text-[13px] font-light text-white/42 tracking-wide">{MONTHS[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-xl active:bg-white/8 transition-colors" data-testid="btn-cal-next">
          <ChevronRight className="w-4 h-4 text-white/28" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-white/18 tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const key = cell.type === 'curr' ? toKey(year, month, cell.day) : '';
          const hasEvent = key && !!state.calendarEvents[key];
          const isSelected = selectedKey === key;
          return (
            <div key={i} className="flex items-center justify-center h-7">
              <div
                onClick={e => handleDayClick(e, cell.day, cell.type)}
                className={`relative w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-light transition-all cursor-pointer
                  ${cell.type !== 'curr' ? 'text-white/10 pointer-events-none' : 'text-white/48 hover:bg-white/8'}
                  ${isToday(cell.day, cell.type) ? '!text-white/88 font-medium' : ''}
                  ${isSelected ? 'ring-1 ring-white/30' : ''}
                `}
                style={isToday(cell.day, cell.type) ? { background: 'rgba(255,255,255,0.12)' } : {}}
              >
                {cell.day}
                {hasEvent && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event popup */}
      <AnimatePresence>
        {selectedKey && popupPos && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => { setSelectedKey(null); setPopupPos(null); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.14 }}
              className="fixed z-[61] p-3"
              style={{ ...popupStyle, top: popupPos.top, left: popupPos.left }}
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-light text-white/35 tracking-wide">{selectedKey}</p>
                <button onClick={() => { setSelectedKey(null); setPopupPos(null); }}>
                  <X className="w-3.5 h-3.5 text-white/28" />
                </button>
              </div>
              <input
                autoFocus
                type="text"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveEvent()}
                placeholder="Add note or event..."
                className="w-full bg-white/6 border border-white/8 rounded-lg px-3 py-2 text-sm font-light text-white/65 placeholder:text-white/22 outline-none mb-2"
              />
              <div className="flex gap-2">
                {state.calendarEvents[selectedKey] && (
                  <button onClick={() => { deleteCalendarEvent(selectedKey); setSelectedKey(null); setPopupPos(null); }}
                    className="flex-1 py-2 rounded-lg text-xs font-light text-white/30 bg-white/4 active:bg-white/8">
                    Clear
                  </button>
                )}
                <button onClick={saveEvent}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-white/60 bg-white/8 active:bg-white/14">
                  Save
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

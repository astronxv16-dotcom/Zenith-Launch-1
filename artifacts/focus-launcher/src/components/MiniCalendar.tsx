import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const calStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '16px',
};

export function MiniCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; type: 'prev' | 'curr' | 'next' }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, type: 'prev' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'curr' });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: 'next' });
  }

  const isToday = (day: number, type: string) =>
    type === 'curr' &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div style={calStyle} data-testid="mini-calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-xl active:bg-white/8 transition-colors"
          data-testid="btn-cal-prev"
        >
          <ChevronLeft className="w-4 h-4 text-white/30" />
        </button>
        <span className="text-[13px] font-light text-white/45 tracking-wide">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-xl active:bg-white/8 transition-colors"
          data-testid="btn-cal-next"
        >
          <ChevronRight className="w-4 h-4 text-white/30" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-white/20 tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => (
          <div key={i} className="flex items-center justify-center h-7">
            <div
              className={`
                w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-light transition-all
                ${cell.type !== 'curr' ? 'text-white/12' : 'text-white/50'}
                ${isToday(cell.day, cell.type)
                  ? '!text-white/90 font-medium ring-1 ring-white/25'
                  : ''}
              `}
              style={isToday(cell.day, cell.type) ? { background: 'rgba(255,255,255,0.12)' } : {}}
            >
              {cell.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (day: number, type: string) =>
    type === 'curr' &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="glass-panel rounded-3xl p-5 select-none" data-testid="mini-calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-xl hover:bg-white/8 active:scale-95 transition-all"
          data-testid="btn-cal-prev"
        >
          <ChevronLeft className="w-4 h-4 opacity-40" />
        </button>
        <span className="text-sm font-light tracking-wide opacity-60">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-xl hover:bg-white/8 active:scale-95 transition-all"
          data-testid="btn-cal-next"
        >
          <ChevronRight className="w-4 h-4 opacity-40" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium opacity-30 tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            <div
              className={`
                w-7 h-7 flex items-center justify-center rounded-full text-xs font-light transition-all
                ${cell.type !== 'curr' ? 'opacity-15' : 'opacity-60'}
                ${isToday(cell.day, cell.type)
                  ? '!opacity-100 bg-white/15 font-medium ring-1 ring-white/20'
                  : 'hover:bg-white/8'
                }
              `}
            >
              {cell.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

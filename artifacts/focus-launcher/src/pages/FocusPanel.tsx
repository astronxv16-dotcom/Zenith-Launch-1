import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, CalendarDays } from "lucide-react";
import { useLauncherStore, TodoData } from "@/hooks/useLauncherStore";
import { MiniCalendar } from "@/components/MiniCalendar";
import { WeatherWidget } from "@/components/WeatherWidget";
import { DailyPlanner } from "@/components/DailyPlanner";

function formatDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

const thinGlass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.045)',
  backdropFilter: 'blur(18px) saturate(160%)',
  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
};

interface FocusPanelProps {
  onModalChange?: (open: boolean) => void;
}

export function FocusPanel({ onModalChange }: FocusPanelProps) {
  const { state, updateState } = useLauncherStore();
  const [newTodo, setNewTodo] = useState("");
  const [showPlanner, setShowPlanner] = useState(false);

  const openPlanner = () => {
    setShowPlanner(true);
    onModalChange?.(true);
  };
  const closePlanner = () => {
    setShowPlanner(false);
    onModalChange?.(false);
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: TodoData = { id: `todo-${Date.now()}`, text: newTodo.trim(), isCompleted: false };
    updateState(prev => ({ ...prev, todos: [...prev.todos, todo] }));
    setNewTodo("");
  };

  const toggleTodo = (id: string) =>
    updateState(prev => ({ ...prev, todos: prev.todos.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t) }));

  const deleteTodo = (id: string) =>
    updateState(prev => ({ ...prev, todos: prev.todos.filter(t => t.id !== id) }));

  return (
    <>
      <div className="w-full h-full flex flex-col overflow-y-auto" data-testid="focus-panel">

        <div className="px-5 pt-14 pb-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-light tracking-[0.22em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.26)' }}>
              {formatDate(new Date())}
            </p>
            <h2 className="text-2xl font-extralight tracking-wide" style={{ color: 'rgba(255,255,255,0.62)' }}>Today</h2>
          </motion.div>
        </div>

        {/* Daily Plan button */}
        <div className="px-5 mb-5">
          <button
            onClick={openPlanner}
            className="w-full flex items-center justify-between px-4 py-3.5 active:opacity-60 transition-opacity duration-100"
            style={thinGlass}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.30)' }} />
              <span className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Daily Plan</span>
            </div>
            <span className="text-[11px] font-light" style={{ color: 'rgba(255,255,255,0.22)' }}>tap to open</span>
          </button>
        </div>

        {/* Calendar */}
        <div className="px-5 mb-5">
          <MiniCalendar />
        </div>

        {/* Weather */}
        <div className="px-5 mb-5">
          <p className="text-[10px] font-light tracking-[0.22em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.26)' }}>Weather</p>
          <WeatherWidget />
        </div>

        {/* Todos */}
        <div className="px-5 mb-5">
          <p className="text-[10px] font-light tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.26)' }}>To Do</p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add a task..."
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTodo()}
              style={{ ...thinGlass, color: 'rgba(255,255,255,0.62)' }}
              className="flex-1 px-4 py-3 text-sm font-light placeholder:text-white/18 outline-none bg-transparent"
              data-testid="input-new-todo"
            />
            <button
              onClick={addTodo}
              style={{ ...thinGlass, width: '46px', height: '46px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              className="active:opacity-60 transition-opacity"
              data-testid="btn-add-todo"
            >
              <Plus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            </button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {state.todos.map(todo => (
                <motion.div
                  key={todo.id} layout
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18 }}
                  style={thinGlass}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded-full border flex-none flex items-center justify-center transition-all ${todo.isCompleted ? 'border-white/22' : 'border-white/16'}`}
                    style={todo.isCompleted ? { background: 'rgba(255,255,255,0.10)' } : {}}
                    data-testid={`btn-todo-${todo.id}`}
                  >
                    {todo.isCompleted && <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.55)' }} />}
                  </button>
                  <span
                    className={`flex-1 text-sm font-light ${todo.isCompleted ? 'line-through' : ''}`}
                    style={{ color: todo.isCompleted ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.55)' }}
                  >
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className="active:opacity-50 transition-opacity" data-testid={`btn-delete-todo-${todo.id}`}>
                    <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.18)' }} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Notes */}
        <div className="px-5 pb-14">
          <p className="text-[10px] font-light tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.26)' }}>Quick Note</p>
          <textarea
            value={state.quickNotes}
            onChange={e => updateState({ quickNotes: e.target.value })}
            placeholder="Jot something down..."
            rows={3}
            style={thinGlass}
            className="w-full px-4 py-3 text-sm font-light placeholder:text-white/16 outline-none resize-none bg-transparent"
            data-testid="textarea-quick-notes"
          />
        </div>
      </div>

      {/* Daily Planner sheet — lives here, rendered to body via portal */}
      <DailyPlanner isOpen={showPlanner} onClose={closePlanner} />
    </>
  );
}

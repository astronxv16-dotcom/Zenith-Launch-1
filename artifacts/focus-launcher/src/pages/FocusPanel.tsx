import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check } from "lucide-react";
import { useLauncherStore, TodoData } from "@/hooks/useLauncherStore";
import { MiniCalendar } from "@/components/MiniCalendar";
import { WeatherWidget } from "@/components/WeatherWidget";

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

export function FocusPanel({ onModalChange: _omit }: FocusPanelProps) {
  const { state, updateState } = useLauncherStore();
  const [newTodo, setNewTodo] = useState("");

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
    <div className="w-full h-full flex flex-col overflow-y-auto" data-testid="focus-panel">

      <div className="px-5 pt-14 pb-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-light tracking-[0.22em] uppercase text-white/28 mb-1">{formatDate(new Date())}</p>
          <h2 className="text-2xl font-extralight tracking-wide text-white/65">Today</h2>
        </motion.div>
      </div>

      {/* Calendar */}
      <div className="px-5 mb-5">
        <MiniCalendar />
      </div>

      {/* Weather Widget */}
      <div className="px-5 mb-5">
        <p className="text-[10px] font-light tracking-[0.22em] uppercase text-white/28 mb-2">Weather</p>
        <WeatherWidget />
      </div>

      {/* Todos */}
      <div className="px-5 mb-5">
        <p className="text-[10px] font-light tracking-[0.22em] uppercase text-white/28 mb-3">To Do</p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add a task..."
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            style={thinGlass}
            className="flex-1 px-4 py-3 text-sm font-light text-white/65 placeholder:text-white/20 outline-none bg-transparent"
            data-testid="input-new-todo"
          />
          <button
            onClick={addTodo}
            style={{ ...thinGlass, width: '46px', height: '46px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="active:scale-95 transition-transform"
            data-testid="btn-add-todo"
          >
            <Plus className="w-5 h-5 text-white/38" />
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {state.todos.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4 text-xs text-white/18 font-light">
                All clear.
              </motion.p>
            )}
            {state.todos.map(todo => (
              <motion.div
                key={todo.id} layout
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 12 }}
                style={thinGlass}
                className="flex items-center gap-3 py-3 px-4"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border flex-none flex items-center justify-center transition-all ${todo.isCompleted ? 'bg-white/18 border-white/25' : 'border-white/18'}`}
                  data-testid={`btn-todo-${todo.id}`}
                >
                  {todo.isCompleted && <Check className="w-3 h-3 text-white/75" />}
                </button>
                <span className={`flex-1 text-sm font-light ${todo.isCompleted ? 'line-through text-white/22' : 'text-white/58'}`}>{todo.text}</span>
                <button onClick={() => deleteTodo(todo.id)} className="text-white/14 hover:text-white/38 transition-colors" data-testid={`btn-delete-todo-${todo.id}`}>
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Notes */}
      <div className="px-5 pb-14">
        <p className="text-[10px] font-light tracking-[0.22em] uppercase text-white/28 mb-3">Quick Note</p>
        <textarea
          value={state.quickNotes}
          onChange={e => updateState({ quickNotes: e.target.value })}
          placeholder="Jot something down..."
          rows={3}
          style={thinGlass}
          className="w-full px-4 py-3 text-sm font-light text-white/55 placeholder:text-white/18 outline-none resize-none bg-transparent"
          data-testid="textarea-quick-notes"
        />
      </div>
    </div>
  );
}

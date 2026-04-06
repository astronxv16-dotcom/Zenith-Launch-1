import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Pencil } from "lucide-react";
import { useLauncherStore, TodoData } from "@/hooks/useLauncherStore";
import { MiniCalendar } from "@/components/MiniCalendar";

function formatDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export function FocusPanel() {
  const { state, updateState } = useLauncherStore();
  const [newTodo, setNewTodo] = useState("");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitText, setEditingHabitText] = useState("");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: TodoData = { id: `todo-${Date.now()}`, text: newTodo.trim(), isCompleted: false };
    updateState(prev => ({ ...prev, todos: [...prev.todos, todo] }));
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    updateState(prev => ({
      ...prev,
      todos: prev.todos.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)
    }));
  };

  const deleteTodo = (id: string) => {
    updateState(prev => ({ ...prev, todos: prev.todos.filter(t => t.id !== id) }));
  };

  const toggleHabit = (id: string) => {
    updateState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, isCompleted: !h.isCompleted } : h)
    }));
  };

  const saveHabitEdit = () => {
    if (!editingHabitId || !editingHabitText.trim()) return;
    updateState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === editingHabitId ? { ...h, text: editingHabitText.trim() } : h)
    }));
    setEditingHabitId(null);
    setEditingHabitText("");
  };

  const completedHabits = state.habits.filter(h => h.isCompleted).length;
  const totalHabits = state.habits.length;

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #0c0e14 0%, #111520 100%)' }}
      data-testid="focus-panel"
    >
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] font-light tracking-widest uppercase text-white/30 mb-1">
            {formatDate(new Date())}
          </p>
          <h2 className="text-2xl font-extralight tracking-wide text-white/70">Today</h2>
        </motion.div>
      </div>

      {/* Mini Calendar */}
      <div className="px-5 mb-5">
        <MiniCalendar />
      </div>

      {/* Habits */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-light tracking-widest uppercase text-white/30">Habits</p>
          <p className="text-[11px] text-white/20 font-light">{completedHabits}/{totalHabits}</p>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-white/8 rounded-full mb-3 overflow-hidden">
          <motion.div
            className="h-full bg-white/30 rounded-full"
            animate={{ width: `${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="space-y-2">
          {state.habits.map((habit) => (
            <motion.div
              key={habit.id}
              layout
              className="flex items-center gap-3 py-3 px-4 glass-panel rounded-2xl"
            >
              {editingHabitId === habit.id ? (
                <input
                  type="text"
                  value={editingHabitText}
                  onChange={(e) => setEditingHabitText(e.target.value)}
                  onBlur={saveHabitEdit}
                  onKeyDown={(e) => e.key === "Enter" && saveHabitEdit()}
                  autoFocus
                  className="flex-1 bg-transparent text-sm font-light text-white/80 outline-none"
                  data-testid={`input-habit-${habit.id}`}
                />
              ) : (
                <>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-none transition-all ${
                      habit.isCompleted
                        ? 'bg-white/20 border-white/30'
                        : 'border-white/20'
                    }`}
                    data-testid={`btn-habit-${habit.id}`}
                  >
                    {habit.isCompleted && <Check className="w-3 h-3 text-white/80" />}
                  </button>
                  <span className={`flex-1 text-sm font-light ${habit.isCompleted ? 'line-through text-white/25' : 'text-white/60'}`}>
                    {habit.text}
                  </span>
                  <button
                    onClick={() => { setEditingHabitId(habit.id); setEditingHabitText(habit.text); }}
                    className="text-white/15 hover:text-white/40 transition-colors"
                    data-testid={`btn-edit-habit-${habit.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Todos */}
      <div className="px-5 mb-5">
        <p className="text-[11px] font-light tracking-widest uppercase text-white/30 mb-3">To Do</p>

        {/* Add input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add a task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            className="flex-1 glass-panel rounded-2xl px-4 py-3 text-sm font-light text-white/70 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-white/15 transition-all bg-transparent"
            data-testid="input-new-todo"
          />
          <button
            onClick={addTodo}
            className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center active:scale-95 transition-transform"
            data-testid="btn-add-todo"
          >
            <Plus className="w-5 h-5 text-white/40" />
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {state.todos.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 text-xs text-white/20 font-light"
              >
                All clear.
              </motion.p>
            )}
            {state.todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="flex items-center gap-3 py-3 px-4 glass-panel rounded-2xl"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-none transition-all ${
                    todo.isCompleted ? 'bg-white/20 border-white/30' : 'border-white/20'
                  }`}
                  data-testid={`btn-todo-${todo.id}`}
                >
                  {todo.isCompleted && <Check className="w-3 h-3 text-white/80" />}
                </button>
                <span className={`flex-1 text-sm font-light ${todo.isCompleted ? 'line-through text-white/25' : 'text-white/60'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-white/15 hover:text-white/40 transition-colors"
                  data-testid={`btn-delete-todo-${todo.id}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Notes */}
      <div className="px-5 pb-14">
        <p className="text-[11px] font-light tracking-widest uppercase text-white/30 mb-3">Quick Note</p>
        <textarea
          value={state.quickNotes}
          onChange={(e) => updateState({ quickNotes: e.target.value })}
          placeholder="Jot something down..."
          rows={3}
          className="w-full glass-panel rounded-2xl px-4 py-3 text-sm font-light text-white/60 placeholder:text-white/18 outline-none focus:ring-1 focus:ring-white/12 transition-all resize-none bg-transparent"
          data-testid="textarea-quick-notes"
        />
      </div>
    </div>
  );
}

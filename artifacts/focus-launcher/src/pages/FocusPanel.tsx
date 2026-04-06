import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Pencil } from "lucide-react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { TodoData, HabitData } from "@/hooks/useLauncherStore";

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
      style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #fce7f3 40%, #fff1f2 100%)' }}
      data-testid="focus-panel"
    >
      <div className="px-6 pt-14 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-light tracking-widest uppercase opacity-40 mb-1">
            {formatDate(new Date())}
          </p>
          <h2 className="text-3xl font-extralight tracking-wide opacity-80">Today's Focus</h2>
        </motion.div>
      </div>

      {/* Habits */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-light tracking-widest uppercase opacity-40">Daily Habits</p>
          <p className="text-xs opacity-30 font-light">{completedHabits}/{totalHabits}</p>
        </div>

        {/* Habit progress bar */}
        <div className="h-1 bg-black/5 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-rose-300/70 rounded-full"
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
                  className="flex-1 bg-transparent text-sm font-light outline-none"
                  data-testid={`input-habit-${habit.id}`}
                />
              ) : (
                <>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none transition-all ${
                      habit.isCompleted ? 'bg-rose-300 border-rose-300' : 'border-black/20'
                    }`}
                    data-testid={`btn-habit-${habit.id}`}
                  >
                    {habit.isCompleted && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm font-light ${habit.isCompleted ? 'line-through opacity-40' : 'opacity-70'}`}>
                    {habit.text}
                  </span>
                  <button
                    onClick={() => { setEditingHabitId(habit.id); setEditingHabitText(habit.text); }}
                    className="opacity-20 hover:opacity-40 transition-opacity"
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
      <div className="px-6 mb-6">
        <p className="text-xs font-light tracking-widest uppercase opacity-40 mb-3">To Do</p>

        {/* Add todo input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add a task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            className="flex-1 bg-white/40 border border-white/60 rounded-2xl px-4 py-3 text-sm font-light placeholder:opacity-40 outline-none focus:ring-2 focus:ring-pink-200 transition-all"
            data-testid="input-new-todo"
          />
          <button
            onClick={addTodo}
            className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center active:scale-95 transition-transform"
            data-testid="btn-add-todo"
          >
            <Plus className="w-5 h-5 opacity-50" />
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {state.todos.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 text-sm opacity-25 font-light"
              >
                All clear. Add something to focus on.
              </motion.p>
            )}
            {state.todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 py-3 px-4 glass-panel rounded-2xl"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none transition-all ${
                    todo.isCompleted ? 'bg-rose-300 border-rose-300' : 'border-black/20'
                  }`}
                  data-testid={`btn-todo-${todo.id}`}
                >
                  {todo.isCompleted && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className={`flex-1 text-sm font-light ${todo.isCompleted ? 'line-through opacity-40' : 'opacity-70'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-20 hover:opacity-50 transition-opacity"
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
      <div className="px-6 pb-12">
        <p className="text-xs font-light tracking-widest uppercase opacity-40 mb-3">Quick Note</p>
        <textarea
          value={state.quickNotes}
          onChange={(e) => updateState({ quickNotes: e.target.value })}
          placeholder="Jot something down..."
          rows={4}
          className="w-full bg-white/40 border border-white/60 rounded-2xl px-4 py-3 text-sm font-light placeholder:opacity-40 outline-none focus:ring-2 focus:ring-pink-200 transition-all resize-none"
          data-testid="textarea-quick-notes"
        />
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, GripVertical, Check } from "lucide-react";

interface PlannerSlot {
  id: string;
  label: string;
  plan: string;
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

const STORAGE_KEY_PREFIX = "planner_slots_";

function loadSlots(day: string): PlannerSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + day);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSlots(day: string, slots: PlannerSlot[]) {
  try { localStorage.setItem(STORAGE_KEY_PREFIX + day, JSON.stringify(slots)); } catch { /* ignore */ }
}

export function DailyPlanner({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const today = getTodayKey();
  const [slots, setSlots] = useState<PlannerSlot[]>(() => loadSlots(today));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'label' | 'plan' | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftPlan, setDraftPlan] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    saveSlots(today, slots);
  }, [slots, today]);

  const now = new Date();
  const dateLabel = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const startEdit = (slot: PlannerSlot, field: 'label' | 'plan') => {
    setEditingId(slot.id);
    setEditingField(field);
    setDraftLabel(slot.label);
    setDraftPlan(slot.plan);
  };

  const commitEdit = () => {
    if (!editingId) return;
    setSlots(prev => prev.map(s => s.id === editingId
      ? { ...s, label: draftLabel.trim() || s.label, plan: draftPlan }
      : s
    ));
    setEditingId(null);
    setEditingField(null);
  };

  const addSlot = () => {
    if (!newLabel.trim()) return;
    const slot: PlannerSlot = { id: `slot-${Date.now()}`, label: newLabel.trim(), plan: newPlan.trim() };
    setSlots(prev => [...prev, slot]);
    setNewLabel("");
    setNewPlan("");
    setAddingNew(false);
  };

  const deleteSlot = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
    setDeletingId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => { if (!addingNew && !editingId) onClose(); else { setAddingNew(false); setEditingId(null); } }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-[81] flex flex-col"
            style={{
              height: '88dvh',
              background: 'rgba(8,10,16,0.94)',
              backdropFilter: 'blur(48px) saturate(160%)',
              WebkitBackdropFilter: 'blur(48px) saturate(160%)',
              borderRadius: '28px 28px 0 0',
              border: '1px solid rgba(255,255,255,0.07)',
              borderBottom: 'none',
            }}
            onTouchStart={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-none">
              <div className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            </div>

            {/* Header */}
            <div className="px-6 pt-2 pb-3 flex items-center justify-between flex-none">
              <div>
                <h2 className="text-xl font-extralight tracking-wide" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Daily Plan
                </h2>
                <p className="text-[11px] font-light mt-0.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.26)' }}>
                  {dateLabel}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.38)' }} />
              </button>
            </div>

            <div className="mx-6 flex-none" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

            {/* Slots list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {slots.length === 0 && !addingNew && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 gap-3"
                >
                  <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.18)' }}>No slots yet</p>
                  <p className="text-[11px] font-light text-center" style={{ color: 'rgba(255,255,255,0.12)' }}>
                    Tap + to add your own time slots — morning, gym, calls, anything
                  </p>
                </motion.div>
              )}

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {slots.map(slot => {
                    const isEditing = editingId === slot.id;
                    const isDeleting = deletingId === slot.id;

                    return (
                      <motion.div
                        key={slot.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: isEditing
                            ? '1px solid rgba(255,255,255,0.14)'
                            : '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="flex items-stretch">
                          {/* Grip — hold to delete hint */}
                          <button
                            className="flex-none px-3 flex items-center"
                            onPointerDown={() => setDeletingId(isDeleting ? null : slot.id)}
                            style={{ color: 'rgba(255,255,255,0.14)' }}
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Label */}
                          <div className="flex-none w-24 py-3 pr-2 border-r" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {isEditing ? (
                              <input
                                autoFocus={editingField === 'label'}
                                value={draftLabel}
                                onChange={e => setDraftLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && commitEdit()}
                                onBlur={commitEdit}
                                onClick={e => e.stopPropagation()}
                                className="w-full bg-transparent outline-none text-[12px] font-light tabular-nums"
                                style={{ color: 'rgba(255,255,255,0.70)' }}
                                placeholder="Time"
                              />
                            ) : (
                              <button
                                onClick={() => startEdit(slot, 'label')}
                                className="w-full text-left"
                              >
                                <span className="text-[12px] font-light tabular-nums block" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                  {slot.label}
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Plan */}
                          <div className="flex-1 py-3 px-3">
                            {isEditing ? (
                              <input
                                autoFocus={editingField === 'plan'}
                                value={draftPlan}
                                onChange={e => setDraftPlan(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); }}
                                onBlur={commitEdit}
                                onClick={e => e.stopPropagation()}
                                className="w-full bg-transparent outline-none text-sm font-light"
                                style={{ color: 'rgba(255,255,255,0.72)' }}
                                placeholder="What's the plan?"
                              />
                            ) : (
                              <button onClick={() => startEdit(slot, 'plan')} className="w-full text-left">
                                {slot.plan ? (
                                  <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                                    {slot.plan}
                                  </p>
                                ) : (
                                  <p className="text-[12px] font-light" style={{ color: 'rgba(255,255,255,0.14)' }}>
                                    tap to plan
                                  </p>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Delete (shown on grip tap) */}
                          <AnimatePresence>
                            {isDeleting && (
                              <motion.button
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 48 }}
                                exit={{ opacity: 0, width: 0 }}
                                onClick={() => deleteSlot(slot.id)}
                                className="flex-none flex items-center justify-center"
                                style={{ background: 'rgba(255,60,60,0.12)', color: 'rgba(255,100,100,0.70)' }}
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Add new slot form */}
              <AnimatePresence>
                {addingNew && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-3 rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <div className="px-4 pt-4 pb-2 space-y-3">
                      <div>
                        <p className="text-[9px] font-light tracking-[0.25em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Time / Label
                        </p>
                        <input
                          autoFocus
                          value={newLabel}
                          onChange={e => setNewLabel(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addSlot()}
                          placeholder="e.g. 9:00 AM · Morning run · After gym"
                          className="w-full bg-transparent outline-none text-sm font-light"
                          style={{ color: 'rgba(255,255,255,0.70)' }}
                        />
                      </div>
                      <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div>
                        <p className="text-[9px] font-light tracking-[0.25em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          Plan <span style={{ color: 'rgba(255,255,255,0.14)' }}>(optional)</span>
                        </p>
                        <input
                          value={newPlan}
                          onChange={e => setNewPlan(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addSlot()}
                          placeholder="What's happening?"
                          className="w-full bg-transparent outline-none text-sm font-light"
                          style={{ color: 'rgba(255,255,255,0.70)' }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <button
                        onClick={() => { setAddingNew(false); setNewLabel(""); setNewPlan(""); }}
                        className="flex-1 py-3 text-sm font-light"
                        style={{ color: 'rgba(255,255,255,0.28)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addSlot}
                        className="flex-1 py-3 text-sm font-light flex items-center justify-center gap-1.5"
                        style={{ color: 'rgba(255,255,255,0.60)' }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add slot button */}
              {!addingNew && (
                <motion.button
                  layout
                  onClick={() => setAddingNew(true)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px dashed rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.28)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-light">Add time slot</span>
                </motion.button>
              )}

              <div className="h-10" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

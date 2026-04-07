import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { PlannerSlot, TodoItem, useLauncherStore } from '@/hooks/useLauncherStore';

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function todayLabel() {
  return new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// ───────────── Daily Planner Sheet ────────────────────
function DailyPlannerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { state, setPlannerSlots } = useLauncherStore();
  const today = todayKey();
  const slots: PlannerSlot[] = state.plannerSlots[today] ?? [];

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState('');

  const addSlot = () => {
    if (!newLabel.trim()) return;
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const next = [...slots, { id, label: newLabel.trim(), plan: newPlan.trim() }];
    setPlannerSlots(today, next);
    setNewLabel('');
    setNewPlan('');
    setAdding(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteSlot = (id: string) => {
    setPlannerSlots(today, slots.filter(s => s.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const savePlan = (id: string) => {
    setPlannerSlots(today, slots.map(s => s.id === id ? { ...s, plan: editPlan } : s));
    setEditingId(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[plannerStyles.container, { paddingTop: insets.top || 24 }]}>

        {/* Header */}
        <View style={plannerStyles.header}>
          <View>
            <Text style={plannerStyles.title}>Daily Plan</Text>
            <Text style={plannerStyles.subtitle}>{todayLabel()}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={plannerStyles.closeBtn}>
            <Feather name="x" size={16} color="rgba(255,255,255,0.38)" />
          </TouchableOpacity>
        </View>

        <View style={plannerStyles.divider} />

        <ScrollView style={plannerStyles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">

          {slots.length === 0 && !adding && (
            <View style={plannerStyles.empty}>
              <Text style={plannerStyles.emptyText}>No time slots yet</Text>
              <Text style={plannerStyles.emptyHint}>Tap + to add your own slots — morning, gym, calls…</Text>
            </View>
          )}

          {slots.map(slot => (
            <View key={slot.id} style={plannerStyles.slotRow}>
              <View style={plannerStyles.slotLabel}>
                <Text style={plannerStyles.labelText}>{slot.label}</Text>
              </View>
              <View style={plannerStyles.slotPlan}>
                {editingId === slot.id ? (
                  <TextInput
                    autoFocus
                    value={editPlan}
                    onChangeText={setEditPlan}
                    onBlur={() => savePlan(slot.id)}
                    onSubmitEditing={() => savePlan(slot.id)}
                    style={plannerStyles.planInput}
                    placeholder="What's the plan?"
                    placeholderTextColor="rgba(255,255,255,0.18)"
                  />
                ) : (
                  <TouchableOpacity onPress={() => { setEditingId(slot.id); setEditPlan(slot.plan); }} style={{ flex: 1 }}>
                    <Text style={slot.plan ? plannerStyles.planText : plannerStyles.planPlaceholder}>
                      {slot.plan || 'tap to add plan'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => deleteSlot(slot.id)} style={plannerStyles.deleteBtn}>
                <Feather name="x" size={12} color="rgba(255,80,80,0.55)" />
              </TouchableOpacity>
            </View>
          ))}

          {adding && (
            <View style={plannerStyles.addForm}>
              <TextInput
                autoFocus
                value={newLabel}
                onChangeText={setNewLabel}
                style={plannerStyles.addInput}
                placeholder="Time / label  e.g. 9 AM · After gym"
                placeholderTextColor="rgba(255,255,255,0.20)"
              />
              <View style={plannerStyles.addDivider} />
              <TextInput
                value={newPlan}
                onChangeText={setNewPlan}
                style={plannerStyles.addInput}
                placeholder="Plan (optional)"
                placeholderTextColor="rgba(255,255,255,0.20)"
                onSubmitEditing={addSlot}
              />
              <View style={plannerStyles.addActions}>
                <TouchableOpacity onPress={() => { setAdding(false); setNewLabel(''); setNewPlan(''); }} style={plannerStyles.addCancel}>
                  <Text style={plannerStyles.addCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addSlot} style={plannerStyles.addConfirm}>
                  <Feather name="check" size={14} color="rgba(255,255,255,0.60)" />
                  <Text style={plannerStyles.addConfirmText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!adding && (
            <TouchableOpacity onPress={() => setAdding(true)} style={plannerStyles.addSlotBtn}>
              <Feather name="plus" size={14} color="rgba(255,255,255,0.28)" />
              <Text style={plannerStyles.addSlotText}>Add time slot</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const plannerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingBottom: 16 },
  title: { color: 'rgba(255,255,255,0.72)', fontSize: 20, fontWeight: '200' as const, letterSpacing: 0.3 },
  subtitle: { color: 'rgba(255,255,255,0.28)', fontSize: 11, fontWeight: '300' as const, marginTop: 2 },
  closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 24 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: 'rgba(255,255,255,0.20)', fontSize: 14, fontWeight: '300' as const },
  emptyHint: { color: 'rgba(255,255,255,0.12)', fontSize: 12, fontWeight: '300' as const, textAlign: 'center', paddingHorizontal: 32 },
  slotRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  slotLabel: { width: 88, padding: 12, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)' },
  labelText: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '300' as const },
  slotPlan: { flex: 1, padding: 12 },
  planText: { color: 'rgba(255,255,255,0.60)', fontSize: 13, fontWeight: '300' as const },
  planPlaceholder: { color: 'rgba(255,255,255,0.16)', fontSize: 13, fontWeight: '300' as const },
  planInput: { color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: '300' as const, padding: 0 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 16 },
  addForm: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', overflow: 'hidden', marginBottom: 12 },
  addInput: { color: 'rgba(255,255,255,0.70)', fontSize: 14, fontWeight: '300' as const, padding: 14 },
  addDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  addActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  addCancel: { flex: 1, alignItems: 'center', padding: 12, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)' },
  addCancelText: { color: 'rgba(255,255,255,0.28)', fontSize: 14, fontWeight: '300' as const },
  addConfirm: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  addConfirmText: { color: 'rgba(255,255,255,0.60)', fontSize: 14, fontWeight: '300' as const },
  addSlotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed' as const, borderColor: 'rgba(255,255,255,0.10)', marginTop: 4 },
  addSlotText: { color: 'rgba(255,255,255,0.28)', fontSize: 14, fontWeight: '300' as const },
});

// ───────────── Focus Panel ─────────────────────────────
export function FocusPanel() {
  const insets = useSafeAreaInsets();
  const { state, addTodo, toggleTodo, deleteTodo, setQuickNote } = useLauncherStore();
  const [newTodo, setNewTodo] = useState('');
  const [showPlanner, setShowPlanner] = useState(false);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.dateLabel}>{todayLabel()}</Text>
        <Text style={styles.todayTitle}>Today</Text>

        {/* Daily Plan button */}
        <TouchableOpacity
          style={styles.plannerBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPlanner(true); }}
          activeOpacity={0.65}
        >
          <Feather name="calendar" size={15} color="rgba(255,255,255,0.32)" />
          <Text style={styles.plannerBtnText}>Daily Plan</Text>
          <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.20)" />
        </TouchableOpacity>

        {/* Todos */}
        <Text style={styles.sectionLabel}>To Do</Text>
        <View style={styles.todoInput}>
          <TextInput
            style={styles.todoInputText}
            placeholder="Add a task..."
            placeholderTextColor={colors.placeholderText}
            value={newTodo}
            onChangeText={setNewTodo}
            onSubmitEditing={() => {
              if (newTodo.trim()) { addTodo(newTodo.trim()); setNewTodo(''); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
            }}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={() => {
              if (newTodo.trim()) { addTodo(newTodo.trim()); setNewTodo(''); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
            }}
          >
            <Feather name="plus" size={18} color="rgba(255,255,255,0.30)" />
          </TouchableOpacity>
        </View>

        <View style={styles.todoList}>
          {state.todos.map((todo: TodoItem) => (
            <View key={todo.id} style={styles.todoRow}>
              <TouchableOpacity
                onPress={() => { toggleTodo(todo.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.todoCheck, todo.done && styles.todoCheckDone]}
              >
                {todo.done && <Feather name="check" size={11} color="rgba(255,255,255,0.55)" />}
              </TouchableOpacity>
              <Text style={[styles.todoText, todo.done && styles.todoTextDone]} numberOfLines={2}>
                {todo.text}
              </Text>
              <TouchableOpacity onPress={() => deleteTodo(todo.id)} style={styles.todoDelete}>
                <Feather name="x" size={13} color="rgba(255,255,255,0.18)" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Quick Note */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Quick Note</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Jot something down..."
          placeholderTextColor={colors.placeholderText}
          value={state.quickNote}
          onChangeText={setQuickNote}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </ScrollView>

      <DailyPlannerSheet visible={showPlanner} onClose={() => setShowPlanner(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 4 },
  dateLabel: { color: colors.mutedText, fontSize: 10, fontWeight: '300' as const, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  todayTitle: { color: 'rgba(255,255,255,0.60)', fontSize: 28, fontWeight: '200' as const, letterSpacing: 0.3, marginBottom: 20 },
  plannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    marginBottom: 20,
  },
  plannerBtnText: { flex: 1, color: 'rgba(255,255,255,0.50)', fontSize: 14, fontWeight: '300' as const },
  sectionLabel: { color: colors.mutedText, fontSize: 10, fontWeight: '300' as const, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  todoInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, height: 46,
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginBottom: 8,
  },
  todoInputText: { flex: 1, color: 'rgba(255,255,255,0.62)', fontSize: 14, fontWeight: '300' as const },
  todoList: { gap: 2 },
  todoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  },
  todoCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  todoCheckDone: { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.22)' },
  todoText: { flex: 1, color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: '300' as const },
  todoTextDone: { color: 'rgba(255,255,255,0.22)', textDecorationLine: 'line-through' },
  todoDelete: { padding: 4 },
  noteInput: {
    color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: '300' as const,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 100,
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  },
});

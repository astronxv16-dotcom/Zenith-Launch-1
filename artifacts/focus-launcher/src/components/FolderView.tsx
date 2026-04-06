import { useState, useRef } from "react";
import { FolderData, AppData, useLauncherStore } from "@/hooks/useLauncherStore";
import { AppItem } from "./AppItem";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Pencil, Check } from "lucide-react";

interface FolderViewProps {
  folder: FolderData;
  apps: AppData[];
}

export function FolderView({ folder, apps }: FolderViewProps) {
  const { renameFolder } = useLauncherStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setIsEditing(true), 600);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const saveRename = () => {
    if (editName.trim()) renameFolder(folder.id, editName.trim());
    setIsEditing(false);
  };

  return (
    <div className="mb-1">
      <div className="flex items-center px-5 py-3.5">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={saveRename}
              onKeyDown={e => e.key === 'Enter' && saveRename()}
              className="flex-1 bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm font-light text-white/70 outline-none"
            />
            <button onClick={saveRename} className="p-2 rounded-full bg-white/8">
              <Check className="w-4 h-4 text-white/50" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onContextMenu={e => { e.preventDefault(); setIsEditing(true); setEditName(folder.name); }}
              className="flex-1 flex items-center gap-2 text-lg font-light text-white/55 hover:text-white/70 transition-colors"
              data-testid={`folder-${folder.id}`}
            >
              {isOpen ? <ChevronDown className="w-4 h-4 opacity-30" /> : <ChevronRight className="w-4 h-4 opacity-30" />}
              {folder.name}
            </button>
            <button onClick={() => { setIsEditing(true); setEditName(folder.name); }}
              className="p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <Pencil className="w-3.5 h-3.5 text-white/25" />
            </button>
          </>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              marginLeft: '12px',
              marginRight: '12px',
              marginBottom: '6px',
            }}
          >
            {apps.length === 0
              ? <p className="text-center py-4 text-xs text-white/20 font-light">Empty folder</p>
              : apps.map(app => <AppItem key={app.id} app={app} isFolderItem />)
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

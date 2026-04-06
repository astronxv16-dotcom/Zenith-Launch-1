import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppData, useLauncherStore } from "@/hooks/useLauncherStore";
import { useToast } from "@/hooks/use-toast";
import { Lock, ChevronRight, X, FolderPlus } from "lucide-react";

interface AppItemProps {
  app: AppData;
  isFolderItem?: boolean;
}

const menuStyle: React.CSSProperties = {
  background: 'rgba(20,22,30,0.95)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
};

const sheetStyle: React.CSSProperties = {
  background: 'rgba(14,16,22,0.96)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px 24px 0 0',
};

export function AppItem({ app, isFolderItem = false }: AppItemProps) {
  const { state, updateApp, toggleFavorite, moveAppToFolder, updateState } = useLauncherStore();
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLaunch = () => {
    if (showMenu || showFolderPicker) return;
    if (app.isBlocked) { toast({ title: "App blocked", description: "Stay focused." }); return; }
    toast({ title: `Opening ${app.name}...` });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const openFolderPicker = () => {
    setShowMenu(false);
    setTimeout(() => setShowFolderPicker(true), 80);
  };

  const assignFolder = (folderId: string | null) => {
    moveAppToFolder(app.id, folderId);
    setShowFolderPicker(false);
    toast({ title: folderId ? `Moved to folder` : `Removed from folder` });
  };

  const createAndAssign = () => {
    if (!newFolderName.trim()) return;
    const id = `folder-${Date.now()}`;
    updateState(prev => ({
      ...prev,
      folders: [...prev.folders, { id, name: newFolderName.trim() }],
      apps: prev.apps.map(a => a.id === app.id ? { ...a, folderId: id } : a),
    }));
    setNewFolderName("");
    setShowNewFolder(false);
    setShowFolderPicker(false);
    toast({ title: `Moved to "${newFolderName.trim()}"` });
  };

  return (
    <div className="relative">
      <button
        onClick={handleLaunch}
        onContextMenu={e => { e.preventDefault(); setShowMenu(true); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`w-full text-left rounded-xl transition-colors active:bg-white/5 ${isFolderItem ? 'py-3 px-8' : 'py-3.5 px-5'}`}
        data-testid={`app-item-${app.id}`}
      >
        <div className="flex items-center justify-between">
          <span className={`font-light tracking-wide ${app.isBlocked ? 'text-white/20' : 'text-white/60'} ${isFolderItem ? 'text-base' : 'text-lg'}`}>
            {app.name}
          </span>
          <div className="flex items-center gap-2">
            {app.isHidden && <span className="text-[10px] text-white/20 font-light px-2 py-0.5 rounded-full border border-white/10">hidden</span>}
            {app.isBlocked && <Lock className="w-3.5 h-3.5 text-white/20" />}
          </div>
        </div>
      </button>

      {/* Context menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.14 }}
              className="absolute z-50 left-4 right-4"
              style={{ ...menuStyle, top: '100%', marginTop: 4 }}
            >
              <p className="px-4 pt-3 pb-1 text-[11px] font-medium text-white/30 tracking-widest uppercase">{app.name}</p>
              <div className="py-1">
                <MenuRow onClick={() => { toggleFavorite(app.id); setShowMenu(false); }}
                  label={app.isFavorite ? "Remove from Favorites" : "Add to Favorites"} />
                <MenuRow onClick={openFolderPicker} label="Add to Folder" icon={<ChevronRight className="w-4 h-4 opacity-30" />} />
                <MenuRow onClick={() => { updateApp(app.id, { isBlocked: !app.isBlocked }); setShowMenu(false); }}
                  label={app.isBlocked ? "Unblock App" : "Block App"} />
                <div className="mx-4 border-t border-white/6 my-1" />
                <MenuRow onClick={() => { updateApp(app.id, { isHidden: !app.isHidden }); setShowMenu(false); }}
                  label={app.isHidden ? "Unhide App" : "Hide App"}
                  subtle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Folder picker sheet */}
      <AnimatePresence>
        {showFolderPicker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => { setShowFolderPicker(false); setShowNewFolder(false); }} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-5"
              style={{
                ...sheetStyle,
                maxHeight: '75dvh',
                overflowY: 'auto',
                paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
              }}
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-base font-light text-white/65">Move to Folder</p>
                  <p className="text-xs text-white/30 font-light mt-0.5">{app.name}</p>
                </div>
                <button onClick={() => { setShowFolderPicker(false); setShowNewFolder(false); }}
                  className="p-2 rounded-full bg-white/6">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Remove from folder */}
              {app.folderId && (
                <button onClick={() => assignFolder(null)}
                  className="w-full text-left px-4 py-3.5 rounded-xl bg-white/5 border border-white/8 text-sm font-light text-white/45 mb-2 active:bg-white/8">
                  Remove from folder
                </button>
              )}

              {/* Existing folders */}
              {state.folders.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 font-light mb-2 px-1">Folders</p>
                  <div className="space-y-1.5">
                    {state.folders.map(folder => (
                      <button key={folder.id} onClick={() => assignFolder(folder.id)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-light transition-colors active:bg-white/10 ${app.folderId === folder.id ? 'bg-white/10 border border-white/15 text-white/70' : 'bg-white/5 border border-white/7 text-white/50'}`}>
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* New folder inline */}
              {showNewFolder ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createAndAssign()}
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-light text-white/65 placeholder:text-white/22 outline-none bg-white/6 border border-white/8"
                  />
                  <button onClick={createAndAssign} className="px-4 py-3 rounded-xl bg-white/10 text-sm font-medium text-white/60">
                    Create
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowNewFolder(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/4 border border-dashed border-white/12 text-sm font-light text-white/38 mt-1 active:bg-white/8">
                  <FolderPlus className="w-4 h-4" />
                  New folder
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuRow({ onClick, label, icon, subtle = false }: { onClick: () => void; label: string; icon?: React.ReactNode; subtle?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 text-sm font-light active:bg-white/6 rounded-xl transition-colors"
      style={{ color: subtle ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.60)' }}>
      <span>{label}</span>
      {icon}
    </button>
  );
}

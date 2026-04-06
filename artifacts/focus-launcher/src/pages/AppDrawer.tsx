import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FolderPlus, Settings } from "lucide-react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { AppItem } from "@/components/AppItem";
import { FolderView } from "@/components/FolderView";
import { SettingsModal } from "@/components/SettingsModal";
import { WallpaperPicker } from "@/components/WallpaperPicker";

interface AppDrawerProps {
  onModalChange?: (open: boolean) => void;
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '50%',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const searchStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
};

const sheetStyle: React.CSSProperties = {
  background: 'rgba(12,14,20,0.94)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '24px 24px 0 0',
  maxHeight: '60dvh',
  overflowY: 'auto',
  paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
};

export function AppDrawer({ onModalChange }: AppDrawerProps) {
  const { state, updateState } = useLauncherStore();
  const [search, setSearch] = useState("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);

  const setModal = (open: boolean) => {
    onModalChange?.(open);
    if (!open) { setShowSettings(false); setShowWallpaper(false); setShowCreateFolder(false); }
  };

  // App drawer never shows hidden apps — they're managed in Settings
  const visibleApps = useMemo(() => {
    let apps = state.apps.filter(a => !a.isHidden);
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(a => a.name.toLowerCase().includes(q));
    }
    return apps.sort((a, b) => a.name.localeCompare(b.name));
  }, [state.apps, search]);

  const freeApps = visibleApps.filter(a => !a.folderId);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    updateState(prev => ({ ...prev, folders: [...prev.folders, { id: `folder-${Date.now()}`, name: newFolderName.trim() }] }));
    setNewFolderName("");
    setModal(false);
  };

  return (
    <div className="w-full h-full flex flex-col" data-testid="app-drawer">
      {/* Header */}
      <div className="pt-14 px-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extralight tracking-wide text-white/60">Apps</h2>
          <div className="flex gap-2">
            <button onClick={() => { setShowCreateFolder(true); onModalChange?.(true); }} style={iconBtn} data-testid="btn-create-folder">
              <FolderPlus className="w-4 h-4 text-white/40" />
            </button>
            <button onClick={() => { setShowSettings(true); onModalChange?.(true); }} style={iconBtn} data-testid="btn-drawer-settings">
              <Settings className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="search" placeholder="Search apps..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={searchStyle}
            className="w-full pl-10 pr-10 py-3 text-sm font-light text-white/65 placeholder:text-white/20 outline-none bg-transparent"
            data-testid="input-search-apps"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-white/25" />
            </button>
          )}
        </div>
      </div>

      {/* App list */}
      <div className="flex-1 overflow-y-auto pb-12 px-2">
        {!search && state.folders.map(folder => {
          const folderApps = state.apps.filter(a => a.folderId === folder.id && !a.isHidden);
          return <FolderView key={folder.id} folder={folder} apps={folderApps} />;
        })}

        {freeApps.length === 0 && search && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-sm text-white/20 font-light">
            No apps found
          </motion.div>
        )}

        {freeApps.map((app, i) => (
          <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.012 }}>
            <AppItem app={app} />
          </motion.div>
        ))}
      </div>

      {/* Create folder sheet */}
      <AnimatePresence>
        {showCreateFolder && (
          <div onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40" onClick={() => setModal(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-6"
              style={sheetStyle}
            >
              <h3 className="text-base font-light text-white/65 mb-4">New Folder</h3>
              <input
                type="text" placeholder="Folder name"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createFolder()}
                className="w-full rounded-xl px-4 py-3 text-sm font-light text-white/65 placeholder:text-white/22 outline-none mb-4 bg-white/6 border border-white/8"
                data-testid="input-folder-name"
              />
              <div className="flex gap-3">
                <button onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl text-sm font-light text-white/35 bg-white/4">Cancel</button>
                <button onClick={createFolder} className="flex-1 py-3 rounded-xl bg-white/10 text-sm font-medium text-white/60">Create</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings (with the height fix) */}
      {showSettings && (
        <div onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setModal(false)}
            onOpenWallpaper={() => { setShowSettings(false); setShowWallpaper(true); }}
          />
        </div>
      )}

      {/* Wallpaper */}
      {showWallpaper && (
        <div onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <WallpaperPicker isOpen={showWallpaper} onClose={() => setModal(false)} />
        </div>
      )}
    </div>
  );
}

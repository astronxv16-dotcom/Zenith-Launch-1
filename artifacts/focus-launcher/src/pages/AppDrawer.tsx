import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Eye, EyeOff, FolderPlus } from "lucide-react";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { AppItem } from "@/components/AppItem";
import { FolderView } from "@/components/FolderView";

export function AppDrawer() {
  const { state, updateState } = useLauncherStore();
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const visibleApps = useMemo(() => {
    let apps = state.apps;
    if (!showHidden) apps = apps.filter(a => !a.isHidden);
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(a => a.name.toLowerCase().includes(q));
    }
    return apps.sort((a, b) => a.name.localeCompare(b.name));
  }, [state.apps, showHidden, search]);

  const freeApps = visibleApps.filter(a => !a.folderId);
  const folders = state.folders;

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const folder = { id: `folder-${Date.now()}`, name: newFolderName.trim() };
    updateState(prev => ({ ...prev, folders: [...prev.folders, folder] }));
    setNewFolderName("");
    setShowCreateFolder(false);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #f0f4ff 100%)' }} data-testid="app-drawer">
      {/* Header */}
      <div className="pt-14 px-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extralight tracking-wide opacity-70">Apps</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHidden(!showHidden)}
              className="p-2 rounded-full glass-panel"
              data-testid="btn-toggle-hidden"
              title={showHidden ? "Hide hidden apps" : "Show hidden apps"}
            >
              {showHidden ? <Eye className="w-4 h-4 opacity-50" /> : <EyeOff className="w-4 h-4 opacity-50" />}
            </button>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="p-2 rounded-full glass-panel"
              data-testid="btn-create-folder"
            >
              <FolderPlus className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input
            type="search"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl pl-10 pr-10 py-3 text-sm font-light placeholder:opacity-40 outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            data-testid="input-search-apps"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2" data-testid="btn-clear-search">
              <X className="w-4 h-4 opacity-30" />
            </button>
          )}
        </div>
      </div>

      {/* App list */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Folders */}
        {!search && folders.map(folder => {
          const folderApps = state.apps.filter(a => a.folderId === folder.id && (!a.isHidden || showHidden));
          return (
            <FolderView key={folder.id} folder={folder} apps={folderApps} />
          );
        })}

        {/* Free apps */}
        {freeApps.length === 0 && search && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 opacity-40 text-sm font-light"
          >
            No apps found
          </motion.div>
        )}
        {freeApps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <AppItem app={app} />
          </motion.div>
        ))}
      </div>

      {/* Create folder dialog */}
      <AnimatePresence>
        {showCreateFolder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
              onClick={() => setShowCreateFolder(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-3xl p-6 pb-12"
            >
              <h3 className="text-lg font-light mb-4 opacity-70">New Folder</h3>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                autoFocus
                className="w-full bg-white/50 border border-white/60 rounded-2xl px-4 py-3 text-sm font-light placeholder:opacity-40 outline-none focus:ring-2 focus:ring-purple-200 mb-4"
                data-testid="input-folder-name"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateFolder(false)}
                  className="flex-1 py-3 rounded-2xl border border-black/10 text-sm font-light opacity-60"
                  data-testid="btn-cancel-folder"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  className="flex-1 py-3 rounded-2xl bg-purple-100 text-sm font-medium text-purple-700"
                  data-testid="btn-confirm-folder"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

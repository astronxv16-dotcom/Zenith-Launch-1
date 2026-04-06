import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppData, useLauncherStore } from "@/hooks/useLauncherStore";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

interface AppItemProps {
  app: AppData;
  isFolderItem?: boolean;
}

export function AppItem({ app, isFolderItem = false }: AppItemProps) {
  const { updateApp, toggleFavorite } = useLauncherStore();
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const timerRef = { current: 0 };

  const handleLaunch = () => {
    if (app.isBlocked) {
      toast({ title: "App is blocked", description: "Stay focused." });
      return;
    }
    toast({ title: `Opening ${app.name}...` });
  };

  const handleTouchStart = () => {
    timerRef.current = window.setTimeout(() => setShowMenu(true), 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(timerRef.current);
  };

  return (
    <div className="relative">
      <button
        onClick={handleLaunch}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full text-left active:bg-white/5 rounded-xl transition-colors ${isFolderItem ? 'py-3 px-8' : 'py-3.5 px-5'}`}
        data-testid={`app-item-${app.id}`}
      >
        <div className="flex items-center justify-between">
          <span className={`font-light tracking-wide ${app.isBlocked ? 'text-white/20' : 'text-white/60'} ${isFolderItem ? 'text-base' : 'text-lg'}`}>
            {app.name}
          </span>
          <div className="flex items-center gap-2">
            {app.isHidden && (
              <span className="text-[10px] text-white/20 font-light px-2 py-0.5 rounded-full border border-white/10">hidden</span>
            )}
            {app.isBlocked && <Lock className="w-3.5 h-3.5 text-white/20" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-10 left-5 right-5 glass-panel rounded-2xl py-1 shadow-2xl"
            >
              <MenuAction
                onClick={() => { toggleFavorite(app.id); setShowMenu(false); }}
                label={app.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              />
              <MenuAction
                onClick={() => { updateApp(app.id, { isBlocked: !app.isBlocked }); setShowMenu(false); }}
                label={app.isBlocked ? "Unblock App" : "Block App"}
              />
              <MenuAction
                onClick={() => { updateApp(app.id, { isHidden: !app.isHidden }); setShowMenu(false); }}
                label={app.isHidden ? "Show App" : "Hide App"}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuAction({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 text-sm font-light text-white/60 hover:bg-white/6 rounded-xl transition-colors"
    >
      {label}
    </button>
  );
}

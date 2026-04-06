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
  const { updateApp, toggleFavorite, state } = useLauncherStore();
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);

  const handleLaunch = () => {
    if (app.isBlocked) {
      toast({ title: "App is blocked", description: "Take a breath.", variant: "destructive" });
      return;
    }
    toast({ title: `Opening ${app.name}...` });
  };

  const handleLongPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  return (
    <div className="relative">
      <button
        onClick={handleLaunch}
        onContextMenu={handleLongPress}
        onTouchStart={(e) => {
          const timer = setTimeout(() => setShowMenu(true), 500);
          e.currentTarget.dataset.timer = timer.toString();
        }}
        onTouchEnd={(e) => {
          clearTimeout(Number(e.currentTarget.dataset.timer));
        }}
        className={`w-full text-left py-4 px-6 active:scale-[0.98] transition-transform ${isFolderItem ? 'pl-10 text-lg opacity-80' : 'text-xl'}`}
        data-testid={`app-item-${app.id}`}
      >
        <div className="flex items-center justify-between">
          <span className={`font-light tracking-wide ${app.isBlocked ? 'opacity-40' : ''}`}>
            {app.name}
          </span>
          {app.isBlocked && <Lock className="w-4 h-4 opacity-30" />}
        </div>
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/5"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute z-50 top-12 left-6 right-6 glass-panel rounded-2xl p-2 shadow-lg flex flex-col"
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
      className="text-left px-4 py-3 text-sm hover:bg-black/5 rounded-xl transition-colors"
    >
      {label}
    </button>
  );
}

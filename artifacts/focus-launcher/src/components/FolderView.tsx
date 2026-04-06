import { useState } from "react";
import { FolderData, AppData } from "@/hooks/useLauncherStore";
import { AppItem } from "./AppItem";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";

interface FolderViewProps {
  folder: FolderData;
  apps: AppData[];
}

export function FolderView({ folder, apps }: FolderViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3.5 px-5 text-lg font-light text-white/55 hover:bg-white/4 rounded-xl transition-colors active:scale-[0.98]"
        data-testid={`folder-${folder.id}`}
      >
        <span>{folder.name}</span>
        {isOpen
          ? <ChevronDown className="w-4 h-4 opacity-30" />
          : <ChevronRight className="w-4 h-4 opacity-30" />
        }
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden glass-panel-light rounded-2xl mx-4 mb-2"
          >
            {apps.map(app => (
              <AppItem key={app.id} app={app} isFolderItem />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-6 text-xl font-light active:scale-[0.98] transition-transform"
        data-testid={`folder-${folder.id}`}
      >
        <span>{folder.name}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 opacity-40" />
        ) : (
          <ChevronRight className="w-5 h-5 opacity-40" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-black/5 rounded-2xl mx-4 mb-2"
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

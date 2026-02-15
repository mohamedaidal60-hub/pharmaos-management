import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const ActionModal = ({ isOpen, onClose, title, children }: ActionModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ActionModal;

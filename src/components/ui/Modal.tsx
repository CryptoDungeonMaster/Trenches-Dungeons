"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { modalBackdrop, modalContent } from "@/lib/motion";
import Panel from "./Panel";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with torch flicker effect */}
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-abyss/90 backdrop-blur-sm"
            aria-hidden="true"
          >
            {/* Torch glow effect */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/5 blur-3xl animate-torch-flicker" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blood/5 blur-3xl animate-torch-flicker" style={{ animationDelay: "0.2s" }} />
          </motion.div>

          {/* Modal content */}
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            className={cn("relative z-10 w-full max-w-lg", className)}
          >
            <Panel variant="leather" className="p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-parchment/60 hover:text-parchment transition-colors rounded-full hover:bg-parchment/10"
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Title */}
              {title && (
                <h2
                  id="modal-title"
                  className="font-cinzel text-xl font-bold text-gold mb-4 pr-8"
                >
                  {title}
                </h2>
              )}

              {/* Content */}
              <div className="text-parchment-dark">{children}</div>
            </Panel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;

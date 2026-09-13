"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, CheckCircle2, X, BookOpen } from "lucide-react";

interface MemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  persistedMemory: string | null;
  isMemoryLoaded: boolean;
  isTier1: boolean;
  targetAsset: string;
}

export function MemoryPanel({
  isOpen,
  onClose,
  persistedMemory,
  isMemoryLoaded,
  isTier1,
  targetAsset,
}: MemoryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.12 }}
          className="absolute top-4 right-4 z-20 w-[380px] max-w-[calc(100%-2rem)] rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800 bg-zinc-950">
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-blue-400" />
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                DPO Memory Context
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 flex flex-col gap-3 text-xs font-mono">
            {/* Active Rule */}
            <div
              className={`p-3 rounded-lg border flex flex-col gap-1 ${
                isMemoryLoaded
                  ? "bg-blue-950/30 border-blue-800/40 text-blue-200"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-1 uppercase font-semibold text-blue-400">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  {isMemoryLoaded ? "Memory Active (RART)" : "Standby"}
                </span>
                <span>ID: DPO-88</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-200">
                {persistedMemory || "No active rule loaded. Activates during RART mutation."}
              </p>
            </div>

            {/* Asset Criticality */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Asset</span>
                <span className="text-zinc-300 font-medium truncate block">{targetAsset}</span>
              </div>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Tier</span>
                <span className={isTier1 ? "text-amber-400 font-bold" : "text-zinc-400"}>
                  {isTier1 ? "Tier 1 (SLA Critical)" : "Tier 2"}
                </span>
              </div>
            </div>

            {/* Persisted Directives */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] uppercase text-zinc-500 font-semibold flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-zinc-500" /> Directives
              </span>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-300 leading-normal">
                <strong className="text-zinc-200 block">SLA Protection:</strong>
                Avoids full host isolation on Tier 1; enforces targeted WAF/API revocation.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

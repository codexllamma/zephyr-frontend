"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogEntry } from "@/types/simulation";
import { Terminal, ShieldAlert, Check, Copy, ArrowDown } from "lucide-react";

interface LogTerminalProps {
  logs: LogEntry[];
  isRunning: boolean;
}

export function LogTerminal({ logs, isRunning }: LogTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.time}] [${l.type.toUpperCase()}] ${l.content}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-88 max-w-full h-full bg-zinc-950 border-l border-zinc-800 flex flex-col shrink-0 select-text">
      {/* Header */}
      <div className="h-12 px-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            Logs
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {logs.length}
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoScroll((prev) => !prev)}
            title={autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
            className={`p-1 rounded text-xs ${
              autoScroll
                ? "text-blue-400 bg-blue-950/40 border border-blue-800/40"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy logs"
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs flex flex-col gap-2 bg-zinc-950">
        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 gap-1.5 my-auto">
            <Terminal className="w-6 h-6 opacity-30 text-zinc-600" />
            <p className="text-xs">No active logs</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, index) => {
              const isMalicious = log.type === "malicious";

              if (isMalicious) {
                return (
                  <motion.div
                    key={`${log.time}-${index}`}
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="relative p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 shadow-md shadow-red-950/20"
                  >
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-red-500/20 text-[10px]">
                      <span className="flex items-center gap-1 font-bold text-red-400 uppercase">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        Anomaly Caught
                      </span>
                      <span className="text-red-400/80 font-mono">{log.time}</span>
                    </div>
                    <p className="leading-relaxed font-mono text-[11px] text-red-100 break-all">
                      {log.content}
                    </p>
                  </motion.div>
                );
              }

              return (
                <div
                  key={`${log.time}-${index}`}
                  className="flex items-start gap-1.5 text-zinc-400 leading-relaxed font-mono text-[11px]"
                >
                  <span className="text-zinc-600 shrink-0 select-none">[{log.time}]</span>
                  <span className="text-zinc-500 break-words">{log.content}</span>
                </div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isRunning ? "bg-amber-400 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span>{isRunning ? "Streaming" : "Idle"}</span>
        </div>
        <span>JSON Lines</span>
      </div>
    </div>
  );
}

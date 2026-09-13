"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import {
  Cpu,
  ShieldCheck,
  Brain,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { GraphStep } from "@/types/simulation";

export interface CustomAgentNodeData {
  label: string;
  role: string;
  status: GraphStep["status"];
  decision?: string;
  duration_ms?: number;
  [key: string]: unknown;
}

export type CustomAgentNodeType = Node<CustomAgentNodeData, "agentNode">;

const STATUS_CONFIG = {
  idle: {
    border: "border-zinc-800",
    bg: "bg-zinc-900/90",
    text: "text-zinc-500",
    badgeBg: "bg-zinc-800/80 text-zinc-500 border-zinc-700/60",
    icon: <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />,
    label: "IDLE",
  },
  active: {
    border: "border-amber-500/70 ring-1 ring-amber-500/30",
    bg: "bg-zinc-900",
    text: "text-amber-300",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />,
    label: "PROCESSING",
  },
  approved: {
    border: "border-emerald-500/50",
    bg: "bg-zinc-900",
    text: "text-emerald-300",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
    label: "APPROVED",
  },
  failed: {
    border: "border-red-500/50",
    bg: "bg-zinc-900",
    text: "text-red-300",
    badgeBg: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: <XCircle className="w-3 h-3 text-red-400" />,
    label: "REJECTED",
  },
  mutated: {
    border: "border-blue-500/50 ring-1 ring-blue-500/20",
    bg: "bg-zinc-900",
    text: "text-blue-300",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: <Sparkles className="w-3 h-3 text-blue-400" />,
    label: "MUTATED",
  },
};

const NODE_ICONS: Record<string, React.ReactNode> = {
  orchestrator: <Cpu className="w-3.5 h-3.5 text-zinc-300" />,
  reviewer: <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />,
  rart: <Brain className="w-3.5 h-3.5 text-zinc-300" />,
};

function CustomAgentNodeComponent({ id, data }: NodeProps<CustomAgentNodeType>) {
  const { label, role, status = "idle", decision, duration_ms } = data;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const NodeIcon = NODE_ICONS[id.toLowerCase()] || <Cpu className="w-3.5 h-3.5 text-zinc-300" />;

  return (
    <div
      className={`w-80 rounded-xl border ${config.border} ${config.bg} p-3.5 text-left shadow-xs transition-all duration-200 relative`}
    >
      {/* Top Handle for Vertical Flow */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-zinc-500 !border-2 !border-zinc-950 !-top-1.5"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-zinc-800 border border-zinc-700/60">
            {NodeIcon}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
              {label}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono">{role}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${config.badgeBg}`}
        >
          {config.icon}
          <span>{config.label}</span>
        </div>
      </div>

      {/* Decision Output */}
      {decision ? (
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>DECISION</span>
            {duration_ms && <span>{duration_ms}ms</span>}
          </div>
          <div
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium truncate ${
              status === "failed"
                ? "bg-red-950/40 text-red-300 border border-red-800/50"
                : status === "approved"
                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/50"
                : status === "mutated"
                ? "bg-blue-950/40 text-blue-300 border border-blue-800/50"
                : "bg-zinc-800/60 text-zinc-300 border border-zinc-700/40"
            }`}
          >
            {decision}
          </div>
        </div>
      ) : (
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
          <span>STATUS</span>
          <span>{status === "active" ? "Processing..." : "Standby"}</span>
        </div>
      )}

      {/* Bottom Handle for Vertical Flow */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-zinc-500 !border-2 !border-zinc-950 !-bottom-1.5"
      />
    </div>
  );
}

export const CustomAgentNode = memo(CustomAgentNodeComponent);

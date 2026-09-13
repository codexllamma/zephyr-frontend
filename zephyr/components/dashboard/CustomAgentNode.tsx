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
  Database,
  Zap,
} from "lucide-react";

export interface CustomAgentNodeData {
  label: string;
  role: string;
  status: "idle" | "active" | "approved" | "failed" | "mutated";
  decision?: string;
  subInfo?: string;
  duration_ms?: number;
  [key: string]: unknown;
}

export type CustomAgentNodeType = Node<CustomAgentNodeData, "agentNode">;

const STATUS_CONFIG = {
  idle: {
    border: "border-zinc-800 hover:border-zinc-700",
    bg: "bg-zinc-950/90",
    text: "text-zinc-500",
    badgeBg: "bg-zinc-900 text-zinc-500 border-zinc-800",
    icon: <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />,
    label: "STANDBY",
    ring: "",
  },
  active: {
    border: "border-amber-500 ring-2 ring-amber-500/30",
    bg: "bg-zinc-900/95",
    text: "text-amber-300",
    badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/40",
    icon: <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />,
    label: "ACTIVE // DELIBERATING",
    ring: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
  },
  approved: {
    border: "border-emerald-500/60 ring-1 ring-emerald-500/20",
    bg: "bg-zinc-950/95",
    text: "text-emerald-300",
    badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    label: "APPROVED // VERIFIED",
    ring: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
  },
  failed: {
    border: "border-red-500/80 ring-2 ring-red-500/30",
    bg: "bg-zinc-950/95",
    text: "text-red-300",
    badgeBg: "bg-red-500/15 text-red-400 border-red-500/40",
    icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    label: "REJECTED // SLA TRIPWIRE",
    ring: "shadow-[0_0_25px_rgba(239,68,68,0.25)]",
  },
  mutated: {
    border: "border-blue-500/70 ring-2 ring-blue-500/30",
    bg: "bg-zinc-950/95",
    text: "text-blue-300",
    badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/40",
    icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
    label: "MUTATED // DPO ALIGNED",
    ring: "shadow-[0_0_25px_rgba(59,130,246,0.25)]",
  },
};

const NODE_ICONS: Record<string, React.ReactNode> = {
  intake: <Database className="w-4 h-4 text-blue-400" />,
  orchestrator: <Cpu className="w-4 h-4 text-purple-400" />,
  strategist: <Cpu className="w-4 h-4 text-purple-400" />,
  reviewer: <ShieldCheck className="w-4 h-4 text-amber-400" />,
  gate: <ShieldCheck className="w-4 h-4 text-amber-400" />,
  rart: <Brain className="w-4 h-4 text-blue-400" />,
  mutator: <Brain className="w-4 h-4 text-blue-400" />,
  executor: <Zap className="w-4 h-4 text-emerald-400" />,
  mcts: <Zap className="w-4 h-4 text-emerald-400" />,
};

function CustomAgentNodeComponent({ id, data }: NodeProps<CustomAgentNodeType>) {
  const { label, role, status = "idle", decision, subInfo } = data;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const NodeIcon = NODE_ICONS[id.toLowerCase()] || <Cpu className="w-4 h-4 text-zinc-300" />;

  return (
    <div
      className={`w-[320px] rounded-2xl border ${config.border} ${config.bg} p-4 text-left shadow-xl ${config.ring} transition-all duration-300 relative backdrop-blur-sm`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="opacity-0 !w-0 !h-0 !border-0 pointer-events-none"
      />
      {/* Left Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="opacity-0 !w-0 !h-0 !border-0 pointer-events-none"
      />
      {/* Right Target Handle */}
      <Handle
        type="target"
        position={Position.Right}
        id="target-right"
        className="opacity-0 !w-0 !h-0 !border-0 pointer-events-none"
      />

      {/* Node Header */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
            {NodeIcon}
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 font-mono tracking-wide">
              {label}
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{role}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border shrink-0 ${config.badgeBg}`}
        >
          {config.icon}
          <span>{config.label.split(" // ")[0]}</span>
        </div>
      </div>

      {/* Sub Info / Role Description */}
      {subInfo && (
        <div className="text-[11px] font-mono text-zinc-400 mt-2.5 leading-relaxed bg-zinc-900/40 p-2 rounded-lg border border-zinc-900">
          {subInfo}
        </div>
      )}

      {/* Decision / Live Output Badge */}
      {decision ? (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono font-medium">
            <span>LIVE OUTPUT & VERDICT</span>
            <span className="text-[9px] text-zinc-600 font-mono uppercase">
              {status}
            </span>
          </div>
          <div
            className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold break-words leading-relaxed ${
              status === "failed"
                ? "bg-red-950/40 text-red-200 border border-red-500/40"
                : status === "approved"
                ? "bg-emerald-950/40 text-emerald-200 border border-emerald-500/40"
                : status === "mutated"
                ? "bg-blue-950/40 text-blue-200 border border-blue-500/40"
                : "bg-zinc-900 text-zinc-200 border border-zinc-800"
            }`}
          >
            {decision}
          </div>
        </div>
      ) : (
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>PIPELINE STATE</span>
          <span className={status === "active" ? "text-amber-400 font-bold animate-pulse" : "text-zinc-600"}>
            {status === "active" ? "Processing Telemetry..." : "Standby"}
          </span>
        </div>
      )}

      {/* Right Source Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="opacity-0 !w-0 !h-0 !border-0 pointer-events-none"
      />
      {/* Left Source Handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        className="opacity-0 !w-0 !h-0 !border-0 pointer-events-none"
      />
      {/* Bottom Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="opacity-0 !w-0 !h-0 !border-0 pointer-events-none"
      />
    </div>
  );
}

export const CustomAgentNode = memo(CustomAgentNodeComponent);

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  ShieldCheck,
  Brain,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  Database,
  ShieldAlert,
} from "lucide-react";

export interface ExecutionFlowProps {
  activeStep: number;
  gateStatus: "evaluating" | "rejected" | "approved";
  isComplete: boolean;
}

const PIPELINE_STEPS = [
  {
    id: "intake",
    num: "1",
    label: "Context Assembly",
    sub: "Playbooks via pgvector",
    icon: <Database className="w-4 h-4" />,
  },
  {
    id: "strategist",
    num: "2",
    label: "Defense Agent",
    sub: "Llama 3.1 8B Zero-Shot",
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    id: "gate",
    num: "3",
    label: "Reviewer Gate",
    sub: "SLA & Blast Radius",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: "mutator",
    num: "4",
    label: "RART Mutator",
    sub: "DPO Alignment",
    icon: <Brain className="w-4 h-4" />,
  },
  {
    id: "mcts",
    num: "5",
    label: "Executor & Verifier",
    sub: "Fabric & Scoring",
    icon: <Zap className="w-4 h-4" />,
  },
];

export function ExecutionFlow({
  activeStep,
  gateStatus,
  isComplete,
}: ExecutionFlowProps) {
  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 z-10">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Agentic Execution Loop</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500">Gate Decision:</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
              gateStatus === "rejected"
                ? "bg-red-950/40 text-red-400 border-red-500/40"
                : gateStatus === "approved"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                : "bg-amber-950/40 text-amber-400 border-amber-500/40"
            }`}
          >
            {gateStatus === "rejected"
              ? "REJECTED ➔ RART LOOP"
              : gateStatus === "approved"
              ? "APPROVED ➔ EXECUTOR"
              : "EVALUATING SLA"}
          </span>
        </div>
      </div>

      {/* Main Node Map */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 md:gap-4 relative z-10">
        {PIPELINE_STEPS.map((step, index) => {
          const isActive = activeStep === index && !isComplete;
          const isPassed = activeStep > index || isComplete;

          let cardBorder = "border-zinc-800";
          let cardBg = "bg-zinc-950/90";
          let badgeBg = "bg-zinc-800 text-zinc-400 border-zinc-700";
          let glow = "";

          if (isActive) {
            if (index === 2 && gateStatus === "rejected") {
              cardBorder = "border-red-500 ring-1 ring-red-500/40";
              cardBg = "bg-red-950/20";
              badgeBg = "bg-red-500 text-white border-red-400";
              glow = "shadow-[0_0_20px_rgba(239,68,68,0.25)]";
            } else if (index === 2 && gateStatus === "approved") {
              cardBorder = "border-emerald-500 ring-1 ring-emerald-500/40";
              cardBg = "bg-emerald-950/20";
              badgeBg = "bg-emerald-500 text-white border-emerald-400";
              glow = "shadow-[0_0_20px_rgba(34,197,94,0.25)]";
            } else if (index === 3) {
              cardBorder = "border-amber-500 ring-1 ring-amber-500/40";
              cardBg = "bg-amber-950/20";
              badgeBg = "bg-amber-500 text-white border-amber-400";
              glow = "shadow-[0_0_20px_rgba(245,158,11,0.25)]";
            } else {
              cardBorder = "border-blue-500 ring-1 ring-blue-500/40";
              cardBg = "bg-blue-950/20";
              badgeBg = "bg-blue-500 text-white border-blue-400";
              glow = "shadow-[0_0_20px_rgba(59,130,246,0.25)]";
            }
          } else if (isPassed) {
            if (index === 2 && gateStatus === "rejected") {
              cardBorder = "border-red-500/50";
              cardBg = "bg-zinc-950";
              badgeBg = "bg-red-900/60 text-red-200 border-red-700";
            } else {
              cardBorder = "border-emerald-500/40";
              cardBg = "bg-zinc-950";
              badgeBg = "bg-emerald-900/60 text-emerald-200 border-emerald-700";
            }
          }

          return (
            <motion.div
              key={step.id}
              animate={{
                scale: isActive ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`rounded-xl border ${cardBorder} ${cardBg} p-3.5 flex flex-col justify-between gap-3 ${glow} transition-all duration-200 relative`}
            >
              {/* Top Node Indicator */}
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${badgeBg}`}
                >
                  {isPassed ? (
                    index === 2 && gateStatus === "rejected" ? (
                      <XCircle className="w-4 h-4 text-red-300" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    )
                  ) : (
                    step.num
                  )}
                </div>

                <div className="text-zinc-500">
                  {step.icon}
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h4
                  className={`text-xs font-bold font-mono uppercase tracking-wide leading-tight ${
                    isActive ? "text-zinc-100" : isPassed ? "text-zinc-200" : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  {step.sub}
                </p>
              </div>

              {/* Status footer pill */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[9px] font-mono">
                <span className="text-zinc-500">STATUS</span>
                <span
                  className={`font-semibold uppercase ${
                    isActive
                      ? "text-amber-400 animate-pulse"
                      : isPassed
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  {isActive ? "ACTIVE" : isPassed ? "DONE" : "IDLE"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decision-Making Architecture Flow Map */}
      <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2.5 z-10 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-2 font-bold uppercase tracking-wide">
          <span>Execution Loop Decision Architecture</span>
          <span className="text-zinc-500">Tier 1 Safety Guardrail</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          {/* Branch 1: Rejection & Mutation Loop */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              gateStatus === "rejected" || activeStep === 3
                ? "bg-red-950/20 border-red-500/40 text-red-200 shadow-sm"
                : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="text-red-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Branch [NO] ➔ RART Mutation Loop
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-300">
                SLA Tripwire
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-zinc-300">
              Reviewer flags broad <code className="text-red-300">BLOCK_SOURCE</code> as availability SLA breach on Tier 1 $\rightarrow$ Routes to <strong>RART Mutator</strong> to generate surgical <code className="text-emerald-300">TARGETED_RULE</code>.
            </p>
          </div>

          {/* Branch 2: Approved Execution */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              gateStatus === "approved" || activeStep === 4 || isComplete
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200 shadow-sm"
                : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Branch [YES] ➔ Executor & Verifier
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300">
                Production Safe
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-zinc-300">
              Reviewer verifies <code className="text-emerald-300">TARGETED_RULE</code> passes safety checks $\rightarrow$ Routes to <strong>Executor</strong> to apply rule and verify network stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

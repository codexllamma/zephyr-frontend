"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useIncidentStream } from "@/hooks/useIncidentStream";
import { FlowCanvas } from "@/components/dashboard/FlowCanvas";
import { LogTerminal } from "@/components/dashboard/LogTerminal";
import { Shield, Server, ArrowLeft, Activity } from "lucide-react";
import { AttackScenario, GraphStep } from "@/types/simulation";
import scenariosData from "@/data/scenarios.json";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get("scenario") || "INC-001";

  const scenarios = (scenariosData.scenarios as AttackScenario[]) || [];
  const selectedScenario =
    scenarios.find((s) => s.id === scenarioId) || scenarios[0];

  const {
    activeNodeId,
    nodeStates,
    logs,
    persistedMemory,
    isStreaming,
    triggerIncident,
    abortStream,
    isLive,
    setIsLive,
  } = useIncidentStream("live");

  // Auto-start incident triage when landing on dashboard
  useEffect(() => {
    triggerIncident(selectedScenario.id);
  }, [selectedScenario.id, triggerIncident]);

  const nodeStatuses: Record<string, GraphStep["status"]> = {
    orchestrator:
      (nodeStates.orchestrator?.status as GraphStep["status"]) || "idle",
    reviewer: (nodeStates.reviewer?.status as GraphStep["status"]) || "idle",
    rart: (nodeStates.rart?.status as GraphStep["status"]) || "idle",
  };

  const nodeDecisions: Record<string, string | undefined> = {
    orchestrator: nodeStates.orchestrator?.decision,
    reviewer: nodeStates.reviewer?.decision,
    rart: nodeStates.rart?.decision,
  };

  const isComplete =
    !isStreaming &&
    Object.values(nodeStates).some(
      (s) =>
        s.status === "approved" ||
        s.status === "failed" ||
        s.status === "mutated"
    );

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans flex flex-col select-none">
      {/* Top Enterprise Navigation Bar */}
      <header className="h-12 px-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand, Back Button & Incident Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              abortStream();
              router.push("/");
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Attack</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <h1 className="text-xs font-bold tracking-wider text-zinc-100 font-mono uppercase">
              ZephyrGuard
            </h1>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono font-semibold text-zinc-300">
              {selectedScenario.id}
            </span>
            <span className="text-zinc-600">-</span>
            <span className="text-xs font-mono text-zinc-400 truncate max-w-[220px]">
              {selectedScenario.title}
            </span>
          </div>
        </div>

        {/* Right: Target Asset & Status */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden md:flex items-center gap-2 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            <Server className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-500">Asset:</span>
            <span className="text-zinc-200 font-medium">{selectedScenario.target_ip}</span>
            {selectedScenario.is_tier_1 && (
              <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold border border-amber-500/30">
                TIER 1
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStreaming
                  ? "bg-amber-400 animate-pulse"
                  : isComplete
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-zinc-300 font-medium text-[11px]">
              {isStreaming ? "PROCESSING" : isComplete ? "RESOLVED" : "STANDBY"}
            </span>
          </div>
        </div>
      </header>

      {/* Main 2-Column Agentic Sandbox Layout (Without Left Strike Panel) */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        {/* 1. CENTER: Vertical React Flow Pipeline Sandbox */}
        <FlowCanvas
          scenario={selectedScenario}
          activeNodeId={activeNodeId}
          nodeStatuses={nodeStatuses}
          nodeDecisions={nodeDecisions}
          persistedMemory={persistedMemory}
          isMemoryLoaded={!!persistedMemory}
          isRunning={isStreaming}
          isComplete={isComplete}
        />

        {/* 2. RIGHT: Live Log Terminal */}
        <LogTerminal logs={logs} isRunning={isStreaming} />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-zinc-950 text-zinc-400 flex items-center justify-center font-mono text-xs">
          Loading Autonomous SOC Agent...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

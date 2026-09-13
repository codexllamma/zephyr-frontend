"use client";

import React from "react";
import { useAgentStream } from "@/hooks/useAgentStream";
import { StrikePanel } from "@/components/dashboard/StrikePanel";
import { FlowCanvas } from "@/components/dashboard/FlowCanvas";
import { LogTerminal } from "@/components/dashboard/LogTerminal";
import { Shield, Server } from "lucide-react";

export default function DashboardPage() {
  const {
    scenarios,
    selectedScenario,
    selectScenario,
    mode,
    setMode,
    isRunning,
    isComplete,
    activeNodeId,
    nodeStatuses,
    nodeDecisions,
    currentLogs,
    persistedMemory,
    isMemoryLoaded,
    startSimulation,
    stopSimulation,
    resetSimulation,
  } = useAgentStream("INC-001");

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans flex flex-col select-none">
      {/* Top Enterprise Bar */}
      <header className="h-12 px-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand & Incident Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
            </div> */}
            <h1 className="text-lg font-bold tracking-wider text-zinc-100 font-mono">
              ZephyrGuard
            </h1>
          </div>

          {/* <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500 pl-3 border-l border-zinc-800">
            <span className="text-zinc-300 font-semibold">{selectedScenario.id}</span>
            <span>-</span>
            <span className="text-zinc-400 truncate max-w-[240px]">
              {selectedScenario.title}
            </span>
          </div>*/}
        </div> 

        {/* Right: Machine & Pipeline Status */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden md:flex items-center gap-2 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            <Server className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-500">Machine:</span>
            <span className="text-zinc-200 font-medium">{selectedScenario.target_ip}</span>
            {/* {selectedScenario.is_tier_1 && (
              <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold border border-amber-500/30">
                TIER 1
              </span>
            )} */}
          </div>

          {/* <div className="flex items-center gap-2 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRunning
                  ? "bg-amber-400 animate-pulse"
                  : isComplete
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-zinc-300 font-medium text-[11px]">
              {isRunning ? "PROCESSING" : isComplete ? "RESOLVED" : "STANDBY"}
            </span>
          </div> */}
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        {/* 1. LEFT: Scenarios Controls */}
        <StrikePanel
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={selectScenario}
          onStartSimulation={startSimulation}
          onResetSimulation={resetSimulation}
          isRunning={isRunning}
          isComplete={isComplete}
          mode={mode}
          onToggleMode={setMode}
        />

        {/* 2. CENTER: Vertical React Flow Pipeline Sandbox */}
        <FlowCanvas
          scenario={selectedScenario}
          activeNodeId={activeNodeId}
          nodeStatuses={nodeStatuses}
          nodeDecisions={nodeDecisions}
          persistedMemory={persistedMemory}
          isMemoryLoaded={isMemoryLoaded}
          isRunning={isRunning}
          isComplete={isComplete}
        />

        {/* 3. RIGHT: Live Log Terminal */}
        <LogTerminal logs={currentLogs} isRunning={isRunning} />
      </main>
    </div>
  );
}

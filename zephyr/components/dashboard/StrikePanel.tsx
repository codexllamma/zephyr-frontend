"use client";

import React from "react";
import { AttackScenario } from "@/types/simulation";
import {
  Play,
  RotateCcw,
  Server,
  Network,
  Radio,
  Layers,
} from "lucide-react";

interface StrikePanelProps {
  scenarios: AttackScenario[];
  selectedScenario: AttackScenario;
  onSelectScenario: (scenario: AttackScenario) => void;
  onStartSimulation: () => void;
  onResetSimulation: () => void;
  isRunning: boolean;
  isComplete: boolean;
  mode: "mock" | "sse";
  onToggleMode: (mode: "mock" | "sse") => void;
}

export function StrikePanel({
  scenarios,
  selectedScenario,
  onSelectScenario,
  onStartSimulation,
  onResetSimulation,
  isRunning,
  isComplete,
  mode,
  onToggleMode,
}: StrikePanelProps) {
  return (
    <div className="w-72 max-w-full h-full bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="h-12 px-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            NIDS/SCUDA Alerts
          </h2>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
          {scenarios.length}
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="p-2.5 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-zinc-500" /> Source:
        </span>
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-[10px] font-mono">
          <button
            onClick={() => onToggleMode("mock")}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              mode === "mock"
                ? "bg-zinc-800 text-zinc-200 font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Mock
          </button>
          <button
            onClick={() => onToggleMode("sse")}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              mode === "sse"
                ? "bg-blue-900/60 text-blue-200 font-semibold border border-blue-700/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            SSE
          </button>
        </div>
      </div>

      {/* Scenario List */}
      <div className="flex-1 p-2.5 overflow-y-auto flex flex-col gap-2">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenario.id;

          return (
            <div
              key={scenario.id}
              onClick={() => {
                if (!isRunning) {
                  onSelectScenario(scenario);
                }
              }}
              className={`p-3 rounded-lg border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? "bg-zinc-900 border-zinc-700 shadow-xs"
                  : "bg-zinc-950 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-zinc-700/60"
              } ${isRunning ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {/* Meta row */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[11px] font-semibold text-zinc-300">
                  {scenario.id}
                </span>
                {scenario.is_tier_1 ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    TIER 1
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                    TIER 2
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xs font-medium text-zinc-100 mb-1.5 leading-snug">
                {scenario.title}
              </h3>

              {/* Asset & IP */}
              <div className="flex flex-col gap-0.5 text-[10px] font-mono text-zinc-400 pt-1.5 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 truncate">
                  <Server className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-300 truncate">{scenario.target_asset}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Network className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-400">{scenario.target_ip}</span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-500 rounded-r" />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Trigger Buttons */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-2">
        <button
          onClick={onStartSimulation}
          disabled={isRunning}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
            isRunning
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          {isRunning ? "Running..." : "Run Simulation"}
        </button>

        <button
          onClick={onResetSimulation}
          disabled={isRunning}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
}

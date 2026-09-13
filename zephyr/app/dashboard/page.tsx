"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTelemetryStream } from "@/hooks/useTelemetryStream";
import { FlowCanvas } from "@/components/dashboard/FlowCanvas";
import { EvolutionArtifacts } from "@/components/dashboard/EvolutionArtifacts";
import {
  Shield,
  Server,
  ArrowLeft,
  Terminal,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get("scenario") || "INC-001";

  const {
    telemetry,
    activeStep,
    gateStatus,
    visibleLogs,
    isComplete,
    isPlaying,
    replay,
  } = useTelemetryStream(scenarioId);

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  const incidentId = telemetry?.incident_id || scenarioId;
  const targetIp = telemetry?.target_ip || "10.0.1.15";
  const alertSignature =
    telemetry?.alert_signature || "ET EXPLOIT Apache log4j RCE Attempt";

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col select-none overflow-x-hidden">
      {/* Top Enterprise Navigation Bar */}
      <header className="h-14 px-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0 z-30 sticky top-0 backdrop-blur-md bg-zinc-950/90">
        {/* Left: Brand, Back Button & Incident Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Attack</span>
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
            <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h1 className="text-xs font-bold tracking-wider text-zinc-100 font-mono uppercase">
              ZephyrGuard
            </h1>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono font-semibold text-zinc-300">
              {incidentId}
            </span>
            <span className="text-zinc-600">-</span>
            <span className="text-xs font-mono text-zinc-400 truncate max-w-[280px]">
              {alertSignature}
            </span>
          </div>
        </div>

        {/* Right: Target Asset & Pipeline Status */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden md:flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Target:</span>
            <span className="text-zinc-200 font-medium">{targetIp}</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold border border-amber-500/30">
              TIER 1
            </span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying
                  ? "bg-amber-400 animate-pulse"
                  : isComplete
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-zinc-300 font-medium text-[11px]">
              {isPlaying ? "PIPELINE ACTIVE" : isComplete ? "ALIGNED & COMPLETE" : "STANDBY"}
            </span>
          </div>

          {isComplete && (
            <button
              onClick={replay}
              title="Replay Telemetry Execution"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-6 items-stretch">
        {/* Side-by-Side Top Section: Flow Canvas (Left) & Telemetry Terminal (Right) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: React Flow Execution Canvas */}
          <div className="lg:col-span-7 xl:col-span-8 h-[660px] flex flex-col">
            <FlowCanvas
              activeStep={activeStep}
              gateStatus={gateStatus}
              isComplete={isComplete}
              telemetry={telemetry}
            />
          </div>

          {/* Right Column: Live Telemetry Terminal Readout */}
          <div className="lg:col-span-5 xl:col-span-4 h-[660px] flex flex-col">
            <div className="bg-[#050505] border border-zinc-800 rounded-3xl p-5 font-mono text-xs shadow-2xl flex flex-col h-full select-text">
              {/* Terminal Header */}
              <div className="text-zinc-400 border-b border-zinc-800 pb-3 mb-3 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate text-[11px] font-bold tracking-wide">
                    AGENT_LOG // {incidentId}
                  </span>
                </div>
                <span className="flex items-center gap-2 shrink-0">
                  {isComplete ? (
                    <span className="text-[10px] text-emerald-400 tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40">
                      COMPLETED
                    </span>
                  ) : (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span className="text-[10px] text-blue-400 tracking-widest font-bold">
                        LIVE STREAM
                      </span>
                    </>
                  )}
                </span>
              </div>

              {/* Log Message Feed */}
              <div
                ref={logContainerRef}
                className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                {visibleLogs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 gap-2">
                    <Terminal className="w-8 h-8 opacity-30 text-zinc-600" />
                    <p className="text-xs">Initializing agentic pipeline...</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {visibleLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex gap-2.5 leading-relaxed break-words text-[11px] ${log.color}`}
                      >
                        <span className="shrink-0 opacity-40 select-none">❯</span>
                        <span className="whitespace-pre-wrap">{log.text}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Terminal Footer */}
              <div className="pt-2.5 mt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
                <span>Telemetry: pgvector + Llama 3.1</span>
                <span>Events: {visibleLogs.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Section: Autonomic Adaptation & Evolution Artifacts */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <EvolutionArtifacts telemetry={telemetry} />
            </motion.div>
          )}
        </AnimatePresence>
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

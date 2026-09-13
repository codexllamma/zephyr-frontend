"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomAgentNode, CustomAgentNodeType } from "./CustomAgentNode";
import { MemoryPanel } from "./MemoryPanel";
import { GraphStep, AttackScenario } from "@/types/simulation";
import { Brain, Layers, Cpu, Sparkles } from "lucide-react";

interface FlowCanvasProps {
  scenario: AttackScenario;
  activeNodeId: string | null;
  nodeStatuses: Record<string, GraphStep["status"]>;
  nodeDecisions: Record<string, string | undefined>;
  persistedMemory: string | null;
  isMemoryLoaded: boolean;
  isRunning: boolean;
  isComplete: boolean;
}

const nodeTypes = {
  agentNode: CustomAgentNode,
};

// Node coordinate map for smooth focus panning (width: 320, height: 110)
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  orchestrator: { x: 140, y: 50 },
  reviewer: { x: 140, y: 240 },
  rart: { x: 140, y: 430 },
};

function FlowCanvasInner({
  scenario,
  activeNodeId,
  nodeStatuses,
  nodeDecisions,
  persistedMemory,
  isMemoryLoaded,
  isRunning,
  isComplete,
}: FlowCanvasProps) {
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const { setCenter, fitView } = useReactFlow();

  // Smoothly bring the active node into the viewport as it is processed
  useEffect(() => {
    if (activeNodeId && NODE_COORDINATES[activeNodeId]) {
      const coords = NODE_COORDINATES[activeNodeId];
      // Center of node is x + 160, y + 60
      setCenter(coords.x + 160, coords.y + 60, {
        zoom: 1.0,
        duration: 400,
      });
    } else if (!isRunning && isComplete) {
      // Fit all 3 nodes on completion
      fitView({ duration: 500, padding: 0.2 });
    }
  }, [activeNodeId, isRunning, isComplete, setCenter, fitView]);

  // Construct Vertical React Flow Nodes
  const nodes: CustomAgentNodeType[] = useMemo(() => {
    return [
      {
        id: "orchestrator",
        type: "agentNode",
        position: NODE_COORDINATES.orchestrator,
        data: {
          label: "1. Orchestrator",
          role: "Triage & Hypothesis",
          status: nodeStatuses.orchestrator || "idle",
          decision: nodeDecisions.orchestrator,
        },
      },
      {
        id: "reviewer",
        type: "agentNode",
        position: NODE_COORDINATES.reviewer,
        data: {
          label: "2. Reviewer",
          role: "SLA & Guardrail Check",
          status: nodeStatuses.reviewer || "idle",
          decision: nodeDecisions.reviewer,
        },
      },
      {
        id: "rart",
        type: "agentNode",
        position: NODE_COORDINATES.rart,
        data: {
          label: "3. RART",
          role: "DPO Alignment",
          status: nodeStatuses.rart || "idle",
          decision: nodeDecisions.rart,
        },
      },
    ];
  }, [nodeStatuses, nodeDecisions]);

  // Construct Vertical Top-to-Bottom Edges
  const edges: Edge[] = useMemo(() => {
    return [
      {
        id: "e-orch-rev",
        source: "orchestrator",
        target: "reviewer",
        animated: activeNodeId === "orchestrator" || nodeStatuses.orchestrator === "active",
        type: "smoothstep",
        style: {
          stroke:
            nodeStatuses.reviewer !== "idle"
              ? "#10b981"
              : activeNodeId === "orchestrator"
              ? "#f59e0b"
              : "#3f3f46",
          strokeWidth: 2,
        },
      },
      {
        id: "e-rev-rart",
        source: "reviewer",
        target: "rart",
        animated: activeNodeId === "reviewer" || nodeStatuses.reviewer === "active",
        type: "smoothstep",
        style: {
          stroke:
            nodeStatuses.rart !== "idle"
              ? "#3b82f6"
              : activeNodeId === "reviewer"
              ? "#f59e0b"
              : "#3f3f46",
          strokeWidth: 2,
        },
      },
    ];
  }, [activeNodeId, nodeStatuses]);

  return (
    <div className="relative flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden select-none">
      {/* Canvas Header */}
      <div className="h-12 px-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sanboxed Agent</span>
            {/* <span className="text-zinc-600">/</span> */}
            {/* <span className="text-zinc-400 font-normal">{scenario.id}</span> */}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono pl-3 border-l border-zinc-800">
            {/* <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRunning
                  ? "bg-amber-400 animate-pulse"
                  : isComplete
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }`}
            /> */}
            {/* <span className="text-zinc-400">
              {isRunning
                ? activeNodeId || "Processing"
                : isComplete
                ? "Complete"
                : "Idle"}
            </span> */}
          </div>
        </div>

        {/* Memory Toggle Button (Manual click only) */}
        <button
          onClick={() => setIsMemoryOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
            isMemoryOpen
              ? "bg-blue-950/40 border-blue-500/50 text-blue-300"
              : isMemoryLoaded
              ? "bg-zinc-900 border-blue-500/40 text-blue-400 hover:bg-zinc-800"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>DPO Memory</span>
          {isMemoryLoaded && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          )}
        </button>
      </div>

      {/* React Flow Viewport */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 80, y: 30, zoom: 0.95 }}
          minZoom={0.4}
          maxZoom={1.5}
          panOnScroll={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.2}
            color="#27272a"
          />
          <Controls className="!bg-zinc-900 !border-zinc-800 !text-zinc-300 [&>button]:!border-zinc-800 [&>button]:!bg-zinc-900 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-800 !bottom-4 !left-4" />
        </ReactFlow>

        {/* Memory Slide-Out Panel */}
        <MemoryPanel
          isOpen={isMemoryOpen}
          onClose={() => setIsMemoryOpen(false)}
          persistedMemory={persistedMemory}
          isMemoryLoaded={isMemoryLoaded}
          isTier1={scenario.is_tier_1}
          targetAsset={scenario.target_asset}
        />
      </div>
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

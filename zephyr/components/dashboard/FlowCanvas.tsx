"use client";

import React, { useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomAgentNode, CustomAgentNodeType } from "./CustomAgentNode";
import { Layers } from "lucide-react";

export interface FlowCanvasProps {
  activeStep: number;
  gateStatus: "evaluating" | "rejected" | "approved";
  isComplete: boolean;
  telemetry: any;
}

const nodeTypes = {
  agentNode: CustomAgentNode,
};

const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  intake: { x: 80, y: 40 },
  strategist: { x: 80, y: 320 },
  gate: { x: 80, y: 620 },
  mutator: { x: 620, y: 620 },
  executor: { x: 80, y: 980 },
};

function FlowCanvasInner({
  activeStep,
  gateStatus,
  isComplete,
  telemetry,
}: FlowCanvasProps) {
  const { setCenter, fitView } = useReactFlow();

  // Smooth camera tracking as the active nodes light up down the pipeline
  useEffect(() => {
    if (isComplete) {
      fitView({ duration: 900, padding: 0.15 });
      return;
    }

    const stepCenters: Record<number, { x: number; y: number; zoom: number }> = {
      0: { x: 240, y: 140, zoom: 0.95 },
      1: { x: 240, y: 420, zoom: 0.95 },
      2: { x: 420, y: 720, zoom: 0.88 },
      3: { x: 780, y: 720, zoom: 0.88 },
      4: { x: 240, y: 1080, zoom: 0.95 },
    };

    const target = stepCenters[activeStep];
    if (target) {
      setCenter(target.x, target.y, {
        zoom: target.zoom,
        duration: 700,
      });
    }
  }, [activeStep, isComplete, setCenter, fitView]);

  // Construct the 5-node Execution Loop graph with generous spatial separation
  const nodes: CustomAgentNodeType[] = useMemo(() => {
    const isStep0 = activeStep === 0 && !isComplete;
    const isStep1 = activeStep === 1 && !isComplete;
    const isStep2 = activeStep === 2 && !isComplete;
    const isStep3 = activeStep === 3 && !isComplete;
    const isStep4 = (activeStep === 4 && !isComplete) || isComplete;

    const hasPassedStep0 = activeStep > 0 || isComplete;
    const hasPassedStep1 = activeStep > 1 || isComplete;
    const hasPassedStep2 = activeStep > 2 || isComplete;
    const hasPassedStep3 = activeStep > 3 || isComplete;

    return [
      {
        id: "intake",
        type: "agentNode",
        position: NODE_COORDINATES.intake,
        draggable: false,
        selectable: false,
        data: {
          label: "1. Context Assembly",
          role: "Ingress & Vector RAG",
          subInfo: "Pulling playbooks via pgvector...",
          status: isStep0 ? "active" : hasPassedStep0 ? "approved" : "idle",
          decision: hasPassedStep0 ? "Playbook Loaded: CVE-2021-44228" : undefined,
        },
      },
      {
        id: "strategist",
        type: "agentNode",
        position: NODE_COORDINATES.strategist,
        draggable: false,
        selectable: false,
        data: {
          label: "2. Defense Agent",
          role: "Llama 3.1 8B Strategist",
          subInfo: "Zero-shot policy generation...",
          status: isStep1 ? "active" : hasPassedStep1 ? "approved" : "idle",
          decision:
            hasPassedStep1 || isStep1
              ? "Proposing: BLOCK_SOURCE (Standard SOP)"
              : undefined,
        },
      },
      {
        id: "gate",
        type: "agentNode",
        position: NODE_COORDINATES.gate,
        draggable: false,
        selectable: false,
        data: {
          label: "3. Reviewer Gate",
          role: "SLA & Blast Radius Simulation",
          subInfo: "Evaluating Action x Asset Tier SLA...",
          status:
            isStep2
              ? gateStatus === "rejected"
                ? "failed"
                : gateStatus === "approved"
                ? "approved"
                : "active"
              : hasPassedStep2
              ? gateStatus === "rejected"
                ? "failed"
                : "approved"
              : "idle",
          decision:
            gateStatus === "rejected"
              ? "[NO / REJECTED] Tier 1 SLA Tripwire: 100% Downtime"
              : gateStatus === "approved" || isStep4
              ? "[YES / APPROVED] Zero Downtime + Exploit Neutralized"
              : isStep2
              ? "Simulating impact on Cloudflare Edge (Tier 1)..."
              : undefined,
        },
      },
      {
        id: "mutator",
        type: "agentNode",
        position: NODE_COORDINATES.mutator,
        draggable: false,
        selectable: false,
        data: {
          label: "4. RART Mutator",
          role: "DPO Alignment Engine",
          subInfo: "Synthesizing fine-grained SLA rules...",
          status:
            isStep3
              ? "active"
              : hasPassedStep3
              ? "mutated"
              : gateStatus === "rejected"
              ? "active"
              : "idle",
          decision:
            hasPassedStep3 || isStep3
              ? "Synthesized: TARGETED_RULE (API Revocation)"
              : undefined,
        },
      },
      {
        id: "executor",
        type: "agentNode",
        position: NODE_COORDINATES.executor,
        draggable: false,
        selectable: false,
        data: {
          label: "5. Executor & Verifier",
          role: "Network Fabric & Judge Scorecard",
          subInfo: "Applying policy & scoring verifier...",
          status: isStep4 ? "approved" : "idle",
          decision: isStep4
            ? "[SUCCESS] Fabric Updated & Verified (100/100)"
            : undefined,
        },
      },
    ];
  }, [activeStep, gateStatus, isComplete]);

  // Clean Non-Intersecting Branching Edges
  const edges: Edge[] = useMemo(() => {
    return [
      // 1. Intake -> Strategist (Straight down)
      {
        id: "e-intake-strat",
        source: "intake",
        target: "strategist",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        animated: activeStep === 0,
        type: "smoothstep",
        style: {
          stroke: activeStep >= 1 || isComplete ? "#10b981" : "#3f3f46",
          strokeWidth: activeStep === 0 ? 2.5 : 2,
        },
      },
      // 2. Strategist -> Reviewer Gate (Straight down)
      {
        id: "e-strat-gate",
        source: "strategist",
        target: "gate",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        animated: activeStep === 1,
        type: "smoothstep",
        style: {
          stroke: activeStep >= 2 || isComplete ? "#10b981" : "#3f3f46",
          strokeWidth: activeStep === 1 ? 2.5 : 2,
        },
      },
      // 3. IF [NO / REJECTED]: Reviewer Gate -> RART Mutator (Horizontal branch to the right)
      {
        id: "e-gate-mutator",
        source: "gate",
        target: "mutator",
        sourceHandle: "source-right",
        targetHandle: "target-left",
        label: "[IF NO] SLA REJECTED",
        labelStyle: { fill: "#fca5a5", fontSize: 10, fontFamily: "monospace", fontWeight: 800 },
        labelBgStyle: { fill: "#450a0a", fillOpacity: 0.95, stroke: "#ef4444", strokeWidth: 1.5 },
        labelBgPadding: [6, 8],
        labelBgBorderRadius: 6,
        animated: gateStatus === "rejected" || activeStep === 3,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" },
        style: {
          stroke: gateStatus === "rejected" || activeStep >= 3 ? "#ef4444" : "#27272a",
          strokeWidth: gateStatus === "rejected" || activeStep === 3 ? 3 : 1.5,
        },
      },
      // 4. RART Mutator -> Executor (Mutated route down on right side into Executor right)
      {
        id: "e-mutator-exec",
        source: "mutator",
        target: "executor",
        sourceHandle: "source-bottom",
        targetHandle: "target-right",
        label: "ALIGNED POLICY (DPO)",
        labelStyle: { fill: "#93c5fd", fontSize: 10, fontFamily: "monospace", fontWeight: 800 },
        labelBgStyle: { fill: "#172554", fillOpacity: 0.95, stroke: "#3b82f6", strokeWidth: 1.5 },
        labelBgPadding: [6, 8],
        labelBgBorderRadius: 6,
        animated: activeStep === 3,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
        style: {
          stroke: activeStep >= 3 || isComplete ? "#3b82f6" : "#27272a",
          strokeWidth: activeStep === 3 ? 3 : 1.5,
        },
      },
      // 5. IF [YES / APPROVED]: Reviewer Gate -> Executor (Straight down into Executor top)
      {
        id: "e-gate-exec",
        source: "gate",
        target: "executor",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        label: "[IF YES] SLA APPROVED",
        labelStyle: { fill: "#86efac", fontSize: 10, fontFamily: "monospace", fontWeight: 800 },
        labelBgStyle: { fill: "#052e16", fillOpacity: 0.95, stroke: "#22c55e", strokeWidth: 1.5 },
        labelBgPadding: [6, 8],
        labelBgBorderRadius: 6,
        animated: gateStatus === "approved" || activeStep === 4,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" },
        style: {
          stroke: gateStatus === "approved" || activeStep >= 4 || isComplete ? "#22c55e" : "#27272a",
          strokeWidth: gateStatus === "approved" || isComplete ? 3 : 1.5,
        },
      },
    ];
  }, [activeStep, gateStatus, isComplete]);

  return (
    <div className="w-full h-full min-h-[720px] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col select-none">
      {/* Canvas Top Bar */}
      <div className="h-14 px-5 border-b border-zinc-800 bg-zinc-950/95 flex items-center justify-between z-10 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wide text-zinc-100">
              Agentic Execution Loop Canvas
            </h2>
            {/* <p className="text-[10px] text-zinc-500 font-mono">
              Live Decision-Making Architecture & Autonomous Safety Guardrail
            </p> */}
          </div>
        </div>

        {/* Dynamic Real-Time Decision Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 hidden sm:inline">Active Branch:</span>
          {gateStatus === "rejected" || activeStep === 3 ? (
            <span className="px-3 py-1 rounded-lg text-[11px] font-bold border uppercase bg-red-950/60 text-red-300 border-red-500/50 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>[NO] SLA Breached ➔ RART Mutation Loop</span>
            </span>
          ) : gateStatus === "approved" || activeStep === 4 || isComplete ? (
            <span className="px-3 py-1 rounded-lg text-[11px] font-bold border uppercase bg-emerald-950/60 text-emerald-300 border-emerald-500/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>[YES] SLA Approved ➔ Executor Activated</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-[11px] font-bold border uppercase bg-zinc-900 text-zinc-400 border-zinc-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Evaluating Simulation...</span>
            </span>
          )}
        </div>
      </div>

      {/* React Flow Viewport */}
      <div className="flex-1 w-full h-full relative bg-zinc-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 15, y: 15, zoom: 0.76 }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={true}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="#27272a"
          />
          <Controls className="!bg-zinc-900 !border-zinc-800 !text-zinc-300 [&>button]:!border-zinc-800 [&>button]:!bg-zinc-900 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-800 !bottom-5 !left-5" />
        </ReactFlow>
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

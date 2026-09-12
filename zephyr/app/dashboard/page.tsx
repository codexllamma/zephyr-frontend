"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
} from "@xyflow/react";
import {
  Terminal,
  ShieldAlert,
  CheckCircle,
  Database,
  Play,
  Activity,
  Code2,
  Award,
  Layers,
} from "lucide-react";
import "@xyflow/react/dist/style.css";

// Interface for Custom Node Data matching LangGraph Payload
interface AgentNodeData {
  label: string;
  reasoning: string;
  isActive: boolean;
  confidence: number;
  badge?: string;
  subInfo?: string;
  [key: string]: unknown;
}

type AgentNodeType = Node<AgentNodeData, "agentNode">;

// Custom Node Component with 4 Connection Handles & Large Readable Text
function AgentNode({ data }: NodeProps<AgentNodeType>) {
  const { label, reasoning, isActive, confidence, badge } = data;

  const confPercent = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);

  return (
    <div
      className={`w-[360px] max-w-full rounded-2xl bg-slate-800 border p-4 shadow-xl transition-all duration-300 text-left relative ${
        isActive
          ? "border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.45)] ring-2 ring-blue-500/80 border-t-4 border-t-blue-400"
          : "border-slate-700 border-t-2 border-t-slate-600 hover:border-slate-600"
      }`}
    >
      {/* Target Handles */}
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900"
      />
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-bold text-white text-sm tracking-wide uppercase flex items-center gap-2">
          {isActive ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-slate-600 inline-block"></span>
          )}
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold border border-slate-600">
              {badge}
            </span>
          )}
          {confPercent > 0 && (
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                confPercent >= 80
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : confPercent >= 40
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
              }`}
            >
              {confPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Reasoning text body */}
      <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-sm font-mono leading-relaxed min-h-[66px] flex items-center">
        {reasoning ? (
          <p className="text-slate-100 font-medium">{reasoning}</p>
        ) : (
          <p className="text-slate-500 italic">Waiting for agent dispatch...</p>
        )}
      </div>

      {/* Confidence progress bar */}
      {confPercent > 0 && (
        <div className="mt-3 w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/60">
          <div
            className={`h-full transition-all duration-500 ${
              confPercent >= 80
                ? "bg-red-500"
                : confPercent >= 40
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${confPercent}%` }}
          />
        </div>
      )}

      {/* Source Handles */}
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900"
      />
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-slate-900"
      />
    </div>
  );
}

const nodeTypes = {
  agentNode: AgentNode,
};

// 3x3 Grid on Laptop / 1-Column Vertical on Mobile
const getLayout = (isMobile: boolean) => {
  if (isMobile) {
    const nodes: AgentNodeType[] = [
      { id: "intake", type: "agentNode", position: { x: 20, y: 20 }, data: { label: "1. Intake", reasoning: "", isActive: false, confidence: 0, badge: "NIDS" } },
      { id: "investigator", type: "agentNode", position: { x: 20, y: 220 }, data: { label: "2. Investigator", reasoning: "", isActive: false, confidence: 0, badge: "Hypotheses" } },
      { id: "evidence", type: "agentNode", position: { x: 20, y: 420 }, data: { label: "3. Evidence & Tools", reasoning: "", isActive: false, confidence: 0, badge: "Tool Calls" } },
      { id: "assessment", type: "agentNode", position: { x: 20, y: 620 }, data: { label: "4. Assessment", reasoning: "", isActive: false, confidence: 0, badge: "Verdict" } },
      { id: "reviewer", type: "agentNode", position: { x: 20, y: 820 }, data: { label: "5. Reviewer", reasoning: "", isActive: false, confidence: 0, badge: "Guardrails" } },
      { id: "executor", type: "agentNode", position: { x: 20, y: 1020 }, data: { label: "6. Executor", reasoning: "", isActive: false, confidence: 0, badge: "Action" } },
      { id: "verification", type: "agentNode", position: { x: 20, y: 1220 }, data: { label: "7. Verification", reasoning: "", isActive: false, confidence: 0, badge: "Validation" } },
      { id: "judge", type: "agentNode", position: { x: 20, y: 1420 }, data: { label: "8. Judge Scorecard", reasoning: "", isActive: false, confidence: 0, badge: "Eval" } },
      { id: "rart", type: "agentNode", position: { x: 20, y: 1620 }, data: { label: "9. Strategy & RART", reasoning: "", isActive: false, confidence: 0, badge: "Learning" } },
    ];

    const edges: Edge[] = [
      { id: "e1", source: "intake", target: "investigator", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e2", source: "investigator", target: "evidence", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e3", source: "evidence", target: "assessment", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e4", source: "assessment", target: "reviewer", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e5", source: "reviewer", target: "executor", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e6", source: "executor", target: "verification", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e7", source: "verification", target: "judge", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e8", source: "judge", target: "rart", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
    ];

    return { nodes, edges };
  } else {
    // 3x3 Grid for Laptop / Desktop (3 nodes per row)
    const nodes: AgentNodeType[] = [
      // Row 1
      { id: "intake", type: "agentNode", position: { x: 30, y: 30 }, data: { label: "1. Intake", reasoning: "", isActive: false, confidence: 0, badge: "NIDS" } },
      { id: "investigator", type: "agentNode", position: { x: 420, y: 30 }, data: { label: "2. Investigator", reasoning: "", isActive: false, confidence: 0, badge: "Hypotheses" } },
      { id: "evidence", type: "agentNode", position: { x: 810, y: 30 }, data: { label: "3. Evidence & Tools", reasoning: "", isActive: false, confidence: 0, badge: "Tool Calls" } },

      // Row 2
      { id: "assessment", type: "agentNode", position: { x: 30, y: 270 }, data: { label: "4. Assessment", reasoning: "", isActive: false, confidence: 0, badge: "Verdict" } },
      { id: "reviewer", type: "agentNode", position: { x: 420, y: 270 }, data: { label: "5. Reviewer", reasoning: "", isActive: false, confidence: 0, badge: "Guardrails" } },
      { id: "executor", type: "agentNode", position: { x: 810, y: 270 }, data: { label: "6. Executor", reasoning: "", isActive: false, confidence: 0, badge: "Action" } },

      // Row 3
      { id: "verification", type: "agentNode", position: { x: 30, y: 510 }, data: { label: "7. Verification", reasoning: "", isActive: false, confidence: 0, badge: "Validation" } },
      { id: "judge", type: "agentNode", position: { x: 420, y: 510 }, data: { label: "8. Judge Scorecard", reasoning: "", isActive: false, confidence: 0, badge: "Eval" } },
      { id: "rart", type: "agentNode", position: { x: 810, y: 510 }, data: { label: "9. Strategy & RART", reasoning: "", isActive: false, confidence: 0, badge: "Learning" } },
    ];

    const edges: Edge[] = [
      // Row 1
      { id: "e1", source: "intake", target: "investigator", sourceHandle: "source-right", targetHandle: "target-left", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e2", source: "investigator", target: "evidence", sourceHandle: "source-right", targetHandle: "target-left", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },

      // Row 1 -> Row 2 Wrap
      { id: "e3", source: "evidence", target: "assessment", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },

      // Row 2
      { id: "e4", source: "assessment", target: "reviewer", sourceHandle: "source-right", targetHandle: "target-left", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e5", source: "reviewer", target: "executor", sourceHandle: "source-right", targetHandle: "target-left", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },

      // Row 2 -> Row 3 Wrap
      { id: "e6", source: "executor", target: "verification", sourceHandle: "source-bottom", targetHandle: "target-top", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },

      // Row 3
      { id: "e7", source: "verification", target: "judge", sourceHandle: "source-right", targetHandle: "target-left", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
      { id: "e8", source: "judge", target: "rart", sourceHandle: "source-right", targetHandle: "target-left", type: "smoothstep", animated: true, style: { stroke: "#60a5fa", strokeWidth: 2.5 } },
    ];

    return { nodes, edges };
  }
};

export default function SOCDashboard() {
  const [logs, setLogs] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [nodes, setNodes] = useState<AgentNodeType[]>(() => getLayout(false).nodes);
  const [edges, setEdges] = useState<Edge[]>(() => getLayout(false).edges);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"stream" | "graph" | "scorecard">("stream");
  const [graphState, setGraphState] = useState<Record<string, unknown> | null>(null);
  const [incidentInfo, setIncidentInfo] = useState({
    id: "ALT-9999",
    alertSignature: "CRITICAL: Successful SQL Injection and Data Exfiltration Detected",
    sourceIp: "192.168.1.100",
    targetIp: "10.0.1.15",
    status: "STANDBY",
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // Sync responsive layout on resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      const layout = getLayout(isMobile);
      setEdges(layout.edges);
      setNodes((currentNodes) =>
        layout.nodes.map((n) => {
          const existing = currentNodes.find((c) => c.id === n.id);
          return {
            ...n,
            data: existing ? existing.data : n.data,
          };
        })
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setLogs(["Listening to NIDS alert feed..."]);
    setConfidence(0);
    setIncidentInfo((prev) => ({ ...prev, status: "INVESTIGATING" }));

    // Reset node reasoning
    setNodes((currentNodes) =>
      currentNodes.map((n) => ({
        ...n,
        data: { ...n.data, reasoning: "", isActive: false, confidence: 0 },
      }))
    );

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource("/api/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.msg) {
        setLogs((prev) => [...prev, data.msg]);
      }

      if (data.confidence !== undefined) {
        const val = data.confidence <= 1 ? Math.round(data.confidence * 100) : data.confidence;
        setConfidence(val);
      }

      if (data.incident_id) {
        setIncidentInfo((prev) => ({
          ...prev,
          id: data.incident_id,
          alertSignature: data.alert_signature || prev.alertSignature,
          sourceIp: data.source_ip || prev.sourceIp,
          targetIp: data.target_ip || prev.targetIp,
        }));
      }

      if (data.graph_state) {
        setGraphState(data.graph_state);
      }

      // Update Node data inline
      if (data.node) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === data.node) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isActive: true,
                  reasoning: data.msg || node.data.reasoning,
                  confidence: data.confidence ?? node.data.confidence,
                },
              };
            }
            return {
              ...node,
              data: {
                ...node.data,
                isActive: false,
              },
            };
          })
        );
      }

      if (data.complete) {
        setIsRunning(false);
        setIncidentInfo((prev) => ({ ...prev, status: "COMPLETED" }));
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection error:", err);
      setIsRunning(false);
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6 font-sans flex flex-col">
      {/* Incident Header */}
      <header className="bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                  Autonomous SOC Incident Response
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {incidentInfo.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                    incidentInfo.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : incidentInfo.status === "INVESTIGATING"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600"
                  }`}
                >
                  {incidentInfo.status}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-mono mt-0.5">
                {incidentInfo.alertSignature}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500">Source:</span>{" "}
              <span className="text-amber-400 font-bold">{incidentInfo.sourceIp}</span>
            </div>
            <div className="text-slate-600">➔</div>
            <div>
              <span className="text-slate-500">Target:</span>{" "}
              <span className="text-blue-400 font-bold">{incidentInfo.targetIp}</span>
            </div>
            <div className="border-l border-slate-800 pl-3 flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={14} />
              <span className="text-slate-300">LangGraph Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[750px]">
        {/* Left Side: Multi-Tab Inspector & Reasoning Stream */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex-1 flex flex-col shadow-lg">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-3 mb-3">
              <button
                onClick={() => setActiveTab("stream")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                  activeTab === "stream"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal size={13} /> Stream
              </button>
              <button
                onClick={() => setActiveTab("graph")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                  activeTab === "graph"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 size={13} /> State JSON
              </button>
              <button
                onClick={() => setActiveTab("scorecard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                  activeTab === "scorecard"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Award size={13} /> Scorecard
              </button>
            </div>

            {/* Tab 1: Agent Stream */}
            {activeTab === "stream" && (
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-lg font-mono text-xs border border-slate-800 max-h-[400px] lg:max-h-[580px] flex flex-col gap-2.5">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic py-8 text-center">
                    Click &quot;Trigger Exploit Alert&quot; to begin simulated incident investigation...
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className="text-slate-300 border-l-2 border-blue-500 pl-3 py-1 bg-slate-900/40 rounded-r"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Graph State JSON */}
            {activeTab === "graph" && (
              <div className="flex-1 overflow-y-auto bg-slate-950 p-3 rounded-lg font-mono text-xs border border-slate-800 max-h-[400px] lg:max-h-[580px]">
                <pre className="text-emerald-400 whitespace-pre-wrap">
                  {graphState
                    ? JSON.stringify(graphState, null, 2)
                    : "// Graph State will appear here once incident completes..."}
                </pre>
              </div>
            )}

            {/* Tab 3: Judge Scorecard */}
            {activeTab === "scorecard" && (
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-lg font-mono text-xs border border-slate-800 max-h-[400px] lg:max-h-[580px] flex flex-col gap-3">
                <div className="font-bold text-slate-300 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Award className="text-amber-400" size={16} /> SOC Judge Evaluation
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Investigation</span>
                    <span className="text-base font-bold text-white">6 / 10</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Evidence Gathering</span>
                    <span className="text-base font-bold text-white">4 / 10</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Decision Quality</span>
                    <span className="text-base font-bold text-emerald-400">8 / 10</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Response Speed</span>
                    <span className="text-base font-bold text-amber-400">2 / 10</span>
                  </div>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
                  <strong className="text-amber-400 block mb-1">Critical Feedback:</strong>
                  The SOC Judge Orchestrator found that incident response was delayed due to initial missing evidence. The proposed action of TARGETED_RULE was approved without collateral impact.
                </div>
              </div>
            )}

            {/* Trigger Simulation Button */}
            <button
              onClick={startSimulation}
              disabled={isRunning}
              className={`mt-4 w-full flex items-center justify-center gap-2 font-medium py-3 rounded-xl transition-all cursor-pointer shadow-lg ${
                isRunning
                  ? "bg-blue-800 text-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              }`}
            >
              <Play size={16} />
              {isRunning ? "Running Agent State Machine..." : "Trigger Exploit Alert"}
            </button>
          </div>
        </div>

        {/* Right Side: 3x3 Flowchart Grid */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl relative shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Layers className="text-blue-400" size={16} />
              <h2 className="font-semibold text-slate-300 uppercase text-xs tracking-wider">
                Autonomous State Machine (3x3 Pipeline)
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400 text-xs font-mono">Attack Confidence:</span>
              <div className="w-32 md:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    confidence >= 80
                      ? "bg-red-500"
                      : confidence >= 40
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="font-mono text-white font-bold text-xs">{confidence}%</span>
            </div>
          </div>

          <div className="flex-1 w-full h-[650px] lg:h-[720px]">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.12 }}
                minZoom={0.2}
                maxZoom={1.5}
                panOnScroll={true}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#334155" gap={28} size={1.5} />
                <Controls className="!bg-slate-800 !border-slate-700 !text-white !fill-white [&>button]:!border-slate-700 [&>button]:!bg-slate-800 [&>button]:!text-white [&>button:hover]:!bg-slate-700" />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

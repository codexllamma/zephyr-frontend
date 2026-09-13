"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface VisibleLog {
  id: number;
  text: string;
  color: string;
  type?: string;
}

const DEFAULT_STAGES = [
  {
    stepIndex: 0,
    gateStatus: "evaluating" as const,
    delay: 1500,
    logs: [
      {
        text: "[INGRESS] Anomaly Flagged: ET EXPLOIT Apache log4j RCE Attempt (CVE-2021-44228) on 10.0.1.15.",
        color: "text-blue-400 font-semibold",
      },
      {
        text: "[CONTEXT] Querying pgvector: Loaded Playbook PB-LOG4J-01 for CVE-2021-44228.",
        color: "text-cyan-400",
      },
    ],
  },
  {
    stepIndex: 1,
    gateStatus: "evaluating" as const,
    delay: 1600,
    logs: [
      {
        text: "[STRATEGIST] Llama 3.1 8B: Zero-shot policy formulated: BLOCK_SOURCE on 104.28.15.12.",
        color: "text-purple-400 font-medium",
      },
      {
        text: "[PROPOSAL] Action: BLOCK_SOURCE | Standard SOP dictates edge perimeter block.",
        color: "text-zinc-300",
      },
    ],
  },
  {
    stepIndex: 2,
    gateStatus: "rejected" as const,
    delay: 1800,
    logs: [
      {
        text: "[REVIEWER] Simulating Action on Target Asset: Tier 1 (Cloudflare Edge Node).",
        color: "text-amber-400 font-semibold",
      },
      {
        text: "[NO / REJECTED] Blast Radius Check FAILED: 'BLOCK_SOURCE' violates Availability SLA on Tier 1 (100% Downtime).",
        color: "text-red-400 font-bold bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-500/30",
      },
    ],
  },
  {
    stepIndex: 3,
    gateStatus: "rejected" as const,
    delay: 1800,
    logs: [
      {
        text: "[RART MUTATOR] DPO Alignment Engine: Synthesizing fine-grained SLA mutation...",
        color: "text-blue-400 font-semibold",
      },
      {
        text: "[MUTATED POLICY] TARGETED_RULE: Deny incoming RCE attempts via API Revocation + Layer 7 Token Drop.",
        color: "text-blue-300 font-bold bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-500/30",
      },
    ],
  },
  {
    stepIndex: 4,
    gateStatus: "approved" as const,
    delay: 1800,
    logs: [
      {
        text: "[REVIEWER] Re-evaluating Mutated Policy: Zero downtime verified. [APPROVED] Action safe for production execution.",
        color: "text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30",
      },
      {
        text: "[EXECUTOR] Applied TARGETED_RULE to network fabric. Routing tables updated.",
        color: "text-emerald-300 font-medium",
      },
      {
        text: "[JUDGE SCORECARD] Verification: 100/100 | Blast Radius Reduction: -92% | EXCELLENT RESPONSE",
        color: "text-white font-bold bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/40 shadow-sm",
      },
    ],
  },
];

export function useTelemetryStream(incidentId: string) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [gateStatus, setGateStatus] = useState<"evaluating" | "rejected" | "approved">("evaluating");
  const [visibleLogs, setVisibleLogs] = useState<VisibleLog[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timeoutRef.current.forEach((t) => clearTimeout(t));
    timeoutRef.current = [];
  };

  // Fetch telemetry JSON for meta values
  useEffect(() => {
    if (!incidentId) return;

    fetch(`/api/telemetry?id=${encodeURIComponent(incidentId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setTelemetry(data);
      })
      .catch((err) => {
        console.error("Failed to load telemetry metadata:", err);
      });
  }, [incidentId]);

  // Direct 5-stage simulation traversal (~8.5s total)
  const startSimulation = useCallback(() => {
    clearTimers();
    setIsPlaying(true);
    setIsComplete(false);
    setVisibleLogs([]);
    setActiveStep(0);
    setGateStatus("evaluating");

    let stageIndex = 0;
    let logCounter = 0;

    const playNextStage = () => {
      if (stageIndex >= DEFAULT_STAGES.length) {
        setIsPlaying(false);
        const completeTimer = setTimeout(() => {
          setIsComplete(true);
        }, 500);
        timeoutRef.current.push(completeTimer);
        return;
      }

      const stage = DEFAULT_STAGES[stageIndex];
      setActiveStep(stage.stepIndex);
      setGateStatus(stage.gateStatus);

      // Append stage logs
      stage.logs.forEach((logItem, idx) => {
        const logTimer = setTimeout(() => {
          setVisibleLogs((prev) => [
            ...prev,
            {
              id: logCounter++,
              text: logItem.text,
              color: logItem.color,
            },
          ]);
        }, idx * 300);
        timeoutRef.current.push(logTimer);
      });

      stageIndex++;
      const nextTimer = setTimeout(playNextStage, stage.delay);
      timeoutRef.current.push(nextTimer);
    };

    const initialTimer = setTimeout(playNextStage, 300);
    timeoutRef.current.push(initialTimer);
  }, []);

  useEffect(() => {
    startSimulation();
    return () => clearTimers();
  }, [incidentId, startSimulation]);

  const replay = useCallback(() => {
    startSimulation();
  }, [startSimulation]);

  return {
    telemetry,
    activeStep,
    gateStatus,
    visibleLogs,
    isComplete,
    isPlaying,
    replay,
  };
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AttackScenario, LogEntry, GraphStep } from "@/types/simulation";
import scenariosData from "@/data/scenarios.json";

interface UseAgentStreamOptions {
  autoStart?: boolean;
  endpointUrl?: string; // FastAPI endpoint template e.g., "/stream/incident/{id}"
}

export function useAgentStream(
  initialScenarioId: string = "INC-001",
  options: UseAgentStreamOptions = {}
) {
  const scenarios = (scenariosData.scenarios as AttackScenario[]) || [];

  const [selectedScenario, setSelectedScenario] = useState<AttackScenario>(() => {
    return scenarios.find((s) => s.id === initialScenarioId) || scenarios[0];
  });

  const [mode, setMode] = useState<"mock" | "sse">("mock");
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, GraphStep["status"]>>({
    orchestrator: "idle",
    reviewer: "idle",
    rart: "idle",
  });

  const [nodeDecisions, setNodeDecisions] = useState<Record<string, string | undefined>>({});
  const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([]);
  const [persistedMemory, setPersistedMemory] = useState<string | null>(null);
  const [isMemoryLoaded, setIsMemoryLoaded] = useState(false);

  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const clearAllTimers = () => {
    timerRef.current.forEach((t) => clearTimeout(t));
    timerRef.current = [];
  };

  const resetSimulation = useCallback((scenarioToUse?: AttackScenario) => {
    clearAllTimers();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const s = scenarioToUse || selectedScenario;
    setIsRunning(false);
    setIsComplete(false);
    setActiveNodeId(null);
    setNodeStatuses({
      orchestrator: "idle",
      reviewer: "idle",
      rart: "idle",
    });
    setNodeDecisions({});
    setCurrentLogs([]);
    setPersistedMemory(null);
    setIsMemoryLoaded(false);
  }, [selectedScenario]);

  const selectScenario = useCallback(
    (scenario: AttackScenario) => {
      setSelectedScenario(scenario);
      resetSimulation(scenario);
    },
    [resetSimulation]
  );

  const runMockSimulation = useCallback((scenario: AttackScenario) => {
    clearAllTimers();
    setIsRunning(true);
    setIsComplete(false);
    setCurrentLogs([]);
    setNodeStatuses({
      orchestrator: "idle",
      reviewer: "idle",
      rart: "idle",
    });
    setNodeDecisions({});
    setPersistedMemory(null);
    setIsMemoryLoaded(false);

    let cumulativeDelay = 150;

    // 1. Sequentially feed logs
    scenario.logs.forEach((log, index) => {
      const logDelay = cumulativeDelay + index * 450;
      const t = setTimeout(() => {
        setCurrentLogs((prev) => [...prev, log]);
      }, logDelay);
      timerRef.current.push(t);
    });

    cumulativeDelay += 300;

    // 2. Execute graph steps
    scenario.graph_execution.forEach((step, stepIndex) => {
      const startDelay = cumulativeDelay;
      
      // Node activates
      const startTimer = setTimeout(() => {
        setActiveNodeId(step.node_id);
        setNodeStatuses((prev) => ({
          ...prev,
          [step.node_id]: "active",
        }));

        // If RART node or scenario has persisted memory, trigger memory load
        if (step.node_id === "rart" && scenario.persisted_memory) {
          setIsMemoryLoaded(true);
          setPersistedMemory(scenario.persisted_memory);
        }
      }, startDelay);
      timerRef.current.push(startTimer);

      cumulativeDelay += step.duration_ms;

      // Node finishes step
      const finishTimer = setTimeout(() => {
        setNodeStatuses((prev) => ({
          ...prev,
          [step.node_id]: step.status,
        }));
        if (step.decision) {
          setNodeDecisions((prev) => ({
            ...prev,
            [step.node_id]: step.decision,
          }));
        }

        // Check if last step
        if (stepIndex === scenario.graph_execution.length - 1) {
          setActiveNodeId(null);
          setIsRunning(false);
          setIsComplete(true);
        }
      }, cumulativeDelay);
      timerRef.current.push(finishTimer);

      cumulativeDelay += 250; // pause between nodes
    });
  }, []);

  const runSseSimulation = useCallback((scenario: AttackScenario) => {
    clearAllTimers();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsRunning(true);
    setIsComplete(false);
    setCurrentLogs([]);
    setNodeStatuses({
      orchestrator: "idle",
      reviewer: "idle",
      rart: "idle",
    });
    setNodeDecisions({});
    setPersistedMemory(null);
    setIsMemoryLoaded(false);

    // Default to mock / stream API route or FastAPI endpoint template
    const endpoint = options.endpointUrl
      ? options.endpointUrl.replace("{id}", scenario.id)
      : `/api/stream?scenario=${scenario.id}`;

    try {
      const eventSource = new EventSource(endpoint);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.log) {
            setCurrentLogs((prev) => [...prev, data.log]);
          }

          if (data.node_id) {
            setActiveNodeId(data.node_id);
            if (data.status) {
              setNodeStatuses((prev) => ({
                ...prev,
                [data.node_id]: data.status,
              }));
            }
            if (data.decision) {
              setNodeDecisions((prev) => ({
                ...prev,
                [data.node_id]: data.decision,
              }));
            }
          }

          if (data.persisted_memory) {
            setIsMemoryLoaded(true);
            setPersistedMemory(data.persisted_memory);
          }

          if (data.complete) {
            setIsRunning(false);
            setIsComplete(true);
            setActiveNodeId(null);
            eventSource.close();
          }
        } catch (err) {
          console.error("Error parsing SSE event:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("SSE stream failed or endpoint unavailable. Falling back to mock engine:", err);
        eventSource.close();
        // Fallback to mock simulation automatically
        runMockSimulation(scenario);
      };
    } catch (e) {
      console.warn("Could not initiate EventSource, running mock:", e);
      runMockSimulation(scenario);
    }
  }, [options.endpointUrl, runMockSimulation]);

  const startSimulation = useCallback(() => {
    if (mode === "sse") {
      runSseSimulation(selectedScenario);
    } else {
      runMockSimulation(selectedScenario);
    }
  }, [mode, selectedScenario, runMockSimulation, runSseSimulation]);

  const stopSimulation = useCallback(() => {
    clearAllTimers();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
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
  };
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { LogEntry, AttackScenario, GraphStep } from "@/types/simulation";
import scenariosData from "@/data/scenarios.json";

export type IncidentNodeState = {
  status: string;
  decision?: string;
};

export function useIncidentStream(initialMode: "live" | "mock" = "live") {
  const [isLive, setIsLive] = useState<boolean>(initialMode === "live");
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [nodeStates, setNodeStates] = useState<Record<string, IncidentNodeState>>({
    orchestrator: { status: "idle" },
    reviewer: { status: "idle" },
    rart: { status: "idle" },
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [persistedMemory, setPersistedMemory] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasReceivedLiveEventRef = useRef<boolean>(false);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const abortStream = useCallback(() => {
    clearAllTimers();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setActiveNodeId(null);
  }, []);

  const runMockMode = useCallback((incidentId: string) => {
    clearAllTimers();
    setIsStreaming(true);
    setActiveNodeId(null);
    setLogs([]);
    setPersistedMemory(null);
    setNodeStates({
      orchestrator: { status: "idle" },
      reviewer: { status: "idle" },
      rart: { status: "idle" },
    });

    const scenarios = (scenariosData.scenarios as AttackScenario[]) || [];
    const scenario = scenarios.find((s) => s.id === incidentId) || scenarios[0];

    let cumulativeDelay = 150;

    // 1. Stream logs sequentially
    scenario.logs.forEach((logItem, index) => {
      const delay = cumulativeDelay + index * 400;
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, logItem]);
      }, delay);
      timersRef.current.push(t);
    });

    cumulativeDelay += Math.max(300, scenario.logs.length * 200);

    // 2. Stream graph steps sequentially
    scenario.graph_execution.forEach((step, index) => {
      const startDelay = cumulativeDelay;

      // Node becomes active
      const tStart = setTimeout(() => {
        setActiveNodeId(step.node_id);
        setNodeStates((prev) => ({
          ...prev,
          [step.node_id]: { status: "active", decision: prev[step.node_id]?.decision },
        }));

        if (step.node_id === "rart" && scenario.persisted_memory) {
          setPersistedMemory(scenario.persisted_memory);
        }
      }, startDelay);
      timersRef.current.push(tStart);

      cumulativeDelay += step.duration_ms;

      // Node finishes execution
      const tFinish = setTimeout(() => {
        setNodeStates((prev) => ({
          ...prev,
          [step.node_id]: {
            status: step.status,
            decision: step.decision,
          },
        }));

        // Final step completion
        if (index === scenario.graph_execution.length - 1) {
          setIsStreaming(false);
          setActiveNodeId(null);
        }
      }, cumulativeDelay);
      timersRef.current.push(tFinish);

      cumulativeDelay += 250;
    });
  }, []);

  const runLiveMode = useCallback(
    (incidentId: string) => {
      clearAllTimers();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsStreaming(true);
      setActiveNodeId(null);
      setLogs([]);
      setPersistedMemory(null);
      setNodeStates({
        orchestrator: { status: "idle" },
        reviewer: { status: "idle" },
        rart: { status: "idle" },
      });

      hasReceivedLiveEventRef.current = false;

      try {
        const es = new EventSource(`/api/stream/${encodeURIComponent(incidentId)}`);
        eventSourceRef.current = es;

        // Named event: log
        es.addEventListener("log", (e: MessageEvent) => {
          hasReceivedLiveEventRef.current = true;
          try {
            const data = JSON.parse(e.data);
            const logEntry: LogEntry = {
              type: data.type === "malicious" ? "malicious" : "benign",
              time: data.time || new Date().toLocaleTimeString(),
              content: data.content || data.msg || JSON.stringify(data),
            };
            setLogs((prev) => [...prev, logEntry]);
          } catch {
            setLogs((prev) => [
              ...prev,
              {
                type: "benign",
                time: new Date().toLocaleTimeString(),
                content: e.data,
              },
            ]);
          }
        });

        // Named event: node_state
        es.addEventListener("node_state", (e: MessageEvent) => {
          hasReceivedLiveEventRef.current = true;
          try {
            const data = JSON.parse(e.data);
            const nodeId = data.node_id || data.node;
            if (nodeId) {
              if (data.status === "active") {
                setActiveNodeId(nodeId);
              }
              setNodeStates((prev) => ({
                ...prev,
                [nodeId]: {
                  status: data.status || "active",
                  decision: data.decision,
                },
              }));
            }
          } catch (err) {
            console.error("Error parsing node_state event:", err);
          }
        });

        // Named event: memory_loaded
        es.addEventListener("memory_loaded", (e: MessageEvent) => {
          hasReceivedLiveEventRef.current = true;
          try {
            const data = JSON.parse(e.data);
            const memoryStr =
              typeof data.persisted_memory === "string"
                ? data.persisted_memory
                : typeof data.memory === "string"
                ? data.memory
                : typeof data === "string"
                ? data
                : JSON.stringify(data);
            setPersistedMemory(memoryStr);
          } catch {
            setPersistedMemory(e.data);
          }
        });

        // Named event: completed
        es.addEventListener("completed", () => {
          hasReceivedLiveEventRef.current = true;
          setIsStreaming(false);
          setActiveNodeId(null);
          es.close();
          eventSourceRef.current = null;
        });

        // Named event: error
        es.addEventListener("error", (e: Event) => {
          console.warn("SSE error event received:", e);
          if (!hasReceivedLiveEventRef.current) {
            // If live endpoint failed without sending data, fallback to mock data
            es.close();
            eventSourceRef.current = null;
            console.info("Falling back to local mock data for incident:", incidentId);
            runMockMode(incidentId);
          } else {
            setIsStreaming(false);
            setActiveNodeId(null);
            es.close();
            eventSourceRef.current = null;
          }
        });

        // Standard message handler for generic SSE payload formats
        es.onmessage = (e: MessageEvent) => {
          hasReceivedLiveEventRef.current = true;
          try {
            const data = JSON.parse(e.data);

            if (data.type === "log" || data.log) {
              const item = data.log || data;
              setLogs((prev) => [
                ...prev,
                {
                  type: item.type === "malicious" ? "malicious" : "benign",
                  time: item.time || new Date().toLocaleTimeString(),
                  content: item.content || item.msg || JSON.stringify(item),
                },
              ]);
            }

            if (data.type === "node_state" || data.node_id || data.node) {
              const nodeId = data.node_id || data.node;
              if (nodeId) {
                if (data.status === "active") {
                  setActiveNodeId(nodeId);
                }
                setNodeStates((prev) => ({
                  ...prev,
                  [nodeId]: {
                    status: data.status || "active",
                    decision: data.decision,
                  },
                }));
              }
            }

            if (
              data.type === "memory_loaded" ||
              data.persisted_memory ||
              data.memory
            ) {
              const mem =
                data.persisted_memory || data.memory || data.data || data;
              setPersistedMemory(
                typeof mem === "string" ? mem : JSON.stringify(mem)
              );
            }

            if (data.type === "completed" || data.complete || data.status === "COMPLETED") {
              setIsStreaming(false);
              setActiveNodeId(null);
              es.close();
              eventSourceRef.current = null;
            }

            if (data.type === "error") {
              if (!hasReceivedLiveEventRef.current) {
                es.close();
                eventSourceRef.current = null;
                runMockMode(incidentId);
              } else {
                setIsStreaming(false);
                setActiveNodeId(null);
                es.close();
                eventSourceRef.current = null;
              }
            }
          } catch (err) {
            console.error("Error parsing generic SSE onmessage:", err);
          }
        };

        es.onerror = (err) => {
          console.warn("EventSource encountered network error:", err);
          if (!hasReceivedLiveEventRef.current) {
            es.close();
            eventSourceRef.current = null;
            console.info("Live backend unavailable, falling back to mock mode:", incidentId);
            runMockMode(incidentId);
          } else {
            setIsStreaming(false);
            setActiveNodeId(null);
            es.close();
            eventSourceRef.current = null;
          }
        };
      } catch (err) {
        console.warn("Could not establish EventSource, running mock:", err);
        runMockMode(incidentId);
      }
    },
    [runMockMode]
  );

  const triggerIncident = useCallback(
    (incidentId: string) => {
      if (isLive) {
        runLiveMode(incidentId);
      } else {
        runMockMode(incidentId);
      }
    },
    [isLive, runLiveMode, runMockMode]
  );

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    activeNodeId,
    nodeStates,
    logs,
    persistedMemory,
    isStreaming,
    triggerIncident,
    abortStream,
    isLive,
    setIsLive,
  };
}

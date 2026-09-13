export type LogEntry = {
  type: 'benign' | 'malicious';
  time: string;
  content: string;
};

export type GraphStep = {
  node_id: string;
  status: 'idle' | 'active' | 'approved' | 'failed' | 'mutated';
  decision?: string;
  duration_ms: number;
};

export type AttackScenario = {
  id: string;
  title: string;
  target_asset: string;
  target_ip: string;
  is_tier_1: boolean;
  logs: LogEntry[];
  graph_execution: GraphStep[];
  persisted_memory?: string; // e.g., "Past alignment prevents blunt isolation on Tier 1"
};

export type SimulationState = {
  activeScenarioId: string;
  isRunning: boolean;
  isComplete: boolean;
  activeNodeId: string | null;
  nodeStatuses: Record<string, GraphStep['status']>;
  nodeDecisions: Record<string, string | undefined>;
  currentLogs: LogEntry[];
  persistedMemory: string | null;
  isMemoryLoaded: boolean;
};

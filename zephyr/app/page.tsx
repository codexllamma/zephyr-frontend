'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  CheckCircle2,
  TrendingDown,
  Scale,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Radio,
  Sliders,
  Database,
  Flame,
  ChevronDown
} from 'lucide-react';

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
  type: 'filler' | 'alert' | 'system';
};

type AttackPhase = 'idle' | 'expanding' | 'streaming' | 'alert' | 'extracting' | 'pipeline';

const ATTACK_VECTORS = [
  {
    id: 'INC-001',
    label: 'INC-001',
    name: 'Log4Shell RCE',
    description: 'Exploits vulnerable JNDI lookup headers (${jndi:ldap://...}) to execute arbitrary code on Identity Provider servers.',
    impact: 'Compromises authentication infrastructure, risking enterprise-wide credential impersonation.',
  },
  {
    id: 'INC-002',
    label: 'INC-002',
    name: 'SQL Injection & Exfiltration',
    description: 'Injects union-based SQL payloads to bypass app filters and dump sensitive database schemas.',
    impact: 'Exfiltrates customer billing records and proprietary data, leading to severe regulatory breach.',
  },
  {
    id: 'INC-003',
    label: 'INC-003',
    name: 'Kerberoasting Privilege Escalation',
    description: 'Extracts Kerberos TGS service tickets with weak legacy RC4 encryption for offline cryptographic cracking.',
    impact: 'Compromises service accounts, enabling full domain administrator takeover.',
  },
  {
    id: 'INC-010',
    label: 'INC-010',
    name: 'Lateral Movement via WMI',
    description: 'Leverages Windows Management Instrumentation to spawn rogue remote processes across internal endpoints.',
    impact: 'Enables attacker stealth traversal across internal network boundaries.',
  },
  {
    id: 'INC-013',
    label: 'INC-013',
    name: 'Ransomware Payload Dropper',
    description: 'Executes obfuscated loader scripts staging encrypted ransomware binaries on local disk volumes.',
    impact: 'Risks mass operational downtime and irreversible file destruction.',
  },
];

const GLOBAL_METRICS = [
  {
    title: 'Simulated Incidents',
    value: '300',
    delta: '100% Evaluated',
    icon: Activity,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    context: 'Total Tier 1–Tier 4 network attack scenarios evaluated.',
  },
  {
    title: 'Adaptation Rate',
    value: '62.3%',
    delta: '187 RART Mutations',
    icon: Flame,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    context: '187 RART mutations triggered vs. 113 direct textbook passes.',
  },
  {
    title: 'SLA Preservation',
    value: '100%',
    delta: '0 Violations',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    context: 'Zero Tier-1 infrastructure availability violations in final chosen actions.',
  },
  {
    title: 'DPO Loss Convergence',
    value: '0.69 → 0.12',
    delta: '-82.6% Delta',
    icon: TrendingDown,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    context: 'Minimized differential between rejected actions and preferred outputs.',
  },
  {
    title: 'Reward Margins',
    value: '+3.65 Delta',
    delta: '+2.10 vs -1.55',
    icon: Scale,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    context: 'Final chosen reward (+2.10) heavily prioritized over rejected penalty (-1.55).',
  },
];

const EXECUTION_ZONES = [
  {
    step: '01',
    name: 'DPO Pair Construction',
    badge: 'preferences.jsonl',
    icon: Sliders,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    description: 'Side-by-side JSON split-screen contrasting the rejected standard playbook action against the chosen evolved rule.',
  },
  {
    step: '02',
    name: 'Unsloth Fine-Tuning Terminal',
    badge: 'training_run.log',
    icon: Terminal,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    description: 'Typewriter streaming highlights T4 GPU memory boundaries, 8B parameter load, and 84MB LoRA adapter weights generation.',
  },
  {
    step: '03',
    name: 'GGUF & Ollama Fusion',
    badge: 'modelfile_dump.txt',
    icon: Cpu,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    description: 'Raw text block rendering proving Llama 3.1 instruct prompt format survived quantized LoRA merge.',
  },
  {
    step: '04',
    name: 'Interactive Sandbox & Macro Ledger',
    badge: 'replayed_evals.json',
    icon: Database,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    description: '300 offline replay evaluations, 400ms visual inference pulse, 113 textbook passes vs. 187 mutated DPO pairs.',
  },
];

export default function TerminalView() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [idlePool, setIdlePool] = useState<string[]>([]);
  const [activeIncident, setActiveIncident] = useState<string | null>(null);
  const [attackPhase, setAttackPhase] = useState<AttackPhase>('idle');
  
  const simulationRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/filler')
      .then(res => res.json())
      .then(data => {
        if (data.logs && data.logs.length > 0) setIdlePool(data.logs);
      })
      .catch(err => console.error("Failed to load filler logs", err));
  }, []);

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    if (terminalContainerRef.current && attackPhase !== 'extracting' && attackPhase !== 'pipeline') {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs, attackPhase]);

  useEffect(() => {
    if (attackPhase !== 'idle' || idlePool.length === 0) return;
    
    const interval = setInterval(() => {
      const randomLog = idlePool[Math.floor(Math.random() * idlePool.length)];
      setLogs((prev) => [
        ...prev,
        { 
          id: crypto.randomUUID(), 
          timestamp: getTimestamp(), 
          message: randomLog, 
          type: 'filler' as LogEntry['type']
        }
      ].slice(-100)); 
    }, Math.random() * 800 + 400);
    
    return () => clearInterval(interval);
  }, [attackPhase, idlePool]);

  const scrollToSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerAttack = (incidentId: string) => {
    setActiveIncident(incidentId);
    setAttackPhase('expanding');
    
    setTimeout(() => {
      setAttackPhase('streaming');
      const eventSource = new EventSource(`/api/attack-stream?id=${encodeURIComponent(incidentId)}`);
      let isFinished = false; 

      eventSource.onmessage = (event) => {
        if (event.data.includes('[DONE]')) {
          isFinished = true;
          eventSource.close();
          
          setAttackPhase('alert');
          setTimeout(() => setAttackPhase('extracting'), 1500);
          
          // Keep the extracted single log on screen for 3 seconds longer before redirecting
          setTimeout(() => {
            setAttackPhase('pipeline');
            router.push(`/dashboard?scenario=${encodeURIComponent(incidentId)}`);
          }, 7500);
          
          return; 
        }
        
        try {
          const parsedData = JSON.parse(event.data);
          if (parsedData.message.includes('Injecting payload from:')) return; 

          setLogs((prev) => [
            ...prev,
            {
              id: parsedData.id,
              timestamp: getTimestamp(),
              message: parsedData.message,
              type: parsedData.type as LogEntry['type']
            }
          ].slice(-150));
        } catch (e) {
          console.error("Log parse error", e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        if (!isFinished) {
          // Fallback: trigger alert extraction and keep for 3s longer before redirecting
          setAttackPhase('alert');
          setTimeout(() => setAttackPhase('extracting'), 1500);
          setTimeout(() => {
            setAttackPhase('pipeline');
            router.push(`/dashboard?scenario=${encodeURIComponent(incidentId)}`);
          }, 7000);
        }
      };
    }, 800);
  };

  const cleanMessage = (msg: string) => {
    return msg.replace(/\[(filler|CORE|SYSTEM)\]\s*/ig, '');
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-300 flex flex-col font-sans relative selection:bg-red-500/30 selection:text-red-200">
      
      {/* ============================================================ */}
      {/* TOP VIEWPORT: LEARNING METRICS & SYSTEM ARCHITECTURE */}
      {/* ============================================================ */}
      <section className="min-h-screen w-full flex flex-col justify-between p-6 md:p-10 lg:p-12 relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-[#0a0a0f] to-[#070709]">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Navbar Info */}
        <div className="w-full max-w-[1500px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-wide font-mono uppercase">ZephyrGuard SOC</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">v2.4-ALIGN</span>
              </div>
              {/* <p className="text-xs text-zinc-500 font-mono">Autonomous Reinforcement Alignment & Incident Orchestration</p> */}
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">Offline Trace Replay — Zero Live Compute</span>
            </div>
          </div>
        </div>

        {/* Hero Banner / Value Proposition */}
        <div className="w-full max-w-[1500px] mx-auto my-auto py-8 z-10 flex flex-col gap-8">
          
          <div className="flex flex-col gap-4 max-w-5xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/40 border border-red-500/20 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>SOC Agent Alignment & Optimization Trajectory</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3.5">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Autonomous Incident Telemetry to <span className="bg-gradient-to-r from-red-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">Optimized Weights</span>
              </h1>
              
              {/* Red Action Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={scrollToSimulation}
                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white font-mono font-bold text-xs shadow-[0_0_30px_rgba(239,68,68,0.55)] border border-red-400/50 hover:shadow-[0_0_45px_rgba(239,68,68,0.8)] transition-all cursor-pointer overflow-hidden shrink-0"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="relative tracking-wide uppercase">Run NIDS alert simulations</span>
                <ChevronDown className="relative w-3.5 h-3.5 text-white group-hover:translate-y-0.5 transition-transform" />
              </motion.button>

              {/* Blue See Training Data Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push('/training-data')}
                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white font-mono font-bold text-xs shadow-[0_0_30px_rgba(59,130,246,0.55)] border border-blue-400/50 hover:shadow-[0_0_45px_rgba(59,130,246,0.8)] transition-all cursor-pointer overflow-hidden shrink-0"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Database className="relative w-3.5 h-3.5 text-blue-100" />
                <span className="relative tracking-wide uppercase">See Training Data</span>
              </motion.button>
            </div>
            
            {/* <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-normal">
              The frontend architecture maps the entire trajectory from raw incident telemetry to the final optimized weights without requiring a live GPU. The UI is separated into four core execution zones that prove the SOC agent&apos;s alignment progression.
            </p> */}
          </div>

          {/* Section 1: Global Alignment Metrics Cards */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-red-400" />
                Global Alignment Metrics
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">Benchmarked across 300 attack iterations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {GLOBAL_METRICS.map((metric, idx) => {
                const IconComponent = metric.icon;
                return (
                  <motion.div
                    key={metric.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all hover:bg-zinc-900/90 shadow-lg group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />
                    
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono font-medium text-zinc-400">{metric.title}</span>
                      <div className={`p-1.5 rounded-lg ${metric.bgColor} ${metric.color} border ${metric.borderColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight">
                        {metric.value}
                      </span>
                      <span className={`text-[11px] font-mono font-semibold ${metric.color}`}>
                        {metric.delta}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-snug pt-2 border-t border-zinc-800/80 mt-1">
                      {metric.context}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Four Core Execution Zones Architecture */}
          <div className="flex flex-col gap-3 pt-2">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Four Core Execution Zones
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXECUTION_ZONES.map((zone, idx) => {
                const ZoneIcon = zone.icon;
                return (
                  <motion.div
                    key={zone.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + idx * 0.08 }}
                    className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col justify-between gap-3 shadow-md hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-600">ZONE {zone.step}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {zone.badge}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1 rounded-md border ${zone.color}`}>
                          <ZoneIcon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-200">{zone.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        {zone.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Bar with Red Floating Call-to-Action */}
        <div className="w-full max-w-[1500px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Ready to evaluate real-time attack detection and mitigation telemetry</span>
          </div>

          {/* Glowing Red Floating Button */}
          {/* <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={scrollToSimulation}
            className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white font-mono font-bold text-sm shadow-[0_0_35px_rgba(239,68,68,0.55)] border border-red-400/50 hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] transition-all cursor-pointer overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="relative tracking-wide uppercase">Run NIDS alert simulations</span>
            <ChevronDown className="relative w-4 h-4 text-white group-hover:translate-y-1 transition-transform" />
          </motion.button> */}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECOND VIEWPORT: LIVE NIDS TELEMETRY & ATTACK SIMULATOR */}
      {/* ============================================================ */}
      <section 
        ref={simulationRef}
        id="simulation-view"
        className="min-h-screen w-full bg-[#0a0a0a] text-gray-300 p-6 md:p-10 lg:p-12 flex flex-col font-mono relative"
      >
        <div className="w-full max-w-[1600px] mx-auto flex flex-col flex-1">
          
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">RART Orchestrator</h2>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs font-mono text-zinc-400 border border-zinc-700">
                  Simulation Arena
                </span>
              </div>
              <p className="text-sm text-gray-500">Live Syslog Stream & Active Defense Engine</p>
            </div>

            <div className="flex items-center gap-3">
              {attackPhase !== 'idle' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold animate-pulse"
                >
                  PIPELINE ACTIVE
                </motion.div>
              ) : (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  ↑ Back to Metrics
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center flex-1">
            
            <AnimatePresence>
              {attackPhase === 'idle' && (
                <motion.div 
                  key="left-panel"
                  initial={{ opacity: 1, width: '38%' }}
                  exit={{ opacity: 0, width: 0, scale: 0.9, padding: 0, margin: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full lg:w-[38%] flex flex-col gap-3.5 shrink-0"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-300">
                      Targeted Attack Vectors
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">Select vector to inject</span>
                  </div>
                  
                  {ATTACK_VECTORS.map((vector) => (
                    <div
                      key={vector.id}
                      className="flex flex-col p-4 rounded-xl border bg-[#0d1117] border-gray-800 hover:border-gray-700 gap-2.5 shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs font-bold text-gray-300 border border-gray-700 font-mono">
                            {vector.label}
                          </span>
                          <span className="font-bold text-gray-100 text-sm font-sans">{vector.name}</span>
                        </div>
                        <button 
                          onClick={() => triggerAttack(vector.id)}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition-all shrink-0 cursor-pointer"
                        >
                          INJECT
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                        {vector.description}
                      </p>

                      {/* Impact */}
                      <div className="p-2 rounded-lg bg-red-950/20 border border-red-500/20 text-[10px] text-red-300 leading-snug font-sans">
                        <strong className="text-red-400 mr-1 font-semibold uppercase tracking-wider font-mono">Impact:</strong>
                        {vector.impact}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              layout
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex-1 flex flex-col w-full relative"
            >
              {/* Centered Floating Culprit Anomaly Alert */}
              <AnimatePresence>
                {(attackPhase === 'alert' || attackPhase === 'extracting') && (
                  <div className="absolute top-16 left-0 w-full flex justify-center z-50 pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-4 px-6 py-3 bg-black/95 border border-red-500/50 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)] backdrop-blur-md pointer-events-auto"
                    >
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <div className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-red-500 font-bold tracking-[0.2em] text-sm">
                        IDENTIFYING CULPRIT...
                      </span>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <motion.div 
                layout
                className={`w-full flex flex-col overflow-hidden transition-colors duration-1000 ${
                  attackPhase === 'extracting' || attackPhase === 'pipeline' 
                    ? 'bg-transparent border-transparent shadow-none' 
                    : 'bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl'
                }`}
                style={{ height: '560px', minHeight: '560px', maxHeight: '560px', flexShrink: 0 }}
              >
                <AnimatePresence>
                  {(attackPhase !== 'extracting' && attackPhase !== 'pipeline') && (
                    <motion.div 
                      key="terminal-topbar"
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#161b22] px-4 flex items-center gap-2 border-b border-gray-800 shrink-0" 
                      style={{ height: '48px' }}
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      <span className="text-xs text-gray-400 ml-2 font-mono truncate">
                        root@soc-gateway:~ /var/log/syslog {activeIncident ? `[${activeIncident}]` : ''}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div 
                  ref={terminalContainerRef}
                  className={`p-4 overflow-y-auto flex-1 min-h-0 text-sm leading-relaxed tracking-tight font-mono ${
                    attackPhase === 'extracting' || attackPhase === 'pipeline' ? 'overflow-hidden flex flex-col justify-center items-center pt-24' : ''
                  } [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0d1117] [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full`}
                >
                  <AnimatePresence>
                    {logs.map((log) => {
                      if ((attackPhase === 'extracting' || attackPhase === 'pipeline') && log.type !== 'alert') {
                        return null;
                      }

                      return (
                        <motion.div 
                          layout 
                          key={log.id} 
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            scale: (attackPhase === 'extracting' || attackPhase === 'pipeline') ? 1.05 : 1
                          }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.5 }}
                          className={`mb-1 flex gap-3 px-1 rounded transition-colors ${
                            (attackPhase === 'extracting' || attackPhase === 'pipeline') ? 'my-2 justify-center w-full' : 'hover:bg-gray-900/50'
                          }`}
                        >
                          <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                          <span className={`break-all ${
                            log.type === 'alert' ? 'text-red-500 font-bold bg-red-500/10 rounded px-2 py-1 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                            log.type === 'system' ? 'text-blue-400 font-semibold' :
                            'text-gray-300'
                          }`}>
                            {cleanMessage(log.message)}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
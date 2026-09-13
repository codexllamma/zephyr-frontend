'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function TerminalView() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [idlePool, setIdlePool] = useState<string[]>([]);
  const [activeIncident, setActiveIncident] = useState<string | null>(null);
  const [attackPhase, setAttackPhase] = useState<AttackPhase>('idle');
  
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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-8 flex flex-col font-mono relative">
      
      <div className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RART Orchestrator</h1>
          <p className="text-sm text-gray-500">Live Syslog Stream & Active Defense Engine</p>
        </div>
        {attackPhase !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold animate-pulse"
          >
            PIPELINE ACTIVE
          </motion.div>
        )}
      </div>

      <div className="flex flex-row gap-8 w-full max-w-[1600px] mx-auto items-start justify-center">
        
        <AnimatePresence>
          {attackPhase === 'idle' && (
            <motion.div 
              key="left-panel"
              initial={{ opacity: 1, width: '38%' }}
              exit={{ opacity: 0, width: 0, scale: 0.9, padding: 0, margin: 0, overflow: 'hidden' }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex flex-col gap-3.5 shrink-0"
            >
              <h2 className="text-base font-semibold text-gray-400 border-b border-gray-800 pb-2 mb-1">
                Targeted Attack Vectors
              </h2>
              
              {ATTACK_VECTORS.map((vector) => (
                <div
                  key={vector.id}
                  className="flex flex-col p-4 rounded-lg border bg-[#0d1117] border-gray-800 gap-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs font-bold text-gray-300 border border-gray-700">
                        {vector.label}
                      </span>
                      <span className="font-bold text-gray-100 text-sm">{vector.name}</span>
                    </div>
                    <button 
                      onClick={() => triggerAttack(vector.id)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg transition-colors shrink-0 cursor-pointer"
                    >
                      INJECT
                    </button>
                  </div>

                  {/* 1-2 lines Description */}
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {vector.description}
                  </p>

                  {/* 1-2 lines Impact */}
                  <div className="p-2 rounded bg-red-950/20 border border-red-500/20 text-[10px] text-red-300 leading-snug">
                    <strong className="text-red-400 mr-1 font-semibold uppercase tracking-wider">Impact:</strong>
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
          className="flex-1 flex flex-col w-full max-w-5xl relative"
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
                : 'bg-[#0d1117] border border-gray-800 rounded-xl shadow-2xl'
            }`}
            style={{ height: '520px', minHeight: '520px', maxHeight: '520px', flexShrink: 0 }}
          >
            <AnimatePresence>
              {(attackPhase !== 'extracting' && attackPhase !== 'pipeline') && (
                <motion.div 
                  key="terminal-topbar"
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#161b22] px-4 flex items-center gap-2 border-b border-gray-800 shrink-0" 
                  style={{ height: '48px' }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-500 ml-2 font-mono truncate">
                    root@soc-gateway:~ /var/log/syslog
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              ref={terminalContainerRef}
              className={`p-4 overflow-y-auto flex-1 min-h-0 text-sm leading-relaxed tracking-tight ${
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
  );
}
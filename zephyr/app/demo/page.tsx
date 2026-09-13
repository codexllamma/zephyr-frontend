'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
  type: 'filler' | 'alert' | 'system';
};

type AttackPhase = 'idle' | 'expanding' | 'streaming' | 'alert' | 'extracting' | 'pipeline';

const ATTACK_VECTORS = [
  { id: '10', label: 'INC-010', name: 'Lateral Movement via WMI' },
  { id: '13', label: 'INC-013', name: 'Ransomware Payload Dropper' },
  { id: '15', label: 'INC-015', name: 'Privilege Escalation (PrintNightmare)' },
  { id: '18', label: 'INC-018', name: 'Suspicious PowerShell Command' },
  { id: '19', label: 'INC-019', name: 'Data Exfiltration over DNS' },
];

export default function TerminalView() {
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
      const eventSource = new EventSource(`/api/attack-stream?id=${incidentId}`);
      let isFinished = false; 

      eventSource.onmessage = (event) => {
        if (event.data.includes('[DONE]')) {
          isFinished = true;
          eventSource.close();
          
          setAttackPhase('alert');
          setTimeout(() => setAttackPhase('extracting'), 1500);
          setTimeout(() => setAttackPhase('pipeline'), 5000);
          
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
        if (!isFinished) setAttackPhase('idle');
      };
    }, 800);
  };

  const cleanMessage = (msg: string) => {
    return msg.replace(/\[(filler|CORE|SYSTEM)\]\s*/ig, '');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-8 flex flex-col font-mono relative">
      
      <div className="mb-12 flex justify-between items-center border-b border-gray-800 pb-4">
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

      <div className="flex flex-row gap-10 w-full max-w-[1600px] mx-auto items-start justify-center">
        
        <AnimatePresence>
          {attackPhase === 'idle' && (
            <motion.div 
              key="left-panel"
              initial={{ opacity: 1, width: '30%' }}
              exit={{ opacity: 0, width: 0, scale: 0.9, padding: 0, margin: 0, overflow: 'hidden' }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex flex-col gap-4 shrink-0"
            >
              <h2 className="text-lg font-semibold text-gray-400 border-b border-gray-800 pb-2 mb-2 whitespace-nowrap">
                Targeted Attack Vectors
              </h2>
              
              {ATTACK_VECTORS.map((vector) => (
                <div
                  key={vector.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-[#0d1117] border-gray-800 whitespace-nowrap"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-200 text-base">{vector.label}</span>
                    <span className="text-xs font-mono text-gray-500 mt-1">{vector.name}</span>
                  </div>
                  <button 
                    onClick={() => triggerAttack(vector.id)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg transition-colors shrink-0 ml-4"
                  >
                    INJECT
                  </button>
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
          {/* THE FIX: Full-width absolute wrapper ensures perfect Flexbox centering */}
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
            style={{ height: '500px', minHeight: '500px', maxHeight: '500px', flexShrink: 0 }}
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
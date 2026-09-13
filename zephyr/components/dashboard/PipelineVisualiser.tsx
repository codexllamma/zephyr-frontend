'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PIPELINE_STEPS = [
  { id: 'intake', label: 'Context Assembly', desc: 'Pulling playbooks via pgvector...' },
  { id: 'strategist', label: 'Llama 3.1 8B Strategist', desc: 'Formulating zero-shot response...' },
  { id: 'gate', label: 'Reviewer Gate', desc: 'Evaluating Action x Asset Tier...' },
  { id: 'mutator', label: 'RART Mutator', desc: 'Enforcing granular SLA rules...' },
  { id: 'mcts', label: 'Execute & Align', desc: 'Executing and rating response...' }
];

export default function PipelineVisualizer({ incidentId }: { incidentId: string }) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [gateStatus, setGateStatus] = useState<'evaluating' | 'rejected' | 'approved'>('evaluating');
  const [visibleLogs, setVisibleLogs] = useState<{ id: number, text: string, color: string }[]>([]);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLogs]);

  useEffect(() => {
    fetch(`/api/telemetry?id=${incidentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) setTelemetry(data);
      })
      .catch(err => console.error("Failed to load telemetry", err));
  }, [incidentId]);

  useEffect(() => {
    if (!telemetry || !telemetry.messages) return;

    let currentIndex = 0;
    
    const playNextMessage = () => {
      if (currentIndex >= telemetry.messages.length) return;
      
      const msg = telemetry.messages[currentIndex];
      const content = msg.content;
      
      if (!content || content.trim() === '') {
        currentIndex++;
        playNextMessage();
        return;
      }

      let stepIndex = activeStep;
      let logColor = 'text-gray-400';
      let currentGateStatus = gateStatus;

      // Robust Parsing based on telemetry schema
      if (msg.type === 'tool') {
        logColor = 'text-cyan-400 font-semibold';
      } else if (content.includes('Intake') || content.includes('Investigator')) {
        stepIndex = 0; logColor = 'text-blue-400';
      } else if (content.includes('Verdict') || content.includes('Defense Strategy')) {
        stepIndex = 1; logColor = 'text-purple-400'; currentGateStatus = 'evaluating';
      } else if (content.includes('Reviewer')) {
        stepIndex = 2;
        if (content.includes('REJECTED') || content.includes('[REJECTED]')) {
          currentGateStatus = 'rejected'; logColor = 'text-red-500 font-bold';
        } else {
          currentGateStatus = 'approved'; logColor = 'text-green-400 font-bold';
        }
      } else if (content.includes('Mutated') || content.includes('Policy')) {
        stepIndex = 3; logColor = 'text-yellow-400';
      } else if (content.includes('Executor') || content.includes('Verifier') || content.includes('Judge')) {
        stepIndex = 4; logColor = content.includes('Judge') ? 'text-white font-black bg-green-500/20 px-2 py-1 rounded' : 'text-emerald-400';
      }

      setActiveStep(stepIndex);
      if (currentGateStatus !== gateStatus) setGateStatus(currentGateStatus);
      
      setVisibleLogs(prev => [...prev, { id: currentIndex, text: content, color: logColor }]);
      currentIndex++;
      
      const delay = Math.random() * 900 + 500; 
      setTimeout(playNextMessage, delay);
    };

    const initTimer = setTimeout(playNextMessage, 1000);
    return () => clearTimeout(initTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telemetry]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-4xl mt-12 flex flex-col gap-10 pb-12"
    >
      <div className="flex justify-between items-start relative px-4 md:px-12">
        <div className="absolute top-6 left-16 right-16 h-1 bg-gray-800 -z-10 rounded-full"></div>
        
        {PIPELINE_STEPS.map((step, index) => {
          const isActive = activeStep === index;
          const isPast = activeStep > index;
          
          let bgColor = '#1f2937'; 
          let borderColor = '#374151';
          let glow = '';

          if (isActive) {
            if (index === 2 && gateStatus === 'rejected') {
              bgColor = '#ef4444'; borderColor = '#f87171'; glow = 'shadow-[0_0_25px_rgba(239,68,68,0.6)]';
            } else if (index === 2 && gateStatus === 'approved') {
              bgColor = '#22c55e'; borderColor = '#4ade80'; glow = 'shadow-[0_0_25px_rgba(34,197,94,0.6)]';
            } else {
              bgColor = '#3b82f6'; borderColor = '#60a5fa'; glow = 'shadow-[0_0_25px_rgba(59,130,246,0.6)]';
            }
          } else if (isPast) {
            bgColor = '#22c55e'; borderColor = '#4ade80';
          }

          return (
            <div key={step.id} className="flex flex-col items-center gap-4 relative z-10 w-24 md:w-32">
              <motion.div 
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: bgColor,
                  borderColor: borderColor
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-white transition-colors ${glow}`}
              >
                {index + 1}
              </motion.div>
              
              <div className="text-center">
                <div className={`text-[11px] md:text-xs font-bold transition-colors ${isActive ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#050505] border border-gray-800 rounded-xl p-6 font-mono text-sm h-[300px] overflow-y-auto shadow-inner [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="text-gray-500 border-b border-gray-800/50 pb-3 mb-4 sticky top-0 bg-[#050505] flex justify-between items-center z-10">
          <span className="truncate pr-4">AGENT_LOG // {telemetry?.incident_id || 'LOADING'}</span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] text-blue-400 tracking-widest font-bold">LIVE</span>
          </span>
        </div>
        
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {visibleLogs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 leading-relaxed ${log.color}`}
              >
                <span className="shrink-0 mt-0.5 opacity-50">❯</span>
                <span className="whitespace-pre-wrap">{log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logEndRef} className="h-4" />
        </div>
      </div>
    </motion.div>
  );
}
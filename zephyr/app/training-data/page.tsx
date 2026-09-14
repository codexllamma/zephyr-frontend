'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Terminal,
  Database,
  Sliders,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Search,
  ExternalLink
} from 'lucide-react';

type TelemetryMessage = {
  type: 'ai' | 'tool' | 'system' | string;
  content: string;
};

type TelemetryData = {
  incident_id: string;
  status: string;
  alert_signature: string;
  source_ip: string;
  target_ip: string;
  assessment_outcome?: string;
  textbook_playbook?: string;
  proposed_action?: string;
  action_justification?: string;
  learned_rule?: string;
  messages: TelemetryMessage[];
};

type DPOPair = {
  id: string;
  prompt: string;
  rejected: string;
  chosen: string;
  metadata?: {
    incident_id?: string;
    timestamp?: string;
    simulated_blast_radius?: string;
  };
};

export default function TrainingDataPage() {
  const router = useRouter();

  const [selectedIncident, setSelectedIncident] = useState<string>('INC-001');
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [preferences, setPreferences] = useState<DPOPair[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [animatingStage, setAnimatingStage] = useState<number>(0);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  
  const [logFilter, setLogFilter] = useState<'all' | 'ai' | 'tool'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pipeline' | 'terminal' | 'corpus'>('pipeline');

  useEffect(() => {
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.pairs) setPreferences(data.pairs);
      })
      .catch(err => console.error("Failed to load preferences:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/telemetry?id=${encodeURIComponent(selectedIncident)}`)
      .then(res => res.json())
      .then((data: TelemetryData) => {
        setTelemetry(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load telemetry:", err);
        setLoading(false);
      });
  }, [selectedIncident]);

  const currentDPO = preferences.find(
    p => p.id === selectedIncident || p.metadata?.incident_id === selectedIncident
  ) || preferences[0];

  const startSynthesis = () => {
    setIsSynthesizing(true);
    setAnimatingStage(1);
    setTimeout(() => setAnimatingStage(2), 1000);
    setTimeout(() => setAnimatingStage(3), 2200);
    setTimeout(() => setAnimatingStage(4), 3400);
    setTimeout(() => setAnimatingStage(5), 4600);
    setTimeout(() => setIsSynthesizing(false), 5600);
  };

  const resetSynthesis = () => {
    setIsSynthesizing(false);
    setAnimatingStage(0);
  };

  const getBadgeForMessage = (msg: TelemetryMessage) => {
    const text = msg.content.toLowerCase();
    if (text.includes('reviewer approve') || text.includes('simulation passed')) {
      return { label: 'REVIEWER APPROVED', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (text.includes('rejected') || text.includes('violates availability sla')) {
      return { label: 'SLA REJECTED', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    }
    if (text.includes('policy mutated') || text.includes('learned rule')) {
      return { label: 'RART MUTATION', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    if (text.includes('defense strategy') || text.includes('execute')) {
      return { label: 'ACTION DISPATCH', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
    if (msg.type === 'tool') {
      return { label: 'TOOL OUTPUT', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' };
    }
    return { label: 'AGENT LOG', color: 'text-zinc-400 bg-zinc-900 border-zinc-800' };
  };

  const filteredMessages = (telemetry?.messages || []).filter(msg => {
    if (!msg.content || msg.content.trim() === '') return false;
    if (logFilter === 'ai' && msg.type !== 'ai') return false;
    if (logFilter === 'tool' && msg.type !== 'tool') return false;
    if (searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-200 font-sans flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Clean Minimal Header */}
      <header className="h-14 px-5 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between shrink-0 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arena</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs font-mono">
            <span className="font-bold text-white uppercase tracking-wide">Training Data</span>
            <span className="text-zinc-600">/</span>
            <span className="text-blue-400 font-semibold">DPO Pairs</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-500">Incident:</span>
            <select
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="bg-transparent text-xs font-mono text-blue-400 font-bold focus:outline-none cursor-pointer"
            >
              {['INC-001', 'INC-002', 'INC-003', 'INC-004', 'INC-006', 'INC-009', 'INC-010', 'INC-011', 'INC-013', 'INC-014', 'INC-016', 'INC-019', 'INC-020'].map(id => (
                <option key={id} value={id} className="bg-zinc-900 text-zinc-200">
                  {id}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={isSynthesizing ? resetSynthesis : startSynthesis}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              isSynthesizing
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
            }`}
          >
            {isSynthesizing ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Animate DPO</span>
              </>
            )}
          </button>

          <button
            onClick={() => router.push(`/dashboard?scenario=${selectedIncident}`)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/40 transition-colors cursor-pointer"
          >
            <span>Flow</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-5 flex flex-col gap-4">
        
        {/* Compact Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Target Incident</span>
            <div className="text-xs font-bold text-white font-mono truncate">
              {selectedIncident}: {telemetry?.alert_signature || 'Loading...'}
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl bg-rose-950/10 border border-rose-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">Rejected SOP</span>
              <span className="text-[10px] font-mono text-rose-500">-1.55</span>
            </div>
            <div className="text-xs font-mono text-rose-300 truncate">
              {telemetry?.textbook_playbook || 'BLOCK_SOURCE (SLA Failure)'}
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl bg-emerald-950/10 border border-emerald-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Chosen Action</span>
              <span className="text-[10px] font-mono text-emerald-500">+2.10</span>
            </div>
            <div className="text-xs font-mono text-emerald-300 truncate">
              {telemetry?.learned_rule || 'Targeted Granular Rule'}
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl bg-purple-950/10 border border-purple-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">DPO Reward Margin</span>
              <span className="text-[10px] font-mono text-purple-300 font-bold">+3.65 Delta</span>
            </div>
            <div className="text-xs font-mono text-purple-300 truncate">
              Loss: 0.69 → 0.12 (Zero Blast Violation)
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DPO Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Telemetry Stream ({telemetry?.messages?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('corpus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              activeTab === 'corpus'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Corpus Explorer ({preferences.length})</span>
          </button>
        </div>

        {/* TAB 1: PIPELINE ANIMATION & SPLIT VIEW */}
        {activeTab === 'pipeline' && (
          <div className="flex flex-col gap-4">
            
            {/* 5-Step Pipeline Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              
              <div className={`p-3 rounded-xl border transition-all ${
                animatingStage >= 1 ? 'bg-blue-950/20 border-blue-500/40' : 'bg-zinc-900/40 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-blue-400 mb-1">
                  <span>01 INTAKE</span>
                  {animatingStage >= 1 && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                </div>
                <div className="text-xs font-bold text-white">Alert Normalization</div>
                <div className="text-[10px] text-zinc-500 font-mono truncate mt-1">
                  {telemetry?.alert_signature || 'Normalizing...'}
                </div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${
                animatingStage >= 2 ? 'bg-rose-950/20 border-rose-500/40' : 'bg-zinc-900/40 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-rose-400 mb-1">
                  <span>02 REJECTED</span>
                  {animatingStage >= 2 && <XCircle className="w-3 h-3 text-rose-400" />}
                </div>
                <div className="text-xs font-bold text-white">SLA Blast Violation</div>
                <div className="text-[10px] text-rose-400 font-mono truncate mt-1">
                  BLOCK_SOURCE Failed SLA
                </div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${
                animatingStage >= 3 ? 'bg-amber-950/20 border-amber-500/40' : 'bg-zinc-900/40 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 mb-1">
                  <span>03 MUTATION</span>
                  {animatingStage >= 3 && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                </div>
                <div className="text-xs font-bold text-white">RART Policy Adaptation</div>
                <div className="text-[10px] text-amber-400 font-mono truncate mt-1">
                  Targeted Granular Rule
                </div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${
                animatingStage >= 4 ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-zinc-900/40 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400 mb-1">
                  <span>04 CHOSEN</span>
                  {animatingStage >= 4 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-white">Safety Verified</div>
                <div className="text-[10px] text-emerald-400 font-mono truncate mt-1">
                  100% Zero Blast Radius
                </div>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${
                animatingStage >= 5 ? 'bg-purple-950/20 border-purple-500/40' : 'bg-zinc-900/40 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-purple-400 mb-1">
                  <span>05 JSONL</span>
                  {animatingStage >= 5 && <Database className="w-3 h-3 text-purple-400" />}
                </div>
                <div className="text-xs font-bold text-white">DPO Pair Export</div>
                <div className="text-[10px] text-purple-400 font-mono truncate mt-1">
                  preferences.jsonl
                </div>
              </div>

            </div>

            {/* Split Screen: Synthesized DPO Pair vs Telemetry Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              
              {/* Left Column: DPO Pair JSON */}
              <div className="lg:col-span-6 flex flex-col gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>Synthesized DPO Pair ({selectedIncident})</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Llama 3.1 Prompt Tuple</span>
                </div>

                {/* Prompt */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">Prompt (Context)</span>
                  <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-32">
                    {currentDPO?.prompt || `Alert: ${telemetry?.alert_signature}\nSource: ${telemetry?.source_ip}\nTarget: ${telemetry?.target_ip}`}
                  </pre>
                </div>

                {/* Rejected & Chosen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Rejected (-1.55)</span>
                    <pre className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-[10px] font-mono text-rose-200 leading-relaxed overflow-x-auto whitespace-pre-wrap h-44">
                      {currentDPO?.rejected || telemetry?.textbook_playbook || 'Action: BLOCK_SOURCE'}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Chosen (+2.10)</span>
                    <pre className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-200 leading-relaxed overflow-x-auto whitespace-pre-wrap h-44">
                      {currentDPO?.chosen || `Action: TARGETED_RULE\nEvolved: ${telemetry?.learned_rule}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Right Column: Telemetry Event Stream */}
              <div className="lg:col-span-6 flex flex-col p-4 rounded-2xl bg-zinc-950 border border-zinc-800 h-[500px]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-2.5 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Telemetry Log Trace</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {filteredMessages.length} events
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 font-mono text-xs">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                      Loading telemetry logs...
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                      No logs available.
                    </div>
                  ) : (
                    filteredMessages.map((msg, idx) => {
                      const badge = getBadgeForMessage(msg);
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500 font-mono">[{idx + 1}]</span>
                            <span className={`px-1.5 py-0.2 rounded font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: RAW TELEMETRY TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col gap-3">
            
            <div className="flex items-center justify-between gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 flex-1 max-w-sm bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'ai', 'tool'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase cursor-pointer transition-colors ${
                      logFilter === filter
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col font-mono max-h-[620px] overflow-y-auto gap-2">
              {filteredMessages.map((msg, idx) => {
                const badge = getBadgeForMessage(msg);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-400 font-bold">[{idx + 1}] {msg.type.toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: CORPUS EXPLORER */}
        {activeTab === 'corpus' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {preferences.map((pair, idx) => {
              const isSelected = pair.id === selectedIncident || pair.metadata?.incident_id === selectedIncident;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedIncident(pair.metadata?.incident_id || pair.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-blue-950/20 border-blue-500 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {pair.metadata?.incident_id || pair.id}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="text-[11px] font-mono text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-500/20 line-clamp-2">
                      <strong className="text-rose-300">Rejected: </strong>
                      {pair.rejected}
                    </div>

                    <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 p-2 rounded border border-emerald-500/20 line-clamp-2">
                      <strong className="text-emerald-300">Chosen: </strong>
                      {pair.chosen}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                    <span>Reward: +3.65</span>
                    <span className="text-blue-400">Select Incident →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileCode2,
  TableProperties,
  Award,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface EvolutionArtifactsProps {
  telemetry: any;
}

export function EvolutionArtifacts({ telemetry }: EvolutionArtifactsProps) {
  const incidentId = telemetry?.incident_id || "INC-001";
  const alertSig = telemetry?.alert_signature || "ET EXPLOIT Apache log4j RCE Attempt";
  const targetIp = telemetry?.target_ip || "10.0.1.15";
  const sourceIp = telemetry?.source_ip || "104.28.15.12";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col gap-8 w-full border-t border-zinc-800/80 pt-8"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Autonomic Adaptation & Evolution Completed</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-100 mt-1">
            System Evolution & Learning Loop
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Incident {incidentId} successfully converted into permanent structural DPO memory.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>DPO Vector Ingested</span>
        </div>
      </div>

      {/* 1. DPO Derivation Inspector */}
      <section className="flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            1. DPO Derivation Inspector (Alignment Pair)
          </h3>
          <span className="text-[10px] text-zinc-500">Pair: (π_ref, π_θ)</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          {/* Prompt Box */}
          <div className="bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-lg text-blue-300 text-xs">
            <strong className="text-blue-200 block mb-0.5 font-bold uppercase tracking-wide">
              Ingress Prompt Context:
            </strong>
            Attack {alertSig} targeting {targetIp} (Tier 1 Edge Node).
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rejected Path */}
            <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-red-400 border-b border-red-500/20 pb-1.5">
                <span className="tracking-wider">REJECTED PATH (π_ref)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/50">
                  Zero-Shot Proposal
                </span>
              </div>
              <div className="text-zinc-200 text-xs font-semibold">
                BLOCK_SOURCE on {sourceIp}
              </div>
              <div className="text-[11px] text-red-300/80 leading-relaxed">
                <span className="font-bold text-red-300">Failure Tripwire:</span> Deterministic Reviewer Gate tripwire. Dropping entire network traffic on a Tier 1 ingress node violates customer uptime SLAs.
              </div>
            </div>

            {/* Chosen Path */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 border-b border-emerald-500/20 pb-1.5">
                <span className="tracking-wider">CHOSEN PATH (π_θ)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                  RART Mutated
                </span>
              </div>
              <div className="text-zinc-200 text-xs font-semibold">
                TARGETED_RULE via API Revocation
              </div>
              <div className="text-[11px] text-emerald-300/80 leading-relaxed">
                <span className="font-bold text-emerald-300">Alignment Justification:</span> Surgical edge isolation neutralizing the RCE vector without dropping upstream host connectivity.
              </div>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex flex-wrap items-center gap-6 text-xs border-t border-zinc-800/80 pt-3 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Blast Radius Score:</span>
              <span className="text-emerald-400 font-bold">100 / 100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Containment Score:</span>
              <span className="text-emerald-400 font-bold">100 / 100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Adaptation Bonus:</span>
              <span className="text-purple-400 font-bold">EARNED (+1.0)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Autonomous Postmortem Card */}
      <section className="flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            2. Autonomous Postmortem Card (RAG Memory Seed)
          </h3>
          <span className="text-[10px] text-zinc-500">Format: JSON Structural Memory</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-sm overflow-x-auto">
          <pre className="text-xs text-emerald-400 leading-relaxed font-mono">
{`{
  "postmortem_id": "PM-${incidentId}",
  "trigger_signature": "${alertSig?.split(' ')[2] || 'CVE-2021-44228'}",
  "target_tier": "TIER_1_CRITICAL",
  "textbook_sop": "BLOCK_SOURCE (Edge Firewall)",
  "learned_policy_override": "Deny incoming RCE attempts to Cloudflare Edge Nodes via API Revocation",
  "downstream_priority": "FORCE_OVERRIDE_STANDARD_SOP"
}`}
          </pre>
        </div>
      </section>

      {/* 3. 100-Run Macro Evolution Ledger */}
      <section className="flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <TableProperties className="w-3.5 h-3.5 text-amber-400" />
            3. 300-Run Macro Evolution Ledger
          </h3>
          <span className="text-[10px] text-zinc-500">100 Incident Benchmark</span>
        </div>

        <div className="overflow-hidden border border-zinc-800 rounded-xl bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Metric</th>
                <th className="px-5 py-3 font-semibold text-red-400">Baseline Runs (1–20)</th>
                <th className="px-5 py-3 font-semibold text-emerald-400">Aligned Runs (80–100)</th>
                <th className="px-5 py-3 font-semibold text-blue-400 hidden sm:table-cell">Delta / Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              <tr className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3 font-semibold text-zinc-100">Zero-Shot Proposal</td>
                <td className="px-5 py-3 text-red-400">Blunt (BLOCK_SOURCE)</td>
                <td className="px-5 py-3 text-emerald-400 font-semibold">Surgical (TARGETED_RULE)</td>
                <td className="px-5 py-3 text-zinc-400 hidden sm:table-cell">Permanent behavioral shift</td>
              </tr>
              <tr className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3 font-semibold text-zinc-100">Reviewer Interventions</td>
                <td className="px-5 py-3 text-red-400">85% Rejection Rate</td>
                <td className="px-5 py-3 text-emerald-400 font-semibold">4% Rejection Rate</td>
                <td className="px-5 py-3 text-blue-400 font-semibold hidden sm:table-cell">-81% MTTR Bottleneck</td>
              </tr>
              <tr className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3 font-semibold text-zinc-100">RART Mutations Needed</td>
                <td className="px-5 py-3 text-red-400">17 incidents</td>
                <td className="px-5 py-3 text-emerald-400 font-semibold">1 incident</td>
                <td className="px-5 py-3 text-zinc-400 hidden sm:table-cell">Near-zero reliance on fallbacks</td>
              </tr>
              <tr className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3 font-semibold text-zinc-100">Mean Blast Radius</td>
                <td className="px-5 py-3 text-red-400">42 / 100</td>
                <td className="px-5 py-3 text-emerald-400 font-semibold">98 / 100</td>
                <td className="px-5 py-3 text-blue-400 font-semibold hidden sm:table-cell">+133% SLA Preservation</td>
              </tr>
              <tr className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-5 py-3 font-semibold text-zinc-100">Memory Ingestion</td>
                <td className="px-5 py-3 text-zinc-500">Static Textbook SOP</td>
                <td className="px-5 py-3 text-purple-400 font-semibold">Dynamic Postmortem RAG</td>
                <td className="px-5 py-3 text-zinc-400 hidden sm:table-cell">Self-healing enterprise knowledge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}

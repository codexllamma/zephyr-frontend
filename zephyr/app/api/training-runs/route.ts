import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trainingRunsDir = path.join(process.cwd(), 'data', 'training_runs');
    
    if (!fs.existsSync(trainingRunsDir)) {
      return NextResponse.json({ incidents: [] });
    }

    const folders = fs.readdirSync(trainingRunsDir)
      .filter(f => fs.statSync(path.join(trainingRunsDir, f)).isDirectory())
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
        return numA - numB;
      });

    const summaries = folders.map(folder => {
      const telemetryFile = path.join(trainingRunsDir, folder, 'telemetry.json');
      if (fs.existsSync(telemetryFile)) {
        try {
          const raw = fs.readFileSync(telemetryFile, 'utf8');
          const data = JSON.parse(raw);
          return {
            id: data.incident_id || folder,
            signature: data.alert_signature || 'Unknown Attack Signature',
            sourceIp: data.source_ip || 'N/A',
            targetIp: data.target_ip || 'N/A',
            status: data.status || 'COMPLETED',
            outcome: data.assessment_outcome || 'ATTACK_SUCCEEDED',
            proposedAction: data.proposed_action || 'TARGETED_RULE',
            hasLearnedRule: Boolean(data.learned_rule)
          };
        } catch (e) {
          return { id: folder, signature: 'Corrupted Run', hasLearnedRule: false };
        }
      }
      return { id: folder, signature: 'No Telemetry File', hasLearnedRule: false };
    });

    return NextResponse.json({ incidents: summaries, total: summaries.length });
  } catch (error) {
    console.error("Error reading training runs:", error);
    return NextResponse.json({ error: "Failed to read training runs", incidents: [] }, { status: 500 });
  }
}

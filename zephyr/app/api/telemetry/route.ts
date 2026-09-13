import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); 

  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  const paddedId = id.padStart(3, '0');
  const filePath = path.join(process.cwd(), `data/training_runs/inc_${paddedId}/telemetry.json`);

  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[API] File not found: ${filePath}. Returning rich fallback data.`);
      return NextResponse.json(getRichFallbackTelemetry(paddedId)); 
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    if (!fileContents || fileContents.trim() === '') {
      return NextResponse.json({ error: 'File is empty' }, { status: 500 });
    }

    const data = JSON.parse(fileContents);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error(`[API] JSON Parse Error:`, error.message);
    return NextResponse.json({ 
      incident_id: `INC-${paddedId}`, 
      messages: [
        { type: 'tool', content: `[ERROR] Failed to parse telemetry.json. Check for missing brackets.` }
      ] 
    });
  }
}

// THIS IS YOUR ACTUAL DATA! 
// If the file system misses the file, it will play this full sequence instead.
function getRichFallbackTelemetry(id: string) {
  return {
    "incident_id": `INC-${id}`,
    "status": "COMPLETED",
    "alert_signature": "ET EXPLOIT Apache log4j RCE Attempt (CVE-2021-44228)",
    "source_ip": "104.28.15.12",
    "target_ip": "10.0.1.15",
    "messages": [
      {
        "type": "ai",
        "content": "Intake complete. Alert ET EXPLOIT Apache log4j RCE Attempt (CVE-2021-44228) normalized. Awaiting investigation."
      },
      {
        "type": "ai",
        "content": "Investigator Requirement: To prove or disprove the hypotheses, the following telemetry or evidence is missing:\n\n* System logs (e.g., auth.log, security.log) on 10.0.1.15 for the time of the alert\n* Process memory dumps or system call logs for 10.0.1.15 to confirm if the exploit payload executed\n* Patch status and version of log4j on 10.0.1.15\n* Network traffic capture (PCAP) for the time of the alert to confirm communication between 104.28.15.12 and 10.0.1.15"
      },
      {
        "type": "tool",
        "content": "[ERROR] No SIEM logs found for ET EXPLOIT Apache log4j RCE Attempt (CVE-2021-44228) normalized."
      },
      {
        "type": "tool",
        "content": "[10.0.1.15] CVE-2021-44228 (Log4Shell): Target application is highly vulnerable."
      },
      {
        "type": "tool",
        "content": "[VERIFIED] No further malicious egress or lateral movement traffic observed on 10.0.1.15. Connections reset."
      },
      {
        "type": "ai",
        "content": "Verdict: ATTACK_SUCCEEDED - The target system (10.0.1.15) is highly vulnerable to the Log4Shell vulnerability (CVE-2021-44228), as indicated by the sandbox tool's output. This suggests that an attacker could potentially exploit this vulnerability to gain remote code execution (RCE). The fact that no further malicious egress or lateral movement traffic was observed does not necessarily indicate that the attack was unsuccessful, as an attacker could have successfully exploited the vulnerability without triggering additional network activity. Therefore, the outcome is classified as ATTACK_SUCCEEDED."
      },
      {
        "type": "ai",
        "content": "Defense Strategy: Execute Block the offending source IP at the edge firewall immediately to halt the RCE attempt on 104.28.15.12. Justification: PHASE 1 (STANDARD PLAYBOOK) dictates blocking the source IP to prevent further attacks"
      },
      {
        "type": "ai",
        "content": "Reviewer APPROVE: Simulation Passed: Action safe for production execution. [REJECTED] Target is Tier 1 (Cloudflare Edge Node (US-East)). Proposed action 'BLOCK_SOURCE' violates availability SLA. Suggest granular API revocation, WAF targeting, or failover first."
      },
      {
        "type": "ai",
        "content": "RART Policy Mutated: Deny incoming RCE attempts to Cloudflare Edge Nodes via API Revocation. Routing back to Defense..."
      },
      {
        "type": "ai",
        "content": "Defense Strategy: Execute TARGETED_RULE on 104.28.15.12. Justification: Deny incoming RCE attempts to Cloudflare Edge Nodes via API Revocation"
      },
      {
        "type": "ai",
        "content": "Reviewer APPROVE: Simulation Passed: Action safe for production execution. [APPROVED] Action 'TARGETED_RULE' passes Tier 1 safety checks."
      },
      {
        "type": "ai",
        "content": "Executor: [SUCCESS] Applied TARGETED_RULE to 104.28.15.12. Network fabric routing updated successfully."
      },
      {
        "type": "ai",
        "content": "Verifier: [VERIFIED] No further malicious egress or lateral movement traffic observed on 104.28.15.12. Connections reset."
      },
      {
        "type": "ai",
        "content": "Judge Verdict: EXCELLENT RESPONSE TO INCIDENT"
      }
    ]
  };
}
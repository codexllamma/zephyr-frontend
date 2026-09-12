import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const finalGraphState = {
    incident_id: "ALT-9999",
    status: "COMPLETED",
    alert_signature: "CRITICAL: Successful SQL Injection and Data Exfiltration Detected",
    source_ip: "192.168.1.100",
    target_ip: "10.0.1.15",
    hypotheses: [
      "H1: Successful exploitation",
      "H2: Failed exploitation",
      "H3: False positive",
    ],
    evidence_gathered: [
      { tool: "check_vulnerability", result: "[10.0.1.15] CVE-2023-XXXX: Target vulnerable to SQLi" },
      { tool: "check_server_logs", result: "[10.0.1.15] HTTP 200 GET /search?q=' OR 1=1 -- ; DATABASE ERROR" },
    ],
    missing_evidence: [
      "Vulnerability status of target 10.0.1.15",
      "Server logs for target 10.0.1.15 confirming payload execution",
    ],
    confidence: 0.95,
    assessment_outcome: "ATTACK_SUCCEEDED",
    assessment_justification:
      "The presence of a database error in the HTTP response indicates that an SQL injection attack was successful, and data exfiltration is likely to have occurred.",
    proposed_action: "TARGETED_RULE",
    proposed_target: "SQL Injection and Data Exfiltration",
    action_justification:
      "To mitigate further unauthorized access and avoid collateral damage on shared subnets, a targeted rule will be created to block SQL injection at the application level.",
    reviewer_decision: "APPROVE",
    reviewer_feedback:
      "The proposed action of creating a TARGETED_RULE demonstrates a thorough understanding of organizational constraints by minimizing collateral damage.",
    execution_result:
      "[FAILED] Action TARGETED_RULE on SQL Injection and Data Exfiltration was blocked or unrecognized.",
    verification_result:
      "[VERIFIED] No further malicious SQLi traffic observed. Application is stable.",
    judge_scorecard: {
      investigation_score: 6,
      evidence_score: 4,
      decision_score: 8,
      response_score: 2,
      adaptation_score: 0,
      critical_feedback:
        "The SOC Judge Orchestrator found that incident response was delayed due to missing initial evidence. TARGETED_RULE was approved once logs confirmed execution.",
    },
  };

  const stream = new ReadableStream({
    async start(controller) {
      const writeEvent = async (data: object, delay: number) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        // 1. Intake
        await writeEvent(
          {
            node: "intake",
            msg: "Alert Ingested: CRITICAL: Successful SQL Injection and Data Exfiltration Detected (192.168.1.100 -> 10.0.1.15)",
            confidence: 0.15,
            incident_id: "ALT-9999",
            alert_signature: "CRITICAL: Successful SQL Injection and Data Exfiltration Detected",
            source_ip: "192.168.1.100",
            target_ip: "10.0.1.15",
          },
          400
        );

        // 2. Investigator
        await writeEvent(
          {
            node: "investigator",
            msg: "Formed 3 hypotheses (H1: Exploit, H2: Failed, H3: FP). Missing vuln status & DB execution logs.",
            confidence: 0.35,
            hypotheses: finalGraphState.hypotheses,
            missing_evidence: finalGraphState.missing_evidence,
          },
          1800
        );

        // 3. Evidence & RAG Tools
        await writeEvent(
          {
            node: "evidence",
            msg: "Executed check_vulnerability & check_server_logs: Confirmed CVE-2023-XXXX and HTTP 200 SQL error response.",
            confidence: 0.65,
            tool_calls: [
              { name: "check_vulnerability", result: "[10.0.1.15] CVE-2023-XXXX: Target application is vulnerable to SQL Injection." },
              { name: "check_server_logs", result: "[10.0.1.15] HTTP 200 GET /search?q=' OR 1=1 -- ; DATABASE ERROR: syntax error." },
            ],
          },
          2000
        );

        // 4. Assessment
        await writeEvent(
          {
            node: "assessment",
            msg: "Verdict: ATTACK_SUCCEEDED. Database error and payload reflection confirm remote execution.",
            confidence: 0.95,
            assessment_outcome: "ATTACK_SUCCEEDED",
            justification: finalGraphState.assessment_justification,
          },
          2000
        );

        // 5. Reviewer
        await writeEvent(
          {
            node: "reviewer",
            msg: "Reviewer APPROVE: Proposing TARGETED_RULE to prevent collateral damage on shared subnets.",
            confidence: 0.96,
            reviewer_decision: "APPROVE",
            proposed_action: "TARGETED_RULE",
            feedback: finalGraphState.reviewer_feedback,
          },
          2000
        );

        // 6. Executor
        await writeEvent(
          {
            node: "executor",
            msg: "Execution status: [FAILED] Action TARGETED_RULE was blocked or unrecognized by legacy firewall.",
            confidence: 0.96,
            execution_result: finalGraphState.execution_result,
          },
          1800
        );

        // 7. Verification
        await writeEvent(
          {
            node: "verification",
            msg: "Traffic verified: [VERIFIED] No further malicious SQLi traffic observed. Application is stable.",
            confidence: 0.98,
            verification_result: finalGraphState.verification_result,
          },
          1800
        );

        // 8. Judge Scorecard
        await writeEvent(
          {
            node: "judge",
            msg: "Judge Scorecard: Decision 8/10, Investigation 6/10, Evidence 4/10. Adaptation noted.",
            confidence: 0.98,
            judge_scorecard: finalGraphState.judge_scorecard,
          },
          1800
        );

        // 9. Strategy & RART
        await writeEvent(
          {
            node: "rart",
            msg: "RART Learned Strategy: Standard operational flow maintained. Retain targeted WAF policy.",
            confidence: 0.95,
            complete: true,
            status: "COMPLETED",
            graph_state: finalGraphState,
          },
          1800
        );
      } catch (error) {
        console.error("Stream error:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

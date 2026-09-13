import { NextRequest, NextResponse } from "next/server";
import scenariosData from "@/data/scenarios.json";
import { AttackScenario } from "@/types/simulation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scenarioId = searchParams.get("scenario") || "INC-001";
  
  const scenarios = (scenariosData.scenarios as AttackScenario[]) || [];
  const scenario = scenarios.find((s) => s.id === scenarioId) || scenarios[0];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const writeEvent = async (data: object, delay: number) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        // Stream telemetry logs
        for (const log of scenario.logs) {
          await writeEvent({ log }, 400);
        }

        // Stream LangGraph steps
        for (const step of scenario.graph_execution) {
          // 1. Node starts
          await writeEvent(
            {
              node_id: step.node_id,
              status: "active",
              persisted_memory:
                step.node_id === "rart" ? scenario.persisted_memory : undefined,
            },
            300
          );

          // 2. Node completes
          await writeEvent(
            {
              node_id: step.node_id,
              status: step.status,
              decision: step.decision,
            },
            step.duration_ms
          );
        }

        // Mark complete
        await writeEvent({ complete: true }, 200);
      } catch (error) {
        console.error("SSE stream error:", error);
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

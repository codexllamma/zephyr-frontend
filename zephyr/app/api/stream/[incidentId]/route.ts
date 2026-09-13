import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ incidentId: string }> | { incidentId: string } }
) {
  const params = await context.params;
  const incidentId = params.incidentId;

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8000";

  try {
    const backendResponse = await fetch(
      `${backendUrl}/stream/incident/${encodeURIComponent(incidentId)}`,
      {
        headers: {
          Accept: "text/event-stream",
        },
        cache: "no-store",
      }
    );

    if (!backendResponse.ok || !backendResponse.body) {
      return new NextResponse(
        `data: ${JSON.stringify({
          type: "error",
          error: `Backend responded with status ${backendResponse.status}`,
        })}\n\n`,
        {
          status: backendResponse.status,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        }
      );
    }

    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error(`Error proxying SSE stream for incident ${incidentId}:`, error);
    return new Response(
      `data: ${JSON.stringify({
        type: "error",
        error: error?.message || "Backend connection failed",
      })}\n\n`,
      {
        status: 502,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      }
    );
  }
}

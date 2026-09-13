import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const logsDirectory = path.join(process.cwd(), 'data', 'raw_logs');
  const searchParams = request.nextUrl.searchParams;
  const requestedId = searchParams.get('id');

  try {
    const files = await fs.readdir(logsDirectory);
    const incidentFiles = files.filter(file => file.toLowerCase().includes('inc') || file.includes('syslog'));

    if (incidentFiles.length === 0) {
      return new Response("No incident logs found in data/raw_logs.", { status: 404 });
    }

    let targetFileName = "";
    if (requestedId) {
      const match = incidentFiles.find(f => 
        f.toLowerCase().includes(requestedId.toLowerCase()) || 
        f.toLowerCase().includes(`inc-${requestedId.toLowerCase()}`) ||
        f.toLowerCase().includes(`inc-0${requestedId.toLowerCase()}`) ||
        f.toLowerCase().includes(`inc-00${requestedId.toLowerCase()}`)
      );
      if (match) {
        targetFileName = match;
      }
    }

    if (!targetFileName) {
      targetFileName = incidentFiles[Math.floor(Math.random() * incidentFiles.length)];
    }

    const filePath = path.join(logsDirectory, targetFileName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    const stream = new ReadableStream({
      async start(controller) {
        const initPayload = { 
          id: 'init', 
          message: `[SYSTEM] Injecting payload from: ${targetFileName}`, 
          type: 'system' 
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initPayload)}\n\n`));

        for (const line of lines) {
          let type = 'filler';
          if (line.includes('[CORE]')) type = 'alert';
          if (line.includes('[SYSTEM]') || line.includes('Llama') || line.includes('MCTS') || line.includes('DPO')) type = 'system';

          const delay = type === 'filler' ? Math.random() * 40 + 10 : Math.random() * 300 + 150;
          await new Promise(resolve => setTimeout(resolve, delay));

          const payload = {
            id: crypto.randomUUID(),
            message: line,
            type: type
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        }
        
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Error reading raw logs:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
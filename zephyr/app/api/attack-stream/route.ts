import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const encoder = new TextEncoder();
  const logsDirectory = path.join(process.cwd(), 'data', 'raw_logs');

  try {
    // Read all files in the raw_logs directory
    const files = await fs.readdir(logsDirectory);
    
    // Filter out hidden files (like .DS_Store) and grab the incident files
    const incidentFiles = files.filter(file => file.toLowerCase().includes('inc') || file.includes('syslog'));

    if (incidentFiles.length === 0) {
      return new Response("No incident logs found in data/raw_logs.", { status: 404 });
    }

    // Pick a random incident file
    const randomFileName = incidentFiles[Math.floor(Math.random() * incidentFiles.length)];
    const filePath = path.join(logsDirectory, randomFileName);

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    const stream = new ReadableStream({
      async start(controller) {
        // Announce the file being injected
        const initPayload = { 
          id: 'init', 
          message: `[SYSTEM] Injecting payload from: ${randomFileName}`, 
          type: 'system' 
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initPayload)}\n\n`));

        for (const line of lines) {
          let type = 'filler';
          if (line.includes('[CORE]')) type = 'alert';
          if (line.includes('[SYSTEM]') || line.includes('Llama') || line.includes('MCTS') || line.includes('DPO')) type = 'system';

          // Latency: fast for filler, slower for CORE/SYSTEM actions to show "processing"
          const delay = type === 'filler' ? Math.random() * 50 + 10 : Math.random() * 400 + 200;
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
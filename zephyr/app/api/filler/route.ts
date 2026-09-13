import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const logsDirectory = path.join(process.cwd(), 'data', 'raw_logs');

  try {
    const files = await fs.readdir(logsDirectory);
    const incidentFiles = files.filter(file => file.toLowerCase().includes('inc') || file.includes('syslog'));

    if (incidentFiles.length === 0) {
      return NextResponse.json({ logs: ["No logs found. Add files to data/raw_logs."] });
    }

    let allFillerLogs: string[] = [];

    // Shuffle the file list and grab up to 100 files at once
    // Reading 100 tiny text files takes Node.js literally ~5 milliseconds
    const filesToRead = incidentFiles.sort(() => 0.5 - Math.random()).slice(0, 50);

    // Read them all concurrently for maximum speed
    await Promise.all(filesToRead.map(async (fileName) => {
      const filePath = path.join(logsDirectory, fileName);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      const boringLines = fileContent.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed !== '' && !trimmed.includes('[CORE]') && !trimmed.includes('[SYSTEM]');
      });
      
      allFillerLogs.push(...boringLines);
    }));

    // Shuffle the massive pool so it's completely randomized
    const shuffledPool = allFillerLogs.sort(() => 0.5 - Math.random());

    return NextResponse.json({ logs: shuffledPool });
  } catch (error) {
    console.error("Error reading filler logs:", error);
    return NextResponse.json({ logs: ["systemd[1]: Default filler log..."] });
  }
}
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const preferencesPath = path.join(process.cwd(), 'data', 'preferences.jsonl');
    
    if (!fs.existsSync(preferencesPath)) {
      return NextResponse.json({ pairs: [] }, { status: 200 });
    }

    const content = fs.readFileSync(preferencesPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    const pairs = lines.map((line, index) => {
      try {
        const parsed = JSON.parse(line);
        return {
          id: parsed.metadata?.incident_id || `INC-${(index + 1).toString().padStart(3, '0')}`,
          ...parsed
        };
      } catch (e) {
        console.error("Error parsing line:", e);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ pairs, count: pairs.length });
  } catch (error) {
    console.error("Error reading preferences.jsonl:", error);
    return NextResponse.json({ error: "Failed to read preferences file", pairs: [] }, { status: 500 });
  }
}

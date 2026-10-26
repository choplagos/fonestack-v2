import { NextResponse } from 'next/server';
import type { StoreProduct } from '@/lib/productTypes'

export const runtime = 'edge';

type CompareRequest = {
  phones: Pick<StoreProduct, 'name'>[]
  profile?: string
}

export async function POST(req: Request) {
  try {
    const { phones, profile = 'basic' } = await req.json() as CompareRequest
    if (!Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json({ error: 'At least one phone is required.' }, { status: 400 })
    }

    // In production, we fetch from Claude/Gemini. 
    // Here we simulate the streaming structure Fonestack expects.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (delta: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
        };

        // Example logic for the structured JSON the frontend expects
        send('{"verdict": "Analyzing the specs... ",');
        send('"scores": [');
        phones.forEach((p, i) => {
          send(`{"name": "${p.name}", "value_score": ${70 + i * 5}, "score_reason": "Based on market demand."}${i === phones.length - 1 ? '' : ','}`);
        });
        send('],');
        send(`"recommendation": "The ${phones[0].name} wins for your ${profile} needs."}`);
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
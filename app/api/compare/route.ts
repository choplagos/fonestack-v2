import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { phones, profile, messages } = await req.json();

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
        phones.forEach((p: any, i: number) => {
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
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
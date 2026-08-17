export const runtime = 'edge';

const MODEL = 'gemini-2.5-flash';
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;

const PROFILES: Record<string, string> = {
  student:  'budget is very important, battery life matters, camera is a nice-to-have. Prioritize value for money.',
  business: 'reliability, battery life, and a clean display matter most. Performance and build quality are key.',
  creator:  'camera quality is the top priority — megapixels, video, night mode. Storage and display also matter.',
  gaming:   'processor speed, RAM, and battery are critical. Screen refresh rate and thermal performance matter.',
  basic:    'simplicity and call/WhatsApp quality are the only requirements. Price should be as low as possible.',
};

function buildSystemPrompt() {
  return `You are Fonestack's AI phone advisor — a trusted phone dealer in Computer Village, Ikeja, Lagos, Nigeria. Help Nigerian buyers compare phones. Be direct, practical, and Lagos-market savvy. Prices in ₦. Consider Nigerian realities: MTN/Airtel/Glo compatibility, WhatsApp usage, resale value in Lagos. Always end with a bold recommendation.`;
}

function buildComparePrompt(phones: any[], profile: string, messages: any[]) {
  const profileDesc = PROFILES[profile] || PROFILES.basic;
  const phoneBlocks = phones.map((p, i) => `PHONE ${i+1}: ${p.brand} ${p.name}\n  Price: ₦${Number(p.price).toLocaleString()}\n  Condition: ${p.status === 'used' ? 'Fairly Used' : 'Brand New'}\n  Storage: ${p.storage_gb ? p.storage_gb+'GB' : p.spec || 'N/A'}\n  RAM: ${p.ram_gb ? p.ram_gb+'GB' : 'N/A'}\n  Battery: ${p.battery_mah ? p.battery_mah+'mAh' : 'N/A'}\n  Camera: ${p.camera_mp ? p.camera_mp+'MP' : 'N/A'}`).join('\n\n');

  if (!messages || messages.length === 0) {
    return `Compare these ${phones.length} phones for a buyer whose profile is: ${profileDesc}\n\n${phoneBlocks}\n\nRespond in EXACT JSON format (no markdown):\n{"verdict":"2-3 sentence comparison","scores":[{"name":"Phone name","value_score":0-100,"score_reason":"one sentence"}],"pros_cons":[{"name":"Phone name","pros":["pro1"],"cons":["con1"]}],"recommendation":"One bold sentence naming the winner.","follow_up_hint":"One casual follow-up question"}`;
  }
  return `Context: Comparing ${phones.map(p => p.brand+' '+p.name).join(' vs ')}. Profile: ${profileDesc}.\n\nBuyer's question: "${messages[messages.length-1].content}"\n\nAnswer in 2-3 sentences max. Be direct and Lagos-practical.`;
}

export async function OPTIONS() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

  const { phones, profile = 'basic', messages = [] } = await req.json();
  if (!phones || phones.length < 2) return Response.json({ error: 'At least 2 phones required' }, { status: 400 });

  const isFirstMessage = messages.length === 0;
  const userPrompt = buildComparePrompt(phones, profile, messages);
  const geminiContents = isFirstMessage
    ? [{ role: 'user', parts: [{ text: userPrompt }] }]
    : [
        { role: 'user', parts: [{ text: buildComparePrompt(phones, profile, []) }] },
        ...messages.slice(0, -1).map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ];

  const geminiRes = await fetch(GEMINI_API, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({ contents: geminiContents, systemInstruction: { parts: [{ text: buildSystemPrompt() }] }, generationConfig: { maxOutputTokens: 1024 } }),
  });

  if (!geminiRes.ok) return Response.json({ error: 'Gemini API error' }, { status: 502 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop()!;
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (!data) continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
              if (parsed.candidates?.[0]?.finishReason) controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            } catch { /* skip malformed */ }
          }
        }
      } finally { controller.close(); }
    }
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' } });
}
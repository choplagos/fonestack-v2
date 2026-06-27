export const runtime = 'edge';

const MODEL = 'gemini-2.5-flash';
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const GRADE_DESC: Record<string, string> = {
  A: 'Excellent condition, like new, no visible wear or damage.',
  B: 'Good condition, light wear (minor scuffs/scratches), fully functional.',
  C: 'Fair condition, visible wear (scratches, dents, or marks), fully functional unless stated otherwise.',
};

function buildSystemPrompt() {
  return `You are Fonestack's AI trade-in valuator — a trusted phone dealer in Computer Village, Ikeja, Lagos, Nigeria. You estimate fair trade-in value for used phones in the Nigerian (Lagos) resale market, in Naira (₦). Be realistic: Nigerian resale prices for used phones are generally lower than international resale platforms. Consider brand resale demand in Nigeria (iPhones and Samsung hold value best; Tecno/Infinix/Itel depreciate faster), storage size, condition grade, and any red flags the seller mentions (e.g. battery health issues, screen damage, signs of repair, iCloud/Google lock risk). Always respond ONLY with valid JSON, no markdown, no commentary outside the JSON.`;
}

function buildUserPrompt(body: any) {
  const gradeDesc = GRADE_DESC[body.condition_grade] || GRADE_DESC.B;
  return `Estimate the trade-in value for this phone in the Lagos, Nigeria market:

Brand: ${body.brand}
Model: ${body.model}
Storage: ${body.storage_gb ? body.storage_gb + 'GB' : 'Not specified'}
Condition grade: ${body.condition_grade} — ${gradeDesc}
Seller's own description: "${body.condition_description || 'None provided'}"
Has original box: ${body.has_box ? 'Yes' : 'No'}
Has charger: ${body.has_charger ? 'Yes' : 'No'}

Respond in EXACT JSON format (no markdown, no backticks):
{"estimate_low": <number, Naira>, "estimate_high": <number, Naira>, "confidence": "High" | "Medium" | "Low", "reasoning": "2-3 sentence explanation of how you arrived at this range, referencing brand resale demand, condition, and any relevant factors", "red_flags": "1 sentence flagging a specific risk or concern, OR the JSON value null if there is genuinely nothing to flag — never write a sentence saying there are no red flags"}`;
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.brand || !body.model) {
    return Response.json({ error: 'Brand and model are required' }, { status: 400 });
  }

  const geminiRes = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: buildUserPrompt(body) }] }],
      systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
      generationConfig: { maxOutputTokens: 1024, responseMimeType: 'application/json' },
    }),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => '');
    return Response.json({ error: 'Gemini API error', detail: errText.slice(0, 500) }, { status: 502 });
  }

  const geminiData = await geminiRes.json();
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
  const finishReason = geminiData.candidates?.[0]?.finishReason;

  if (!rawText) {
    return Response.json({ error: 'No estimate returned by AI', finishReason }, { status: 502 });
  }

  // Strip markdown code fences if the model added them despite instructions,
  // and trim to the outermost { ... } in case of stray leading/trailing text.
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return Response.json(
      { error: 'Could not parse AI estimate', raw: rawText.slice(0, 800), finishReason },
      { status: 502 }
    );
  }

  if (typeof parsed.estimate_low !== 'number' || typeof parsed.estimate_high !== 'number') {
    return Response.json({ error: 'Malformed AI estimate', raw: rawText.slice(0, 800) }, { status: 502 });
  }

  // The model sometimes answers red_flags with a "no issues found" sentence
  // instead of omitting the field. Treat those as no flag at all so the
  // warning UI doesn't render a flag that says there is no flag.
  if (typeof parsed.red_flags === 'string') {
    const noFlagPattern = /^(none|no\s|n\/a)/i;
    if (!parsed.red_flags.trim() || noFlagPattern.test(parsed.red_flags.trim())) {
      delete parsed.red_flags;
    }
  }

  return Response.json(parsed, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
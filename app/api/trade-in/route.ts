export const runtime = 'edge';

const MODEL = 'gemini-2.5-flash';
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dzfabutfltonedhhcmbc.supabase.co';

function buildPrompt({ brand, model, storage_gb, condition_description, condition_grade, has_box, has_charger }: any) {
  return `You are Fonestack's trade-in valuation assistant. Fonestack is a phone dealer in Computer Village, Ikeja, Lagos, Nigeria, buying used phones to resell as "Fairly Used" stock.

Estimate a realistic TRADE-IN value range (in Nigerian Naira, ₦) for this phone, using Google Search to check current Nigerian/Computer Village market resale prices. Trade-in value should be noticeably LOWER than retail resale price.

Phone: ${brand} ${model}
Storage: ${storage_gb ? storage_gb + 'GB' : 'Not specified'}
Condition: ${condition_description || 'Not described'}
Grade: ${condition_grade || 'Not specified'} (A=Excellent, B=Good, C=Fair)
Has box: ${has_box ? 'Yes' : 'No'}
Has charger: ${has_charger ? 'Yes' : 'No'}

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "estimate_low": 180000,
  "estimate_high": 240000,
  "reasoning": "2-3 sentence explanation referencing condition, storage, and current market comparables",
  "confidence": "medium",
  "red_flags": ""
}`;
}

export async function OPTIONS() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 });

  const body = await req.json();
  const { customer_name, customer_phone, brand, model, storage_gb, condition_description, condition_grade, has_box = false, has_charger = false } = body;

  if (!customer_name || !customer_phone || !brand || !model) {
    return Response.json({ error: 'customer_name, customer_phone, brand, and model are required' }, { status: 400 });
  }

  const geminiRes = await fetch(`${GEMINI_API}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: buildPrompt({ brand, model, storage_gb, condition_description, condition_grade, has_box, has_charger }) }] }],
      tools: [{ google_search: {} }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.2, thinkingConfig: { thinkingBudget: 1024 } },
    }),
  });

  if (!geminiRes.ok) return Response.json({ error: 'Gemini API error' }, { status: 502 });

  const geminiData = await geminiRes.json();
  const rawText = geminiData.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
  let cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const fb = cleaned.indexOf('{'), lb = cleaned.lastIndexOf('}');
  if (fb !== -1 && lb !== -1) cleaned = cleaned.slice(fb, lb + 1);

  let estimate;
  try { estimate = JSON.parse(cleaned); } catch { return Response.json({ error: 'Could not parse response', raw: rawText }, { status: 502 }); }

  const low = Math.max(0, Number(estimate.estimate_low) || 0);
  const high = Math.max(low, Number(estimate.estimate_high) || low);

  await fetch(`${SUPABASE_URL}/rest/v1/trade_in_requests`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ customer_name, customer_phone, brand, model, storage_gb: storage_gb || null, condition_description: condition_description || null, condition_grade: condition_grade || null, has_box, has_charger, estimate_low: low, estimate_high: high, estimate_reasoning: estimate.reasoning || null, estimate_confidence: estimate.confidence || 'medium', status: 'pending' }),
  });

  return Response.json({ estimate_low: low, estimate_high: high, reasoning: estimate.reasoning || '', confidence: estimate.confidence || 'medium', red_flags: estimate.red_flags || '' });
}
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// This makes the API run at the edge (faster for Lagos users)
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { phones, profile } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Custom prompt for Fonestack's Liquid Glass UI
    const prompt = `
      You are a world-class smartphone expert at Fonestack, Lagos. 
      Compare these phones: ${JSON.stringify(phones)}.
      The user profile is: ${profile}.
      
      Return a JSON object with exactly this structure:
      {
        "verdict": "A 2-sentence expert summary",
        "scores": [{"name": "phone name", "value_score": 85, "score_reason": "why"}],
        "recommendation": "Final advice for this specific user"
      }
      Do not include markdown formatting or backticks.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the string in case Gemini adds backticks
    const cleanJson = text.replace(/```json|```/gi, "").trim();

    return new Response(`data: ${JSON.stringify({ delta: cleanJson })}\n\ndata: [DONE]\n\n`, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "AI Analysis failed" }, { status: 500 });
  }
}

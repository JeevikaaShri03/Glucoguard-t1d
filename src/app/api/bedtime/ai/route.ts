import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

//const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { glucose, iob, carbs, riskLevel } = await req.json();

    const prompt = `
You are a Type 1 Diabetes AI Safety Assistant specializing in bedtime safety.
Analyze the user's bedtime metrics:
- Blood Glucose: ${glucose} mg/dL
- Active Insulin on Board (IOB): ${iob} U
- Bedtime Snack Carbs: ${carbs} g
- Calculated Risk Level: ${riskLevel}

Provide concise, friendly, and clinical safety guidance (2-3 sentences max):
1. Explain briefly why their risk is at this level given their BG and IOB.
2. Recommend specific snack compositions (e.g., fast-acting carbs + protein/fats like peanut butter toast or milk) if carbs are needed.
`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return NextResponse.json({
      success: true,
      aiAdvice: response.text,
    });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
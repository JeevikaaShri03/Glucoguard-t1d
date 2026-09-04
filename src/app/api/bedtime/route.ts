// src/app/api/bedtime/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { bedtimeResponseSchema } from "@/src/types";

//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // If client passes specific values, use them; otherwise default to latest logged telemetry
    const glucoseReadings = body.glucoseReadings || [140, 130, 125, 110];
    const iobUnits = body.iobUnits ?? 1.8;
    const lateCarbsGrams = body.lateCarbsGrams ?? 0;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: bedtimeResponseSchema,
      },
    });

    const prompt = `
      You are the Bedtime Risk Agent for GlucoGuard T1D.
      Evaluate the patient's evening telemetry from their recent log entries:
      - 6-Hour Glucose History: ${JSON.stringify(glucoseReadings)}
      - Active Insulin on Board (IOB): ${iobUnits} Units
      - Late Carbs: ${lateCarbsGrams}g

      1. Calculate Risk Score (0-100).
      2. Categorize: safe (0-30), mild_risk (31-60), high_hypo_risk (61-100).
      3. Recommend snack or action.
      Return JSON only.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const agentResult = JSON.parse(response.text());

    return NextResponse.json({ success: true, data: agentResult });

  } catch (error: any) {
    console.error("Bedtime Agent Error:", error);
    return NextResponse.json(
      { error: "Bedtime evaluation failed.", details: error.message },
      { status: 500 }
    );
  }
}
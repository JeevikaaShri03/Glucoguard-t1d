// src/app/api/snap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in environment variables." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      You are the Snap & Count Agent for GlucoGuard T1D, a Type 1 Diabetes management app.
      Analyze this image. If it contains food, a meal, or a beverage (including mixed dishes like Biryani, South Indian meals, curries, etc.), identify the components, estimate their carbohydrates in grams, glycemic index (GI), and calculate total carbs and glycemic load.
      
      You MUST return a valid JSON object matching this exact schema:
      {
        "food_items": [
          {
            "name": "string",
            "portion": "string",
            "carbs_g": number,
            "gi": "Low" | "Medium" | "High"
          }
        ],
        "total_carbs_g": number,
        "glycemic_load": "Low" | "Medium" | "High",
        "predicted_spike": "string (e.g. '+30 to +50 mg/dL')",
        "peak_time": "string (e.g. '45-60 mins')",
        "spike_warning": "string",
        "confidence": "low" | "medium" | "high"
      }

      If the image is completely NOT food (e.g. a building, architectural plan, car, person, landscape, document, or random object), return an empty array for "food_items" and set "total_carbs_g" to 0.
    `;

    const payload = [
      prompt,
      {
        inlineData: {
          mimeType: file.type || "image/jpeg",
          data: base64Data,
        },
      },
    ];

    const model = genAI.getGenerativeModel({
      model: "gemini-3.7-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(payload);
    const responseText = result.response.text();

    let agentResult;
    try {
      const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
      agentResult = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw response was:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    if (!agentResult.food_items || !Array.isArray(agentResult.food_items) || agentResult.food_items.length === 0) {
      return NextResponse.json(
        { error: "Please provide valid food pictures." },
        { status: 400 }
      );
    }

    let totalCarbs = Number(agentResult.total_carbs_g) || 0;
    if (totalCarbs === 0) {
      totalCarbs = agentResult.food_items.reduce((sum: number, item: any) => sum + (Number(item.carbs_g) || 0), 0);
      agentResult.total_carbs_g = totalCarbs;
    }

    return NextResponse.json({ success: true, data: agentResult });

  } catch (error: any) {
    console.error("Snap Agent API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image." },
      { status: 500 }
    );
  }
}
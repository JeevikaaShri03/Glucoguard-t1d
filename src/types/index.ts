// src/types/index.ts
// src/types/gemini.ts
import { Schema, SchemaType } from "@google/generative-ai";

export const snapAgentResponseSchema: Schema = {
  description: "T1D Food Analysis Schema for GlucoGuard",
  type: SchemaType.OBJECT,
  properties: {
    food_items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          portion: { type: SchemaType.STRING },
          carbs_g: { type: SchemaType.NUMBER },
          gi: { 
            type: SchemaType.STRING, 
            description: "Glycemic Index: Low, Medium, or High" 
          },
        },
        required: ["name", "portion", "carbs_g", "gi"],
      },
    },
    total_carbs_g: { type: SchemaType.NUMBER },
    glycemic_load: { 
      type: SchemaType.STRING, 
      description: "Overall Glycemic Load" 
    },
    predicted_spike: { 
      type: SchemaType.STRING, 
      description: "e.g., '+45 to +75 mg/dL'" 
    },
    peak_time: { 
      type: SchemaType.STRING, 
      description: "e.g., '60–90 minutes post-meal'" 
    },
    spike_warning: { type: SchemaType.STRING },
    confidence: { 
      type: SchemaType.STRING, 
      description: "AI confidence level: low, medium, high" 
    },
  },
  required: [
    "food_items",
    "total_carbs_g",
    "glycemic_load",
    "predicted_spike",
    "peak_time",
    "spike_warning",
    "confidence",
  ],
};

// Optional: Define a TypeScript interface for use in your Frontend Components
export interface SnapAgentResult {
  food_items: Array<{
    name: string;
    portion: string;
    carbs_g: number;
    gi: "Low" | "Medium" | "High";
  }>;
  total_carbs_g: number;
  glycemic_load: "Low" | "Medium" | "High";
  predicted_spike: string;
  peak_time: string;
  spike_warning: string;
  confidence: "low" | "medium" | "high";
}
export interface MealTimingOption {
  id: string;
  label: string;
}

export type MealTimingId = "fasting" | "pre_lunch" | "post_lunch" | "bedtime";

export const bedtimeResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    risk_score: { type: SchemaType.NUMBER },
    risk_category: { type: SchemaType.STRING }, // safe, mild_risk, high_hypo_risk
    predicted_drop_velocity: { type: SchemaType.STRING },
    active_iob_units: { type: SchemaType.NUMBER },
    recommendation: { type: SchemaType.STRING },
    suggested_snack: {
      type: SchemaType.OBJECT,
      properties: {
        carbs_g: { type: SchemaType.NUMBER },
        description: { type: SchemaType.STRING },
      },
      required: ["carbs_g", "description"],
    },
    reasoning_summary: { type: SchemaType.STRING },
  },
  required: [
    "risk_score",
    "risk_category",
    "predicted_drop_velocity",
    "active_iob_units",
    "recommendation",
    "suggested_snack",
    "reasoning_summary",
  ],
};
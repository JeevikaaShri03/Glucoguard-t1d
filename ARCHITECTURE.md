Markdown# 🩸 GlucoGuard T1D — Architecture Document

> **Patchamomma 2026 | AI-Native Decision-Support for Type 1 Diabetes**

---

## 💙 Why I'm Building This — A Personal Mission

> *"I am a Type 1 Diabetes survivor. I know what it feels like — the midnight lows that wake you in cold sweat, the constant finger pricks, the fear that one wrong carb count could send you to the ER. I've lived it. And I know thousands of children and adults live it every single day."*

**GlucoGuard T1D isn't just a hackathon project — it's personal.**

I'm building this because:

- 🧒 **Children with T1D deserve to sleep without fear.** Nocturnal hypoglycemia (nighttime lows) is one of the most dangerous and terrifying aspects of T1D. Parents stay up all night checking blood sugar. Kids wake up shaking. It doesn't have to be this way.

- 💰 **Not everyone can afford a CGM.** Continuous Glucose Monitors (CGMs) like Dexcom G7 or Freestyle Libre cost **₹5,000–₹15,000/month** — an impossible expense for most Indian families. GlucoGuard provides a **free, AI-powered alternative** that uses manual logging + intelligent prediction to deliver similar overnight safety alerts, **without the hardware cost.**

- 🤖 **AI Agents can save lives, today.** By combining Gemini 2.5's multimodal AI Agent workflows with simple manual inputs, we can predict dangerous overnight glucose drops and post-meal sugar spikes **before they happen** — and alert the user to eat a snack, adjust insulin, or call for help.

- 🌍 **Every T1D warrior deserves to live happily.** Whether you're a 7-year-old diagnosed last month or a 40-year-old managing it for decades, this tool is built to make your daily life easier, safer, and less stressful.

### The Core Promise

┌──────────────────────────────────────────────────────────────────────────┐│                                                                          ││   🎯  "An affordable, AI-powered guardian for every T1D warrior —        ││        preventing nighttime lows, replacing expensive CGMs with          ││        autonomous AI Agents, and helping children & adults               ││        live their lives without fear."                                   ││                                                                          │└──────────────────────────────────────────────────────────────────────────┘
### GlucoGuard vs CGM — Affordability & Capability Comparison

| Feature                        | Traditional CGM (Dexcom/Libre) | GlucoGuard T1D (This Project)    |
| ------------------------------ | ------------------------------ | -------------------------------- |
| Monthly Cost                   | ₹5,000 – ₹15,000               | **₹0 (Free)**                    |
| Hardware Required              | Sensor + Transmitter           | **Smartphone only**              |
| Nighttime Hypo Alerts          | ✅ Yes (real-time continuous)  | ✅ Yes (AI Agent Bedtime Model)  |
| Carb & Glycemic Estimation     | ❌ Not included                | ✅ Vision Agent (Snap & Count)   |
| Sugar Spike Prediction         | ❌ Passive trend arrows only   | ✅ Proactive Spike & Peak Forecast |
| Clinic Reports                 | ✅ Basic PDF export            | ✅ Detailed analytics + PDF      |
| Insulin Tracking               | ❌ Separate app needed         | ✅ Built-in agent workflow       |
| Accessibility                  | Limited (cost barrier)         | **Universal (web-based, free)**  |

> **Note:** GlucoGuard is NOT a replacement for medical devices — it's an **AI decision-support companion** for those who cannot access or afford CGMs. Always consult your endocrinologist.

---

## 📋 Table of Contents

1. [Why I'm Building This](#-why-im-building-this--a-personal-mission)
2. [Abstract](#abstract)
3. [Problem Statement](#problem-statement)
4. [Solution Overview](#solution-overview)
5. [🤖 AI Agent Architecture](#-ai-agent-architecture)
6. [Key Technology Stack](#key-technology-stack)
7. [UI Design Philosophy](#-ui-design-philosophy--beautiful-ui)
8. [System Architecture Flow](#system-architecture-flow)
9. [Core Agent & Execution Modules](#core-agent--execution-modules)
10. [Cloud Connection & Authentication](#cloud-connection--authentication)
11. [Project Folder Structure](#project-folder-structure)
12. [API Route Map](#api-route-map)
13. [Data Models (Firestore)](#data-models-firestore)
14. [Environment Variables](#environment-variables)
15. [Getting Started (Local Dev)](#getting-started-local-dev)
16. [Deployment (Cloud Run)](#deployment-cloud-run)
17. [Future Roadmap](#future-roadmap)

---

## Abstract

**GlucoGuard T1D** is an AI-native decision-support platform built on specialized **AI Agents** designed for **Type 1 Diabetes** management. It combines:

- ⏱️ Real-time daily logging of blood glucose, insulin, and meals
- 📸 **Snap & Count Vision Agent** for carb breakdown, Glycemic Load, and blood sugar spike prediction
- 🌙 **Bedtime Risk Agent** for nocturnal hypoglycemia prediction
- 🚨 Automated dual-phase alerting
- 📊 Long-term BigQuery analytics & exportable clinic reports

---

## Problem Statement

Type 1 Diabetes management demands **continuous manual tracking** of complex variables:

| Challenge                        | Risk                                                              |
| -------------------------------- | ----------------------------------------------------------------- |
| Blood glucose monitoring         | Missed readings → delayed treatment decisions                     |
| Insulin dose tracking            | Incorrect dosing → hypo/hyperglycemia episodes                    |
| Meal carbohydrate estimation     | Inaccurate carb counts → dangerous insulin miscalculations        |
| Unpredicted sugar spikes         | High GI foods → postprandial hyperglycemia & arterial stress      |
| Nocturnal hypoglycemia detection | Low blood sugar during sleep → seizures, loss of consciousness    |
| **CGM affordability gap**        | **₹5K–15K/month cost → majority of T1D patients go unmonitored** |

---

## Solution Overview

An integrated **Next.js web application** leveraging autonomous AI Agents:

- **Gemini 2.5 Flash Agent Workflows (`@google/genai`)** for vision-based nutrition calculation, glycemic load analysis, sugar spike forecasts, and bedtime risk modeling
- **Google Cloud serverless infrastructure** for secure storage and trend analytics
- **Firebase** for authentication and real-time database state

┌──────────────────────────────────────────────────────────────────────────────┐│                              GlucoGuard T1D                                  ││                                                                              ││  📸 Snap & Count Agent   🩸 Smart Logs   🌙 Bedtime Agent   📊 Reports       ││           │                   │                 │                │           ││     Gemini Vision         Firestore       Gemini Agent       BigQuery        ││  (Carbs, GI & Spike)                      (Hypo Predict)                     │└──────────────────────────────────────────────────────────────────────────────┘
---

## 🤖 AI Agent Architecture

GlucoGuard T1D transitions from standard prompt completions to **Autonomous AI Agent Workflows** via `@google/genai` (Gemini 2.5). Each agent operates as a domain specialist with defined toolsets and clinical guardrails.

              ┌─────────────────────────────────┐
              │      User Input / Trigger       │
              └────────────────┬────────────────┘
                               │
     ┌─────────────────────────┴─────────────────────────┐
     ▼                                                   ▼
┌──────────────────────────────┐            ┌──────────────────────────────┐│  Snap & Count Vision Agent   │            │     Bedtime Risk Agent       ││  (Nutrition & Spike AI)      │            │     (Clinical Safety AI)     │├──────────────────────────────┤            ├──────────────────────────────┤│ • Identifies meal components │            │ • Analyzes 6-hr log history  ││ • Calculates Carbs & GI/GL   │            │ • Estimates Active IOB       ││ • Forecasts Glucose Spike    │            │ • Predicts Nocturnal Drop    ││ • Recommends Bolus Timing    │            │ • Advises Preventative Snack │└──────────────┬───────────────┘            └──────────────┬───────────────┘│                                           │└───────────────────┬───────────────────────┘▼┌───────────────────────────────┐│  Beautiful UI Agent Primitives││  (Thinking State & HITL Card) │└───────────────────────────────┘
### Agent Specification Matrix

| Agent Name | Role / Specialist | Primary Inputs | Agent Output & Capabilities |
| --- | --- | --- | --- |
| **Snap & Count Agent** | Vision & Glycemic Specialist | Plate photo / Food image | Identifies foods, calculates total carbs ($g$), estimates Glycemic Load (GL), forecasts peak sugar spike ($\text{mg/dL}$), peak time window, and bolus timing advice. |
| **Bedtime Risk Agent** | Clinical Safety & Hypo Specialist | 6-hour history (Glucose trends, active insulin, late carbs) | Evaluates nocturnal hypoglycemia risk at 10:00 PM (Score 0–100), recommends preventative complex carb snacks, and triggers dual-phase alarms. |

---

## Core Agent & Execution Modules

### Module 1: 📸 Snap & Count Agent (Nutrition & Sugar Spike Predictor)

Upload a food photo to let the **Snap & Count Agent** run a multi-step vision and glycemic evaluation.

**Agent Schema Output:**
```json
{
  "food_items": [
    { "name": "Steamed White Rice", "portion": "1 cup (150g)", "carbs_g": 45, "gi": "High" },
    { "name": "Dal Fry", "portion": "1 bowl (200ml)", "carbs_g": 18, "gi": "Medium" }
  ],
  "total_carbs_g": 63,
  "glycemic_load": "High",
  "predicted_spike": "+50 to +80 mg/dL",
  "peak_time": "60–90 minutes post-meal",
  "spike_warning": "High simple carb load detected. Consider a pre-meal bolus 15 minutes before eating to blunt the peak.",
  "confidence": "high"
}
Flow:User uploads plate photo 
   ↓
Agent processes image via Gemini 2.5 Flash Vision 
   ↓
Agent calculates carb breakdown, GI/GL, and projected glucose spike (+mg/dL)
   ↓
Beautiful UI Approval Card displays results for Human-in-the-Loop review
   ↓
User confirms/adjusts → Saves directly to Firestore daily log
Module 2: 🌙 10:00 PM Bedtime Risk AgentEvaluates evening data to protect T1D patients from nocturnal hypoglycemia during sleep.Input Data Evaluated by Agent:6-hour glucose history (readings & direction)Active Insulin on Board (IOB)Carbohydrate intake since dinnerHistorical nocturnal drop velocityAgent Output Risk Categories:Risk LevelScore RangeAction & Recommendation✅ Safe0 – 30No action needed. Glucose predicted to stay in-range overnight.⚠️ Mild Risk31 – 60Suggestion: Consume a 10–15g complex carb snack (e.g., peanut butter on whole wheat).🔴 High Hypo Risk61 – 100Alert: Consume 15–20g fast-acting carbs immediately. Recheck in 15 minutes.
Module 3: 🩸 Smart Daily LogInteractive form for capturing daily diabetes telemetry with direct integration from AI Agent outputs.FieldTypeDetailsBlood GlucosenumberReading in mg/dLMeal ContextselectBreakfast / Lunch / Dinner / Snack / FastingCarb CountnumberEstimated carbohydrate grams (Auto-filled by Snap & Count Agent)Glycemic LoadstringLow / Medium / High (Provided by Agent)Spike ForecaststringPredicted glucose spike in mg/dLInsulin UnitsnumberRapid-acting / Long-acting insulin doseTimestampdatetimeAuto-captured or user-adjusted
Module 4: 🚨 Dual-Phase Alarm SystemWeb notifications triggered when the Bedtime Risk Agent detects unsafe overnight trajectories.PhaseTriggerActionPhase 1: SoftRisk score 31–60 (Mild Risk)In-app notification bannerPhase 2: UrgentRisk score 61–100 (High Risk)Persistent alert + sound + vibration via Web Audio API
Module 5: 📊 Doctor / Clinic ReportQueries BigQuery for historical trend data and exports clinical metrics (Time-in-Range, average glucose, standard deviation, hypo/hyper event counts) into a downloadable PDF report.🎨 UI Design Philosophy — Beautiful UIGlucoGuard's interface is built around Beautiful UI primitives for AI-native agent workflows.Beautiful UI Agent PrimitivesPrimitiveUsage in GlucoGuard T1DThinking StateShimmer & pulse state while Snap & Count Agent processes food photos and calculates spike projections.Approval Card (Human-in-the-Loop)Allows the user to inspect, edit, and approve AI-generated carb counts and spike warnings before writing to Firestore.Recommendation CardDisplays actionable clinical advice from the Bedtime Risk Agent (e.g., "Eat 15g complex carbs before sleep").Streaming TextStreams real-time AI logic during complex multi-step risk evaluations.Key Technology StackFrontend & Agent LayerTechnologyPurposeNext.js 16App Router full-stack frameworkReact 19Component-based UI libraryTailwind CSS 4Utility-first stylingGemini API (@google/genai)Vision & Bedtime AI Agent Workflows (Gemini 2.5 Flash)TypeScriptType-safe developmentBackend & Cloud LayerTechnologyPurposeFirebase Auth & FirestoreAuthentication & Real-time NoSQL databaseGoogle Cloud RunServerless hosting for Next.js API routesGoogle BigQueryAnalytics data warehouse for clinic reportsFirebase StorageImage storage for meal photos📁 Project Folder StructurePlaintextglucoguard-t1d/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Main Dashboard UI
│   │   └── api/
│   │       ├── log/route.ts            # Daily Log CRUD
│   │       ├── snap/route.ts           # Snap & Count AI Agent (Vision, Carbs & Spikes)
│   │       ├── bedtime/route.ts        # Bedtime Risk AI Agent
│   │       └── reports/route.ts        # BigQuery Analytics & PDF
│   ├── components/
│   │   ├── SnapAndCountCard.tsx        # Agent UI with Beautiful UI primitives
│   │   ├── DailyLogForm.tsx            # Form integrated with Agent auto-fill
│   │   ├── BedtimeAlertCard.tsx        # Nightly risk visualization
│   │   └── UI/                         # Base UI components
│   └── lib/
│       ├── firebase.ts                 # Firebase client config
│       ├── gemini.ts                   # @google/genai initialization
│       └── bigquery.ts                 # BigQuery client setup
├── .env.local                          # Environment variables
└── ARCHITECTURE.md                     # System Architecture Document
API Route MapMethodEndpointModuleDescriptionPOST/api/logSmart Daily LogSave new glucose/insulin entryGET/api/logSmart Daily LogFetch user log historyPOST/api/snapSnap & Count AgentSend food image → Returns carbs, GI, and predicted sugar spikePOST/api/bedtimeBedtime Risk AgentEvaluate 6-hr history → Returns bedtime hypo risk score & adviceGET/api/reportsClinic ReportFetch BigQuery trend analytics & generate PDFData Models (Firestore)Collection: users/{uid}/logsTypeScriptinterface GlucoseLog {
  id: string;
  glucoseLevel: number;        // mg/dL
  mealContext: "breakfast" | "lunch" | "dinner" | "snack" | "fasting";
  carbsGrams: number;
  glycemicLoad?: "Low" | "Medium" | "High";
  predictedSpike?: string;     // e.g., "+40 to +70 mg/dL"
  insulinUnits: number;
  insulinType: "rapid" | "long-acting";
  imageUrl?: string;
  timestamp: Timestamp;
}
Collection: users/{uid}/predictionsTypeScriptinterface BedtimePrediction {
  id: string;
  date: string;                // YYYY-MM-DD
  riskScore: number;           // 0–100
  riskCategory: "safe" | "mild_risk" | "high_hypo_risk";
  recommendation: string;
  createdAt: Timestamp;
}
Environment VariablesCode snippet# Gemini API (@google/genai)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=glucoguard-t1d-505614.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=glucoguard-t1d-505614
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=glucoguard-t1d-505614.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Cloud Project
GOOGLE_CLOUD_PROJECT=glucoguard-t1d-505614
BIGQUERY_DATASET=glucoguard_analytics
Getting Started (Local Dev)Bash# 1. Clone repository & install dependencies
git clone <repo-url>
cd glucoguard-t1d
npm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Run development server
npm run dev
License & AcknowledgmentsBuilt with Google Gemini 2.5 (@google/genai)UI inspired by Beautiful UI (beautifului.dev)Developed for Patchamomma 2026"Built with ❤️ and lived experience — for the T1D community worldwide."
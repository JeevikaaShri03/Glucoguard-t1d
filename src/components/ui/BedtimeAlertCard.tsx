"use client";

import React, { useState } from "react";
import { Moon, ShieldAlert, ShieldCheck, RefreshCw, Cookie, Activity, Volume2 } from "lucide-react";

export interface BedtimeData {
  risk_score: number;
  risk_category: "safe" | "mild_risk" | "high_hypo_risk";
  predicted_drop_velocity: string;
  active_iob_units: number;
  recommendation: string;
  suggested_snack: { carbs_g: number; description: string };
  reasoning_summary: string;
}

export default function BedtimeAlertCard() {
  const [currentGlucose, setCurrentGlucose] = useState<number>(110);
  const [iobUnits, setIobUnits] = useState<number>(1.8);
  const [lateCarbs, setLateCarbs] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [bedtimeResult, setBedtimeResult] = useState<BedtimeData | null>(null);

  // Web Audio API Synthesizer Alarm for High Risk
  const triggerAudioAlarm = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Pitch A5
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5); // Plays alert tone for 1.5s
  };

  
  const runEvaluation = async () => {
    setIsEvaluating(true);
    setBedtimeResult(null);

    try {
      const res = await fetch("/api/bedtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          glucoseReadings: [145, 132, 120, currentGlucose],
          iobUnits,
          lateCarbsGrams: lateCarbs,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBedtimeResult(json.data);
        
        // Trigger Audio Alarm if High Risk
        if (json.data.risk_category === "high_hypo_risk") {
          triggerAudioAlarm();
        }
      } else {
        alert("Failed evaluation: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to Bedtime Agent.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm transition-colors space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              10:00 PM Bedtime Risk Guardian
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Nocturnal hypoglycemia risk assessment using active IOB and 6-hr trajectory.
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
              Bedtime Glucose (mg/dL)
            </label>
            <input
              type="number"
              value={currentGlucose}
              onChange={(e) => setCurrentGlucose(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
              Active Insulin (IOB Units)
            </label>
            <input
              type="number"
              step="0.1"
              value={iobUnits}
              onChange={(e) => setIobUnits(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
              Late Snack (Carb Grams)
            </label>
            <input
              type="number"
              value={lateCarbs}
              onChange={(e) => setLateCarbs(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={runEvaluation}
          disabled={isEvaluating}
          className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Activity className="w-4 h-4" />
          <span>Assess Nocturnal Risk</span>
        </button>
      </div>

      {/* Loading State */}
      {isEvaluating && (
        <div className="p-6 rounded-2xl border border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20 animate-pulse space-y-4">
          <div className="flex items-center gap-3 text-sky-600 dark:text-sky-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold tracking-wide">
              Bedtime Risk Agent evaluating nocturnal trajectory & active IOB...
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-sky-200 dark:bg-sky-800/50 rounded w-3/4"></div>
            <div className="h-3 bg-sky-200 dark:bg-sky-800/50 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {/* Recommendation Card */}
      {bedtimeResult && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-3">
              {bedtimeResult.risk_category === "high_hypo_risk" ? (
                <ShieldAlert className="w-6 h-6 text-red-500" />
              ) : bedtimeResult.risk_category === "mild_risk" ? (
                <ShieldAlert className="w-6 h-6 text-amber-500" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Agent Recommendation Card
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Overnight Hypoglycemia Assessment
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {bedtimeResult.risk_category === "high_hypo_risk" && (
                <button
                  onClick={triggerAudioAlarm}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 border border-red-300 dark:border-red-800 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Test Alarm
                </button>
              )}
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  bedtimeResult.risk_category === "high_hypo_risk"
                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                    : bedtimeResult.risk_category === "mild_risk"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}
              >
                Risk Score: {bedtimeResult.risk_score} / 100
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
            <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Cookie className="w-4 h-4 text-sky-500" />
              Recommended Safety Action
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {bedtimeResult.recommendation}
            </p>
          </div>

          {bedtimeResult.suggested_snack?.carbs_g > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-medium">
                  Suggested Snack Target
                </p>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {bedtimeResult.suggested_snack.carbs_g}g Complex Carbs
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-medium">
                  Snack Recommendation
                </p>
                <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                  {bedtimeResult.suggested_snack.description}
                </p>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Agent Safety Rationale
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {bedtimeResult.reasoning_summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
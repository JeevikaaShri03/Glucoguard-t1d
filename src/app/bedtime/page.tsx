// src/app/bedtime/page.tsx
"use client";

import { useState, useEffect } from "react";
import { auth } from "@/src/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";

interface RiskResult {
  level: "LOW" | "MODERATE" | "HIGH";
  title: string;
  recommendation: string;
  carbsNeeded: number;
}

export default function BedtimeRiskPage() {
  const [user, setUser] = useState<User | null>(null);
  const [glucose, setGlucose] = useState<string>("");
  const [iob, setIob] = useState<string>("");
  const [snackCarbs, setSnackCarbs] = useState<string>("");

  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  
  // Timer state for 2-hour wake-up alarm
  const [alarmTime, setAlarmTime] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        autoSyncLatestLog(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const triggerAudioAlarm = (level: "HIGH" | "MODERATE") => {
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = level === "HIGH" ? "square" : "sine";
      osc.frequency.setValueAtTime(level === "HIGH" ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const text =
          level === "HIGH"
            ? "High overnight hypoglycemia risk detected. Please take bedtime carbs and prepare for a 2-hour recheck."
            : "Moderate bedtime risk. Snack recommended.";
        const speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech);
      }
    } catch (err) {
      console.error("Audio trigger error:", err);
    }
  };

  const schedule2HourAlarm = () => {
    const targetTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const formattedTime = targetTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAlarmTime(formattedTime);

    setTimeout(() => {
      triggerAudioAlarm("HIGH");
      toast.error("⏰ 2-HOUR RECHECK ALARM: Please recheck blood glucose immediately!");
    }, 2 * 60 * 60 * 1000);
  };

  const fetchAiRecommendation = async (
    bg: number,
    activeIob: number,
    carbs: number,
    level: string
  ) => {
    setLoadingAi(true);
    setAiAdvice("");
    try {
      const res = await fetch("/api/bedtime/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glucose: bg, iob: activeIob, carbs, riskLevel: level }),
      });
      const data = await res.json();
      if (data.success && data.aiAdvice) {
        setAiAdvice(data.aiAdvice);
      }
    } catch (err) {
      console.error("Failed to fetch AI advice:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const evaluateRisk = (bgStr: string, iobStr: string, carbsStr: string) => {
    if (!bgStr || bgStr.trim() === "") {
      setRisk(null);
      setAiAdvice("");
      setAlarmTime(null);
      return;
    }

    const bg = Number(bgStr) || 0;
    const activeInsulin = Number(iobStr) || 0;
    const carbs = Number(carbsStr) || 0;

    const predictedDrop = activeInsulin * 40;
    const projectedLowestBG = bg - predictedDrop + carbs * 3;

    let calculatedRisk: RiskResult;

    if (projectedLowestBG < 90 || bg <= 100) {
      calculatedRisk = {
        level: "HIGH",
        title: "High Overnight Hypoglycemia Risk",
        recommendation:
          "Your bedtime reading carries a high risk of dropping below safe limits overnight. Take fast-acting carbs and recheck in 2 hours.",
        carbsNeeded: Math.max(15, Math.ceil((140 - projectedLowestBG) / 3)),
      };
      triggerAudioAlarm("HIGH");
      schedule2HourAlarm();
    } else if (projectedLowestBG <= 145 || bg < 130) {
      calculatedRisk = {
        level: "MODERATE",
        title: "Moderate Risk – Bedtime Snack Recommended",
        recommendation:
          "Your blood glucose is borderline for overnight stability. Consider taking a 10–15g carb snack to prevent a late-night drop.",
        carbsNeeded: 10,
      };
      triggerAudioAlarm("MODERATE");
      setAlarmTime(null);
    } else {
      calculatedRisk = {
        level: "LOW",
        title: "Optimal Overnight Range",
        recommendation:
          "Your bedtime blood glucose and active insulin levels are stable. You are safe to sleep without additional intervention.",
        carbsNeeded: 0,
      };
      setAlarmTime(null);
    }

    setRisk(calculatedRisk);
    fetchAiRecommendation(bg, activeInsulin, carbs, calculatedRisk.level);
  };

  const autoSyncLatestLog = async (userId: string) => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`/api/bedtime/sync?userId=${userId}`);
      const result = await res.json();
      if (result.success && result.data) {
        const bgVal = String(result.data.glucoseMgDl ?? "");
        const iobVal = String(result.data.iob ?? "0");
        const carbsVal = String(result.data.carbsGrams ?? "0");

        setGlucose(bgVal);
        setIob(iobVal);
        setSnackCarbs(carbsVal);
        evaluateRisk(bgVal, iobVal, carbsVal);
      } else {
        setSyncMessage("No recent records found. Please log a checkup first.");
        setGlucose("");
        setIob("");
        setSnackCarbs("");
        setRisk(null);
      }
    } catch (err) {
      console.error("Failed to auto-sync log:", err);
      setSyncMessage("Failed to fetch logs. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncLatestLog = () => {
    if (user) autoSyncLatestLog(user.uid);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bedtime Safety Guardian</h1>
          <p className="text-sm text-[var(--text-secondary)]">Assess overnight hypoglycemia risk before going to sleep.</p>
        </div>
        <button
          onClick={handleSyncLatestLog}
          disabled={syncing}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {syncing ? "Syncing..." : "🔄 Sync Latest Log"}
        </button>
      </div>

      {syncMessage && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-sm font-medium rounded-xl flex items-center justify-between">
          <span>⚠️ {syncMessage}</span>
          <a href="/log" className="underline font-bold text-xs hover:text-amber-900 dark:hover:text-amber-200">Go to Daily Log</a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Bedtime Glucose (mg/dL)</label>
          <input
            type="number"
            placeholder="e.g. 130"
            value={glucose}
            onChange={(e) => {
              setGlucose(e.target.value);
              evaluateRisk(e.target.value, iob, snackCarbs);
            }}
            className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-lg font-bold text-[var(--text-primary)]"
          />
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Active Insulin (IOB Units)</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 1.5"
            value={iob}
            onChange={(e) => {
              setIob(e.target.value);
              evaluateRisk(glucose, e.target.value, snackCarbs);
            }}
            className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-lg font-bold text-[var(--text-primary)]"
          />
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Bedtime Snack (Carbs g)</label>
          <input
            type="number"
            placeholder="e.g. 0"
            value={snackCarbs}
            onChange={(e) => {
              setSnackCarbs(e.target.value);
              evaluateRisk(glucose, iob, e.target.value);
            }}
            className="w-full p-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-lg font-bold text-[var(--text-primary)]"
          />
        </div>
      </div>

      {risk && (
        <div
          className={`p-6 rounded-2xl border transition-all ${
            risk.level === "HIGH"
              ? "bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-200"
              : risk.level === "MODERATE"
              ? "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-200"
              : "bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                risk.level === "HIGH"
                  ? "bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200"
                  : risk.level === "MODERATE"
                  ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                  : "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200"
              }`}
            >
              {risk.level} RISK
            </span>
            {risk.carbsNeeded > 0 && (
              <span className="text-xs font-bold bg-[var(--bg-card)] px-3 py-1 rounded-lg border border-[var(--border-color)] shadow-sm text-[var(--text-primary)]">
                Recommended Snack: +{risk.carbsNeeded}g Carbs
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold mb-2">{risk.title}</h2>

          {alarmTime && (
            <div className="mb-3 text-xs font-bold text-rose-900 dark:text-rose-200 bg-rose-200/80 dark:bg-rose-900/40 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800">
              ⏰ Automated 2-Hour Alarm scheduled for: {alarmTime}
            </div>
          )}

          <div className="mt-3 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">🤖 AI Clinical Guardian</span>
              {loadingAi && <span className="text-xs text-sky-600 dark:text-sky-400 font-medium animate-pulse">Analyzing...</span>}
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-primary)]">{aiAdvice || risk.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
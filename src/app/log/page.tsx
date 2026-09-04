"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";

export default function LogPage() {
  const [user, setUser] = useState<User | null>(null);
  const [timing, setTiming] = useState("Fasting");

  const [logTime, setLogTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
  );

  const [glucose, setGlucose] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [bolus, setBolus] = useState<string>("");
  const [basal, setBasal] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [basalTimingPreference, setBasalTimingPreference] = useState<"MORNING" | "NIGHT">("MORNING");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const isFasting = timing === "Fasting";
  const isPreLunch = timing === "Pre-Lunch";
  const isPreDinner = timing === "Pre-Dinner";
  const isBedtime = timing === "Bedtime";

  const isBolusDisabled = isFasting;
  const isCarbsDisabled = isFasting;

  let isBasalDisabled = true;

  if (basalTimingPreference === "MORNING") {
    isBasalDisabled = !isPreLunch;
  } else if (basalTimingPreference === "NIGHT") {
    isBasalDisabled = !(isPreDinner || isBedtime);
  }

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "logs"), {
        userId: user ? user.uid : "anonymous_user",
        userEmail: user?.email || "N/A",
        timing,
        logTime,
        glucoseMgDl: Number(glucose) || 0,
        carbsGrams: isCarbsDisabled ? 0 : Number(carbs) || 0,
        bolusUnits: isBolusDisabled ? 0 : Number(bolus) || 0,
        basalUnits: isBasalDisabled ? 0 : Number(basal) || 0,
        basalTimingPreference,
        timestamp: serverTimestamp(),
      });

      setGlucose("");
      setCarbs("");
      setBolus("");
      setBasal("");

      toast.success("Log entry saved successfully!", {
        description: `${timing} entry logged for ${logTime}`,
      });
    } catch (error) {
      console.error("Error writing document to Firestore: ", error);
      toast.error("Failed to save log entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (isDisabled: boolean = false) => `
    w-full p-2.5 rounded-xl border text-sm font-medium transition-all ${
      isDisabled
        ? "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed"
        : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
    }
  `;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Card styling matching SnapAndCountCard theme variables */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm transition-colors space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Daily Glucose & Insulin Log
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Record checkup blood sugar readings and insulin doses manually.
          </p>
        </div>

        {/* User Basal Schedule Preference */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Basal Timing Schedule</p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              When do you take your primary 24-hr long-acting dose?
            </p>
          </div>
          <select
            value={basalTimingPreference}
            onChange={(e) => setBasalTimingPreference(e.target.value as "MORNING" | "NIGHT")}
            className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="MORNING">Morning (Pre-Lunch)</option>
            <option value="NIGHT">Night (Pre-Dinner / Bedtime)</option>
          </select>
        </div>

        <form onSubmit={handleSaveLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Checkup Timing
              </label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className={getInputClassName(false)}
              >
                <option value="Fasting">Fasting (Morning Check)</option>
                <option value="Pre-Lunch">Pre-Lunch / Meal</option>
                <option value="Pre-Dinner">Pre-Dinner / Meal</option>
                <option value="Bedtime">Bedtime (Night Check)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Time of Check
              </label>
              <input
                type="time"
                value={logTime}
                onChange={(e) => setLogTime(e.target.value)}
                className={getInputClassName(false)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Blood Glucose (mg/dL)
              </label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className={getInputClassName(false)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Carbs (Grams)
              </label>
              <input
                type="number"
                placeholder={isCarbsDisabled ? "Disabled" : "e.g. 60"}
                value={isCarbsDisabled ? "" : carbs}
                disabled={isCarbsDisabled}
                onChange={(e) => setCarbs(e.target.value)}
                className={getInputClassName(isCarbsDisabled)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Bolus Units (Rapid-Acting)
              </label>
              <input
                type="number"
                placeholder={isBolusDisabled ? "Disabled" : "e.g. 8"}
                value={isBolusDisabled ? "" : bolus}
                disabled={isBolusDisabled}
                onChange={(e) => setBolus(e.target.value)}
                className={getInputClassName(isBolusDisabled)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Basal Units (Long-Acting 24h)
              </label>
              <input
                type="number"
                placeholder={isBasalDisabled ? "Disabled" : "e.g. 14"}
                value={isBasalDisabled ? "" : basal}
                disabled={isBasalDisabled}
                onChange={(e) => setBasal(e.target.value)}
                className={getInputClassName(isBasalDisabled)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {loading ? "Saving..." : "Save Log Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
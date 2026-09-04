"use client";

import React from "react";
import { Utensils, Activity, Droplets, Clock, AlertTriangle } from "lucide-react";

export interface TelemetryLogEntry {
  id: string;
  timestamp: string; // ISO string or format "13:30 PM"
  mealTag: "Fasting" | "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Bedtime";
  glucoseMgDl: number;
  carbsGrams: number;
  insulinUnits: number;
  aiSpikeForecastMgDl?: number;
}

interface MedicalLogTableProps {
  logs?: TelemetryLogEntry[];
  isLoading?: boolean;
}

// Fallback mock data matching your AI Studio specification
const DEFAULT_LOGS: TelemetryLogEntry[] = [
  {
    id: "1",
    timestamp: "13:30 PM",
    mealTag: "Lunch",
    glucoseMgDl: 142,
    carbsGrams: 65,
    insulinUnits: 6.5,
    aiSpikeForecastMgDl: 45,
  },
  {
    id: "2",
    timestamp: "08:15 AM",
    mealTag: "Fasting",
    glucoseMgDl: 64,
    carbsGrams: 0,
    insulinUnits: 0.0,
    aiSpikeForecastMgDl: 0,
  },
  {
    id: "3",
    timestamp: "20:00 PM",
    mealTag: "Dinner",
    glucoseMgDl: 195,
    carbsGrams: 80,
    insulinUnits: 8.0,
    aiSpikeForecastMgDl: 60,
  },
];

export default function MedicalLogTable({
  logs = DEFAULT_LOGS,
  isLoading = false,
}: MedicalLogTableProps) {
  // Helper to determine blood sugar alert styling
  const getGlucoseBadge = (glucose: number) => {
    if (glucose < 70) {
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
    if (glucose > 180) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
      {/* Table Header Section */}
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold tracking-wider text-[var(--text-primary)] uppercase">
            Daily Glycemic Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {logs.length} Recorded Events
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-main)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              <th className="px-5 py-3 border-b border-[var(--border-color)]">Event / Time</th>
              <th className="px-5 py-3 border-b border-[var(--border-color)] text-center">Glucose</th>
              <th className="px-5 py-3 border-b border-[var(--border-color)] text-center">Carbs</th>
              <th className="px-5 py-3 border-b border-[var(--border-color)] text-center">Bolus Insulin</th>
              <th className="px-5 py-3 border-b border-[var(--border-color)]">AI Spike Forecast</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-xs text-[var(--text-secondary)] animate-pulse">
                  Loading clinical logs from Firestore...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-xs text-[var(--text-secondary)]">
                  No glycemic telemetry recorded today.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-sky-500/5 transition-colors text-xs"
                >
                  {/* Timestamp & Tag */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        {log.mealTag === "Fasting" ? (
                          <Droplets size={14} />
                        ) : (
                          <Utensils size={14} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">
                          {log.mealTag}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                          <Clock size={10} />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Glucose Value with Badge */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold border text-xs ${getGlucoseBadge(
                        log.glucoseMgDl
                      )}`}
                    >
                      {log.glucoseMgDl} mg/dL
                    </span>
                  </td>

                  {/* Carbs */}
                  <td className="px-5 py-4 text-center">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {log.carbsGrams > 0 ? `${log.carbsGrams}g` : "--"}
                    </span>
                  </td>

                  {/* Insulin */}
                  <td className="px-5 py-4 text-center font-mono font-bold text-sky-600 dark:text-sky-400">
                    {log.insulinUnits > 0 ? `${log.insulinUnits.toFixed(2)} U` : "--"}
                  </td>

                  {/* AI Spike Forecast */}
                  <td className="px-5 py-4">
                    {log.aiSpikeForecastMgDl && log.aiSpikeForecastMgDl > 0 ? (
                      <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={12} />
                        <span>+{log.aiSpikeForecastMgDl} mg/dL Expected</span>
                      </div>
                    ) : (
                      <span className="text-[var(--text-secondary)] italic">
                        Stable trajectory
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
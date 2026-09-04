"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import InsightCards from "@/src/components/ui/InsightCards";
import RecommendationCard from "@/src/components/ui/RecommendationCard";

interface LogEntry {
  id: string;
  timing: string;
  glucoseMgDl: number;
  carbsGrams?: number;
  bolusUnits?: number;
  basalUnits?: number;
  timestamp: string;
}

export default function TrendsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLogs([]);
        setLoading(false);
        return;
      }

      // Scope the Firestore query strictly to the authenticated user's UID
      const q = query(
        collection(db, "logs"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const fetchedLogs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as LogEntry[];
          setLogs(fetchedLogs);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching telemetry logs:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trends & Analytics</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Deep glycemic insights, real-time telemetry, and AI safety recommendations.
        </p>
      </div>

      {/* 1. Pre-built Insight Cards UI */}
      <InsightCards logs={logs} />

      {/* 2. Recommendation & AI Guidance Component */}
      <RecommendationCard />

      {/* 3. Glycemic Telemetry Table */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Daily Glycemic Telemetry</h2>
          <span className="text-xs font-medium bg-[var(--bg-muted)] text-[var(--text-secondary)] px-2.5 py-1 rounded-full">
            {logs.length} Recorded Checkups
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-muted)] text-xs text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
              <tr>
                <th className="p-4">Timing</th>
                <th className="p-4">Glucose</th>
                <th className="p-4">Carbs</th>
                <th className="p-4">Bolus</th>
                <th className="p-4">Basal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)] animate-pulse">
                    Loading clinical logs from Firestore...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                    No entries logged yet. Visit the <strong className="text-[var(--text-primary)]">Daily Log</strong> page to record your first checkup.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-muted)]/50 transition-colors">
                    <td className="p-4 font-medium text-[var(--text-primary)]">{log.timing}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          log.glucoseMgDl < 70
                            ? "text-amber-500"
                            : log.glucoseMgDl > 180
                            ? "text-rose-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {log.glucoseMgDl} mg/dL
                      </span>
                    </td>
                    <td className="p-4">{log.carbsGrams ? `${log.carbsGrams} g` : "—"}</td>
                    <td className="p-4">{log.bolusUnits ? `${log.bolusUnits} U` : "—"}</td>
                    <td className="p-4">{log.basalUnits ? `${log.basalUnits} U` : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
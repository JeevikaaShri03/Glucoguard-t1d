"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";// Adjust path to your Firebase config
import { TelemetryLogEntry } from "@/src/components/ui/MedicalLogTable";

export function useTelemetryLogs(maxEntries: number = 10) {
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Query last N telemetry logs ordered by timestamp
    const logsQuery = query(
      collection(db, "telemetry_logs"),
      orderBy("createdAt", "desc"),
      limit(maxEntries)
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const fetchedLogs: TelemetryLogEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            timestamp: data.timestamp || new Date(data.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mealTag: data.mealTag || "Fasting",
            glucoseMgDl: data.glucoseMgDl ?? 0,
            carbsGrams: data.carbsGrams ?? 0,
            insulinUnits: data.insulinUnits ?? 0,
            aiSpikeForecastMgDl: data.aiSpikeForecastMgDl ?? 0,
          };
        });

        setLogs(fetchedLogs);
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore telemetry subscription error:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxEntries]);

  return { logs, isLoading, error };
}
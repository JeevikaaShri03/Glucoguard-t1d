"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import SnapAndCountCard, { SnapAgentData } from "@/src/components/ui/SnapAndCountCard";

export default function SnapAndLogPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [agentData, setAgentData] = useState<SnapAgentData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Dynamic Carb Adjustment Handler
  const handleCarbChange = (index: number, newCarbs: number) => {
    if (!agentData) return;
    const safeCarbs = Number.isNaN(newCarbs) ? 0 : Math.max(0, newCarbs);
    const updatedItems = [...agentData.food_items];
    updatedItems[index].carbs_g = safeCarbs;
    recalculateMeal(updatedItems);
  };

  // Delete Item Handler
  const handleDeleteComponent = (index: number) => {
    if (!agentData) return;
    const updatedItems = agentData.food_items.filter((_, i) => i !== index);
    recalculateMeal(updatedItems);
  };

  const recalculateMeal = (updatedItems: SnapAgentData["food_items"]) => {
    const newTotal = updatedItems.reduce((acc, curr) => acc + (Number(curr.carbs_g) || 0), 0);
    let newGL: "Low" | "Medium" | "High" = "Low";
    if (newTotal > 50) newGL = "High";
    else if (newTotal >= 20) newGL = "Medium";

    setAgentData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        food_items: updatedItems,
        total_carbs_g: newTotal,
        glycemic_load: newGL,
      };
    });
  };

  // Safe Informational Bolus Helper (1:10 ratio)
  const userICR = 10;
  const totalCarbs = agentData?.total_carbs_g ?? 0;
  const estimatedBolus = Number((totalCarbs / userICR).toFixed(1));

  // Dynamic Spike Calculations
  const spikeMin = Math.round(totalCarbs * 0.7);
  const spikeMax = Math.round(totalCarbs * 1.1);
  const spikeString = totalCarbs > 0 ? `+${spikeMin} to +${spikeMax} mg/dL` : "0 mg/dL";

  // SAVE DIRECTLY TO FIRESTORE & REDIRECT TO TRENDS
  const handleApproveLog = async () => {
    if (!agentData) return;
    setIsSaving(true);

    try {
      await addDoc(collection(db, "logs"), {
        userId: user ? user.uid : "anonymous_user",
        userEmail: user?.email || "N/A",
        timing: "Snap & Count Meal",
        glucoseMgDl: 0, // Set default or prompt user if required
        carbsGrams: totalCarbs,
        bolusUnits: estimatedBolus,
        basalUnits: 0,
        foodItems: agentData.food_items,
        source: "snap_and_count",
        timestamp: serverTimestamp(),
      });

      // Redirect directly to Trends & Analytics page
      router.push("/trends");
    } catch (error) {
      console.error("Error writing document to Firestore: ", error);
      alert("Failed to save entry to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-500">
          Snap & Log — AI Vision Assistant
        </h1>
        <p className="text-xs font-medium text-gray-500 mt-1">
          Multimodal nutrition estimation and sugar spike forecasting for Type 1 Diabetes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SnapAndCountCard
            agentData={agentData}
            setAgentData={setAgentData}
            onCarbChange={handleCarbChange}
            onDeleteComponent={handleDeleteComponent}
            spikeRange={spikeString}
            onApprove={handleApproveLog}
            //isSaving={isSaving}
          />
        </div>

        <div className="space-y-6">
          {agentData && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Informational Bolus Reference
              </h3>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-sky-500">{estimatedBolus}</span>
                <span className="text-xs font-bold text-gray-500">Units (1:10 ICR)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
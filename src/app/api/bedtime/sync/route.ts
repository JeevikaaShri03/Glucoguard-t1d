import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "No user ID provided" });
    }

    // Dynamically import Firebase and Firestore inside the handler to prevent build-time evaluation
    const { db } = await import("@/src/lib/firebase");
    const { collection, query, where, getDocs } = await import("firebase/firestore");

    const logsRef = collection(db, "logs");
    const q = query(logsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ success: false, message: "No log entries found for this user" });
    }

    // Sort documents manually by timestamp in JS (prevents Firestore index error)
    const logs = snapshot.docs
      .map((doc) => doc.data())
      .filter((data) => data.timestamp)
      .sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA; // Descending order
      });

    if (logs.length === 0) {
      return NextResponse.json({ success: false, message: "No recent log data found" });
    }

    const latestLog = logs[0];

    // Calculate Active Insulin on Board (IOB) from recent boluses (4-hour decay window)
    const now = Date.now();
    let calculatedIOB = 0;

    logs.slice(0, 5).forEach((log) => {
      if (log.timestamp && log.bolusUnits > 0) {
        const logTime = log.timestamp.seconds ? log.timestamp.seconds * 1000 : now;
        const hoursDiff = (now - logTime) / (1000 * 60 * 60);

        if (hoursDiff >= 0 && hoursDiff < 4) {
          calculatedIOB += log.bolusUnits * (1 - hoursDiff / 4);
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        glucoseMgDl: latestLog.glucoseMgDl,
        carbsGrams: latestLog.carbsGrams || 0,
        iob: parseFloat(calculatedIOB.toFixed(1)),
        timing: latestLog.timing,
        timestamp: latestLog.timestamp,
      },
    });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/src/lib/firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get("userId");

//     if (!userId) {
//       return NextResponse.json({ success: false, message: "No user ID provided" });
//     }

//     const logsRef = collection(db, "logs");
//     const q = query(logsRef, where("userId", "==", userId));
//     const snapshot = await getDocs(q);

//     if (snapshot.empty) {
//       return NextResponse.json({ success: false, message: "No log entries found for this user" });
//     }

//     // Sort documents manually by timestamp in JS (prevents Firestore index error)
//     const logs = snapshot.docs
//       .map((doc) => doc.data())
//       .filter((data) => data.timestamp)
//       .sort((a, b) => {
//         const timeA = a.timestamp?.seconds || 0;
//         const timeB = b.timestamp?.seconds || 0;
//         return timeB - timeA; // Descending order
//       });

//     if (logs.length === 0) {
//       return NextResponse.json({ success: false, message: "No recent log data found" });
//     }

//     const latestLog = logs[0];

//     // Calculate Active Insulin on Board (IOB) from recent boluses (4-hour decay window)
//     const now = Date.now();
//     let calculatedIOB = 0;

//     logs.slice(0, 5).forEach((log) => {
//       if (log.timestamp && log.bolusUnits > 0) {
//         const logTime = log.timestamp.seconds ? log.timestamp.seconds * 1000 : now;
//         const hoursDiff = (now - logTime) / (1000 * 60 * 60);

//         if (hoursDiff >= 0 && hoursDiff < 4) {
//           calculatedIOB += log.bolusUnits * (1 - hoursDiff / 4);
//         }
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       data: {
//         glucoseMgDl: latestLog.glucoseMgDl,
//         carbsGrams: latestLog.carbsGrams || 0,
//         iob: parseFloat(calculatedIOB.toFixed(1)),
//         timing: latestLog.timing,
//         timestamp: latestLog.timestamp,
//       },
//     });
//   } catch (error: any) {
//     console.error("Sync API Error:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "build-time-dummy-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "build-time.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "build-time-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "build-time.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123:web:abc",
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
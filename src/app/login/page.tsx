"use client";

import { useState } from "react";
import { auth, googleProvider, db } from "@/src/lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, User as UserIcon, Mail, Lock, Calendar, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          uid: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "User",
          photoURL: result.user.photoURL || "",
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
      toast.success("Welcome back!", {
        description: "Successfully authenticated with Google.",
      });
      router.push("/");
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Authentication failed", {
        description: error.message || "Please check your browser settings and try again.",
      });
    }
  };

  // Password Validation Check: Min 8 chars, 1 uppercase, 1 special char, 1 numeric
  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one numeric digit.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      return "Password must contain at least one special character.";
    }
    return null;
  };

  // Form Submit Handler for Sign Up / Log In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error("Username required", {
        description: "Please enter your username/display name.",
      });
      return;
    }

    if (!password) {
      toast.error("Password required", {
        description: "Please enter your password.",
      });
      return;
    }

    // Only enforce strict password rules during Sign Up, not Log In
    if (isSignUp) {
      const passError = validatePassword(password);
      if (passError) {
        toast.error("Weak password", { description: passError });
        return;
      }
      if (!age) {
        toast.error("Age required", { description: "Please enter your age." });
        return;
      }
    }

    setLoading(true);
    try {
      let authEmail = email.trim();

      if (isSignUp) {
        if (!authEmail) {
          authEmail = `${name.toLowerCase().replace(/\s+/g, "")}_${Date.now()}@glucoguard.local`;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
        await updateProfile(userCredential.user, { displayName: name });

        await setDoc(
          doc(db, "users", userCredential.user.uid),
          {
            uid: userCredential.user.uid,
            email: email.trim(),
            authEmail: authEmail,
            displayName: name,
            age: age ? parseInt(age) || 0 : "",
            icr: 10,
            isf: 40,
            targetGlucoseMin: 70,
            targetGlucoseMax: 180,
            emergencyContactName: "",
            emergencyContactPhone: "",
            doctorName: "",
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );

        toast.success("Account created successfully!", {
          description: "Welcome to GlucoGuard T1D.",
        });
      } else {
        if (!authEmail) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("displayName", "==", name.trim()));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            toast.error("Account not found", {
              description: "No user found with this username. Please check your name or sign up.",
            });
            setLoading(false);
            return;
          }

          const userData = querySnapshot.docs[0].data();
          authEmail = userData.authEmail;

          if (!authEmail) {
            toast.error("Login configuration error", {
              description: "Please provide your email address to log in.",
            });
            setLoading(false);
            return;
          }
        }

        const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
        
        await setDoc(
          doc(db, "users", userCredential.user.uid),
          { 
            lastLogin: new Date().toISOString(),
            ...(age ? { age: parseInt(age) || 0 } : {})
          },
          { merge: true }
        );

        toast.success("Welcome back!", {
          description: "Redirecting to your telemetry dashboard...",
        });
      }
      router.push("/");
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let errorTitle = "Log in failed";
      let errorDescription = "Please check your credentials and try again.";

      if (
        error.code === "auth/user-not-found" || 
        error.code === "auth/invalid-credential" || 
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-email"
      ) {
        errorTitle = "Account not found or incorrect credentials";
        errorDescription = "No user exists with these credentials, or the password is incorrect. Please check your details or create an account.";
      }

      toast.error(errorTitle, {
        description: errorDescription,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm text-center">
        <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20 shadow-sm">
          <Activity className="w-6 h-6 text-sky-500" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">
          GlucoGuard T1D
        </h1>
        <p className="text-xs font-semibold text-sky-500 mb-3">
          AI Safety Platform for Type 1 Diabetes
        </p>
        <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
          Please sign in to access telemetry logging, multimodal carbohydrate estimation, and nocturnal hypoglycemia prediction.
        </p>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border-color)] mb-6">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              !isSignUp
                ? "bg-[var(--bg-card)] text-sky-500 shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isSignUp
                ? "bg-[var(--bg-card)] text-sky-500 shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left mb-6">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
              Username / Display Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter your username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
              Email Address <span className="text-[10px] text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="name@example.com (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
              Password <span className="text-[10px] text-slate-400">{isSignUp ? "(Min 8 chars, 1 uppercase, 1 special, 1 number)" : ""}</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
              Age <span className="text-[10px] text-slate-400">{!isSignUp ? "(Optional)" : ""}</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? "Processing..." : isSignUp ? "Create Account" : "Log In"}</span>
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]"></div>
          </div>
          <span className="relative bg-[var(--bg-card)] px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <span>Sign In with Google</span>
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/src/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  User as UserIcon,
  Activity,
  ShieldAlert,
  Save,
  Edit2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface DiabetesProfile {
  displayName: string;
  email: string;
  age: number | "";
  icr: number;
  isf: number;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  doctorName: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<DiabetesProfile>({
    displayName: "",
    email: "",
    age: "",
    icr: 10,
    isf: 40,
    targetGlucoseMin: 70,
    targetGlucoseMax: 180,
    emergencyContactName: "",
    emergencyContactPhone: "",
    doctorName: "",
  });

  const [tempProfile, setTempProfile] = useState<DiabetesProfile>(profile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<DiabetesProfile>;
            const loadedProfile: DiabetesProfile = {
              displayName: data.displayName || currentUser.displayName || "",
              email: data.email || "",
              age: data.age ?? "",
              icr: data.icr ?? 10,
              isf: data.isf ?? 40,
              targetGlucoseMin: data.targetGlucoseMin ?? 70,
              targetGlucoseMax: data.targetGlucoseMax ?? 180,
              emergencyContactName: data.emergencyContactName || "",
              emergencyContactPhone: data.emergencyContactPhone || "",
              doctorName: data.doctorName || "",
            };
            setProfile(loadedProfile);
            setTempProfile(loadedProfile);
          } else {
            const initial: DiabetesProfile = {
              displayName: currentUser.displayName || "",
              email: "",
              age: "",
              icr: 10,
              isf: 40,
              targetGlucoseMin: 70,
              targetGlucoseMax: 180,
              emergencyContactName: "",
              emergencyContactPhone: "",
              doctorName: "",
            };
            setProfile(initial);
            setTempProfile(initial);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          toast.error("Failed to load profile data", {
            description: "Please refresh the page or try again later.",
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    const cleaned = phone.replace(/\s+/g, "").replace(/^\+91/, "");
    const regex = /^\d{10}$/;
    return regex.test(cleaned);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (tempProfile.emergencyContactPhone && !validatePhone(tempProfile.emergencyContactPhone)) {
      toast.error("Invalid phone number", {
        description: "Emergency contact phone number must be exactly 10 digits (optionally prefixed with +91).",
      });
      return;
    }

    setIsSaving(true);

    try {
      await setDoc(doc(db, "users", user.uid), tempProfile, { merge: true });
      setProfile(tempProfile);
      setIsEditing(false);

      toast.success("Profile updated successfully!", {
        description: "Your details and clinical parameters have been saved.",
      });
    } catch (err) {
      console.error("Error saving profile settings:", err);
      toast.error("Failed to save settings", {
        description: "Please check your network connection and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const getInputClassName = (editable: boolean) => `
    w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
      editable
        ? "bg-[var(--bg-main)] border-sky-500 text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-primary)] cursor-not-allowed flex items-center min-h-[38px]"
    }
  `;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Profile & Safety Settings
          </h1>
          <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">
            Personal clinical ratios and safety baseline configuration.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setTempProfile(profile);
              setIsEditing(true);
            }}
            className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center gap-2 border border-sky-500/20 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Identity Card */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Patient Account Information
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Managed via Firebase Authentication & Firestore
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Display Name / Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  placeholder="Enter display name"
                  value={tempProfile.displayName}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, displayName: e.target.value })
                  }
                  className={getInputClassName(true)}
                />
              ) : (
                <div className={getInputClassName(false)}>
                  {profile.displayName || <span className="text-slate-400 font-normal">Not provided</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Email Address <span className="text-[10px] text-slate-400">(Optional)</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  placeholder="Optional email address"
                  value={tempProfile.email}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, email: e.target.value })
                  }
                  className={getInputClassName(true)}
                />
              ) : (
                <div className={getInputClassName(false)}>
                  {profile.email || <span className="text-slate-400 font-normal">None provided</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  placeholder="Enter age"
                  value={tempProfile.age}
                  onChange={(e) =>
                    setTempProfile({
                      ...tempProfile,
                      age: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                    })
                  }
                  className={getInputClassName(true)}
                />
              ) : (
                <div className={getInputClassName(false)}>
                  {profile.age !== "" ? profile.age : <span className="text-slate-400 font-normal">Not provided</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* T1D Clinical Parameters */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Insulin & Glycemic Ratios
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Used to compute reference dosages and target boundaries
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Insulin-to-Carb Ratio (ICR)
              </label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfile.icr}
                    onChange={(e) =>
                      setTempProfile({
                        ...tempProfile,
                        icr: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={getInputClassName(true)}
                  />
                ) : (
                  <div className={getInputClassName(false)}>
                    {profile.icr}
                  </div>
                )}
                <span className="text-xs text-[var(--text-secondary)] font-medium shrink-0">
                  g / Unit
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Insulin Sensitivity Factor (ISF)
              </label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfile.isf}
                    onChange={(e) =>
                      setTempProfile({
                        ...tempProfile,
                        isf: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={getInputClassName(true)}
                  />
                ) : (
                  <div className={getInputClassName(false)}>
                    {profile.isf}
                  </div>
                )}
                <span className="text-xs text-[var(--text-secondary)] font-medium shrink-0">
                  mg/dL / Unit
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Target Glucose Minimum
              </label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfile.targetGlucoseMin}
                    onChange={(e) =>
                      setTempProfile({
                        ...tempProfile,
                        targetGlucoseMin: parseInt(e.target.value) || 70,
                      })
                    }
                    className={getInputClassName(true)}
                  />
                ) : (
                  <div className={getInputClassName(false)}>
                    {profile.targetGlucoseMin}
                  </div>
                )}
                <span className="text-xs text-[var(--text-secondary)] font-medium shrink-0">
                  mg/dL
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Target Glucose Maximum
              </label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfile.targetGlucoseMax}
                    onChange={(e) =>
                      setTempProfile({
                        ...tempProfile,
                        targetGlucoseMax: parseInt(e.target.value) || 180,
                      })
                    }
                    className={getInputClassName(true)}
                  />
                ) : (
                  <div className={getInputClassName(false)}>
                    {profile.targetGlucoseMax}
                  </div>
                )}
                <span className="text-xs text-[var(--text-secondary)] font-medium shrink-0">
                  mg/dL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts & Care Team */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Care Team & Emergency Details
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Primary endocrinologist and emergency contact information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Endocrinologist / Doctor Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  placeholder="Dr. Smith"
                  value={tempProfile.doctorName}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, doctorName: e.target.value })
                  }
                  className={getInputClassName(true)}
                />
              ) : (
                <div className={getInputClassName(false)}>
                  {profile.doctorName || <span className="text-slate-400 font-normal">Empty</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Emergency Contact Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  placeholder="Parent / Spouse / Guardian"
                  value={tempProfile.emergencyContactName}
                  onChange={(e) =>
                    setTempProfile({
                      ...tempProfile,
                      emergencyContactName: e.target.value,
                    })
                  }
                  className={getInputClassName(true)}
                />
              ) : (
                <div className={getInputClassName(false)}>
                  {profile.emergencyContactName || <span className="text-slate-400 font-normal">Empty</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Emergency Contact Phone <span className="text-[10px] text-slate-400">(10 digits / +91)</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  placeholder="9876543210 or +919876543210"
                  value={tempProfile.emergencyContactPhone}
                  onChange={(e) =>
                    setTempProfile({
                      ...tempProfile,
                      emergencyContactPhone: e.target.value,
                    })
                  }
                  className={getInputClassName(true)}
                />
              ) : (
                <div className={getInputClassName(false)}>
                  {profile.emergencyContactPhone || <span className="text-slate-400 font-normal">Empty</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-primary)] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
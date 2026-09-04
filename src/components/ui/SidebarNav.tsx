// src/components/ui/SidebarNav.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Camera, TrendingUp, Moon, User, LogOut, FileText, Menu, X } from "lucide-react";
import { signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Overview", href: "/", icon: Activity },
  { name: "Snap & Count", href: "/snap", icon: Camera },
  { name: "Log", href: "/log", icon: FileText },
  { name: "Trends & Analytics", href: "/trends", icon: TrendingUp },
  { name: "Bedtime Risk", href: "/bedtime", icon: Moon },
  { name: "Profile Settings", href: "/profile", icon: User },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-8">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full border border-sky-500/30 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-600 flex items-center justify-center text-xs font-bold">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {user.displayName || "User"}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold border border-sky-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
              GlucoGuard T1D
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)]">AI Safety Platform</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-sky-100/70 text-sky-700 dark:bg-slate-800 dark:text-sky-400 font-bold"
                    : "text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          Sign Out
        </button>

        <div className="flex items-center justify-between px-2 pt-2 border-t border-[var(--border-color)]">
          <span className="text-xs font-medium text-[var(--text-secondary)]">GlucoGuard T1D</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold border border-sky-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-[var(--text-primary)]">GlucoGuard T1D</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-64 bg-[var(--bg-sidebar)] h-full p-6 flex flex-col shadow-2xl border-r border-[var(--border-color)] animate-in slide-in-from-left duration-200">
            <div className="flex justify-end mb-2">
              <button onClick={() => setMobileOpen(false)} className="text-[var(--text-secondary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] p-6 hidden md:flex flex-col min-h-screen shrink-0 transition-colors">
        {sidebarContent}
      </aside>
    </>
  );
}
// src/app/page.tsx
import Link from "next/link";
import { Camera, FileText, TrendingUp, Moon, ArrowRight, ShieldCheck } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      {/* Hero Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Multimodal AI & Predictive Care Platform
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400">
          Precision Glucose Companion
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          GlucoGuard T1D combines computer vision and predictive risk modeling to simplify carb counting, track glycemic trends, and safeguard against nocturnal hypoglycemia.
        </p>
      </div>

      {/* Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Snap & Count Card */}
        <Link 
          href="/snap" 
          className="group relative bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-sky-500/50 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  Snap & Count
                </h2>
                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 group-hover:text-sky-600 transition-all" />
              </div>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                Upload food photos for instant AI carbohydrate estimation, glycemic spike forecasting, and automated meal logging.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-sky-600 dark:text-sky-400">
            Launch computer vision →
          </div>
        </Link>

        {/* Log Card */}
        <Link 
          href="/log" 
          className="group relative bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-sky-500/50 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Clinical & Meal Log
                </h2>
                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
              </div>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                Record blood glucose telemetry, insulin boluses, active IOB context, and daily health notes for comprehensive tracking.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Open daily logbook →
          </div>
        </Link>

        {/* Trends & Analytics Card */}
        <Link 
          href="/trends" 
          className="group relative bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-sky-500/50 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Trends & Analytics
                </h2>
                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-1 group-hover:text-violet-600 transition-all" />
              </div>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                Monitor time-in-range performance metrics, continuous glucose patterns, and historical clinical logs.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center text-xs font-semibold text-violet-600 dark:text-violet-400">
            View analytics suite →
          </div>
        </Link>

        {/* Overnight Risk Card */}
        <Link 
          href="/bedtime" 
          className="group relative bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-sky-500/50 transition-all duration-200 flex flex-col justify-between lg:col-span-3"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Bedtime Safety Guardian & Overnight Risk
                </h2>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed mt-1 max-w-3xl">
                  Bedtime risk prediction engine evaluating active IOB, late meals, and overnight hypoglycemia probability to schedule automated wake-up alarms.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0 self-start md:self-center">
              Run safety check <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
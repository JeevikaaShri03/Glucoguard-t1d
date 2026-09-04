"use client";

import { useState } from "react";

type Option = {
  key: string;
  body: React.ReactNode;
  short: string;
  signal: number;
  tone: string;
  label: string;
  cta: string;
  ctaStyle: string;
};

const OPTIONS: Option[] = [
  {
    key: "snack",
    body: (
      <>
        Consume a <span className="font-semibold text-[var(--text-primary)]">15g slow-acting carb snack</span> (e.g. whole wheat toast or milk) to prevent overnight hypoglycemia.
      </>
    ),
    short: "15g bedtime snack · Lowers night hypo risk",
    signal: 3,
    tone: "#10b981", // Emerald
    label: "High confidence",
    cta: "Accept Guidance",
    ctaStyle: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  {
    key: "correction",
    body: (
      <>
        High bedtime glucose detected. Consider a cautious correction bolus of{" "}
        <code className="rounded-md bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 font-mono text-[12px] text-amber-500">1.5 U</code> based on your sensitivity ratio.
      </>
    ),
    short: "1.5 U Correction Bolus · High Glucose",
    signal: 2,
    tone: "#f59e0b", // Amber
    label: "Needs review",
    cta: "Log Correction",
    ctaStyle: "bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white",
  },
  {
    key: "monitor",
    body: (
      <>
        Glucose is within target range. Maintain current basal dose and re-check fasting blood sugar in the morning.
      </>
    ),
    short: "Maintain Current Dosing · Stable",
    signal: 3,
    tone: "#10b981", // Emerald
    label: "Optimal Range",
    cta: "Acknowledge",
    ctaStyle: "bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white",
  },
];

function Meter({ signal, tone }: { signal: number; tone: string }) {
  return (
    <span className="flex items-end gap-0.5">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-1 rounded-full transition-colors duration-300"
          style={{ height: 10, background: bar < signal ? tone : "var(--border-color)" }}
        />
      ))}
    </span>
  );
}

export default function RecommendationCard() {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const active = OPTIONS[selected];
  const others = OPTIONS.map((o, i) => ({ o, i })).filter(({ i }) => i !== selected);

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
      <div className="p-4 space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          AI Clinical Safety Recommendation
        </span>
        <p
          key={active.key}
          className="mt-1.5 min-h-[48px] text-sm leading-relaxed text-[var(--text-primary)]"
          style={{ animation: "fade-in 180ms ease-out both" }}
        >
          {active.body}
        </p>
      </div>

      {/* Alternatives drawer */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-muted)] px-3 py-2">
            <p className="px-1.5 pb-1 text-[11px] font-semibold text-[var(--text-secondary)] uppercase">
              Alternative Actions
            </p>
            {others.map(({ o, i }) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  setSelected(i);
                  setAccepted(false);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-100 hover:bg-[var(--bg-card)]/50"
              >
                <Meter signal={o.signal} tone={o.tone} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--text-primary)]">
                  {o.short}
                </span>
                <span className="shrink-0 text-[11px] font-medium text-[var(--text-secondary)]">
                  {o.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border-color)] bg-[var(--bg-muted)] px-4 py-3">
        <span className="flex items-center gap-2">
          <Meter signal={active.signal} tone={active.tone} />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{active.label}</span>
        </span>

        <span className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className={`h-8 rounded-xl px-3 text-xs font-medium transition duration-100 ${
              open
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)]"
                : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]/80"
            }`}
          >
            Alternatives
          </button>
          <button
            type="button"
            onClick={() => setAccepted(true)}
            className={`h-8 rounded-xl px-3 text-xs font-medium transition duration-150 ${
              accepted ? "bg-emerald-600 text-white" : active.ctaStyle
            }`}
          >
            {accepted ? "Accepted" : active.cta}
          </button>
        </span>
      </div>
    </div>
  );
}
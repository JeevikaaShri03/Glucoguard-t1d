"use client";

import { Liveline, type LivelinePoint, type LivelineSeries } from "liveline";
import { useEffect, useMemo, useState } from "react";

export interface LogEntry {
  id: string;
  timing: string;
  glucoseMgDl: number;
  carbsGrams?: number;
  bolusUnits?: number;
  basalUnits?: number;
  timestamp?: any;
}

interface InsightCardsProps {
  logs?: LogEntry[];
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function makePoints(values: number[], gap = 6): LivelinePoint[] {
  const end = Math.floor(Date.now() / 1000);
  return values.map((value, index) => ({
    time: end - (values.length - 1 - index) * gap,
    value,
  }));
}

function smooth(values: number[], perSegment = 9): number[] {
  if (values.length < 3) return values.slice();
  const out: number[] = [];
  const n = values.length;
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = values[Math.max(0, i - 1)];
    const p1 = values[i];
    const p2 = values[i + 1];
    const p3 = values[Math.min(n - 1, i + 2)];
    for (let s = 0; s < perSegment; s += 1) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push(
        0.5 *
          (2 * p1 +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
      );
    }
  }
  out.push(values[n - 1]);
  return out;
}

function smoothPoints(values: number[], spanSecs: number): LivelinePoint[] {
  const dense = smooth(values);
  return makePoints(dense, spanSecs / (dense.length - 1));
}

function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

function Mono({ children, tone }: { children: React.ReactNode; tone: "red" | "green" }) {
  return (
    <code className={`font-mono text-[11.5px] ${tone === "red" ? "text-rose-500" : "text-emerald-500"}`}>
      {children}
    </code>
  );
}

function chartIndexFromPointer(event: React.PointerEvent<HTMLDivElement>, pointCount: number) {
  const rect = event.currentTarget.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  return Math.round(progress * (pointCount - 1));
}

function ChartTooltip({ rows }: { rows: { label: string; value: string; color: string }[] }) {
  return (
    <div className="insight-chart-tooltip">
      {rows.map((row) => (
        <span key={row.label} className="insight-chart-tooltip-item">
          <span className="insight-chart-tooltip-dot" style={{ background: row.color }} />
          {row.value}
        </span>
      ))}
    </div>
  );
}

/* 1 — Real Firestore Trajectory Card */
function CompareCard({ logs }: { logs: LogEntry[] }) {
  const dark = useDarkMode();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const rawValues = useMemo(() => {
    if (logs.length === 0) return [120, 130, 115, 140, 125];
    return [...logs].reverse().map((l) => Number(l.glucoseMgDl) || 120);
  }, [logs]);

  const smoothed = useMemo(() => smoothPoints(rawValues, 42), [rawValues]);

  const latestGlucose = rawValues.at(-1) ?? 120;
  const avgGlucose = Math.round(rawValues.reduce((a, b) => a + b, 0) / rawValues.length);

  const series: LivelineSeries[] = useMemo(
    () => [
      {
        id: "glucose",
        label: "",
        data: smoothed,
        value: latestGlucose,
        color: "#38bdf8",
      },
    ],
    [smoothed, latestGlucose]
  );

  return (
    <div className="min-h-[278px] rounded-2xl bg-[var(--bg-card)] p-3 border border-[var(--border-color)] shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
            <span className="size-2 rounded-full bg-sky-400" />
            Latest Reading
          </span>
          <span className="block text-[17px] font-semibold tracking-[-0.01em] tabular-nums text-[var(--text-primary)]">
            {latestGlucose} mg/dL
          </span>
          <Mono tone={latestGlucose > 180 ? "red" : "green"}>
            {latestGlucose > 180 ? "Above Target" : "In Target Range"}
          </Mono>
        </div>
        <div className="flex-1">
          <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
            <span className="size-2 rounded-full bg-emerald-500" />
            Avg Glucose
          </span>
          <span className="block text-[17px] font-semibold tracking-[-0.01em] tabular-nums text-[var(--text-primary)]">
            {avgGlucose} mg/dL
          </span>
          <Mono tone="green">{logs.length} Checkups</Mono>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-2.5 py-1.5">
          <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">Glycemic Trajectory</span>
          <span className="rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)]">
            Realtime Log
          </span>
        </div>
        <div
          className="insight-chart-stage relative h-[166px]"
          onPointerDown={(e) => setHoverIndex(chartIndexFromPointer(e, smoothed.length))}
          onPointerMove={(e) => setHoverIndex(chartIndexFromPointer(e, smoothed.length))}
          onPointerLeave={() => setHoverIndex(null)}
          onPointerCancel={() => setHoverIndex(null)}
          onPointerUp={() => setHoverIndex(null)}
        >
          <Liveline
            data={smoothed}
            value={latestGlucose}
            series={series}
            theme={dark ? "dark" : "light"}
            grid={false}
            pulse={false}
            window={42}
            paused
            scrub={false}
            cursor="default"
            lineWidth={2.25}
            padding={{ top: 40, right: 0, bottom: 22, left: 0 }}
            formatValue={(v) => `${Math.round(v)} mg/dL`}
          />
          {hoverIndex !== null && (
            <>
              <span
                className="insight-chart-cursor"
                style={{ left: `${(hoverIndex / (smoothed.length - 1)) * 100}%` }}
              />
              <span
                className="insight-chart-tooltip-anchor"
                style={{
                  left: `${Math.min(Math.max((hoverIndex / (smoothed.length - 1)) * 100, 28), 72)}%`,
                }}
              >
                <ChartTooltip
                  rows={[
                    {
                      label: "Glucose",
                      value: `${Math.round(smoothed[hoverIndex].value)} mg/dL`,
                      color: "#38bdf8",
                    },
                  ]}
                />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* 2 — Spikes vs Lows Anomaly Card */
function AnomalyCard({ logs }: { logs: LogEntry[] }) {
  const dark = useDarkMode();
  const [metric, setMetric] = useState<"high" | "low">("high");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const rawValues = useMemo(() => {
    if (logs.length === 0) return [110, 190, 140, 210, 85, 230];
    return [...logs].reverse().map((l) => Number(l.glucoseMgDl) || 120);
  }, [logs]);

  const points = useMemo(() => makePoints(rawValues, 7), [rawValues]);
  const highSpikesCount = useMemo(() => rawValues.filter((v) => v > 180).length, [rawValues]);
  const lowSpikesCount = useMemo(() => rawValues.filter((v) => v < 70).length, [rawValues]);

  const value = points.at(-1)?.value ?? 120;

  return (
    <div className="min-h-[278px] rounded-2xl bg-[var(--bg-card)] p-3 border border-[var(--border-color)] shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-primary)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Glycemic Excursions
        </span>
        <span className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--text-secondary)] border border-[var(--border-color)]">
          Threshold &gt; 180
        </span>
      </div>
      <div className="mt-2 overflow-hidden rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-2.5 py-1.5">
          <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">
            {hoverIndex !== null ? `${Math.round(points[hoverIndex].value)} mg/dL` : "Checkup Trajectory"}
          </span>
          <span className="flex rounded-full bg-[var(--bg-card)] p-0.5 border border-[var(--border-color)]">
            {(["high", "low"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={metric === item}
                onClick={() => setMetric(item)}
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium transition-all duration-150 active:scale-[0.96] ${
                  metric === item ? "bg-[var(--bg-muted)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item === "high" ? "Spikes (>180)" : "Lows (<70)"}
              </button>
            ))}
          </span>
        </div>
        <div
          className="insight-chart-stage relative h-[166px]"
          onPointerDown={(e) => setHoverIndex(chartIndexFromPointer(e, points.length))}
          onPointerMove={(e) => setHoverIndex(chartIndexFromPointer(e, points.length))}
          onPointerLeave={() => setHoverIndex(null)}
          onPointerCancel={() => setHoverIndex(null)}
          onPointerUp={() => setHoverIndex(null)}
        >
          <Liveline
            data={points}
            value={value}
            theme={dark ? "dark" : "light"}
            color={metric === "high" ? "#ee5c61" : "#f59e0b"}
            grid
            scrub={false}
            fill={false}
            pulse={false}
            momentum={false}
            paused
            window={49}
            lineWidth={2.25}
            cursor="crosshair"
            padding={{ top: 34, right: 0, bottom: 22, left: 0 }}
            formatValue={(v) => `${Math.round(v)} mg/dL`}
          />
          {hoverIndex !== null && (
            <>
              <span className="insight-chart-cursor" style={{ left: `${(hoverIndex / (points.length - 1)) * 100}%` }} />
              <span className="insight-chart-tooltip-anchor" style={{ left: `${Math.min(Math.max((hoverIndex / (points.length - 1)) * 100, 28), 72)}%` }}>
                <ChartTooltip
                  rows={[{ label: "Glucose", value: `${Math.round(points[hoverIndex].value)} mg/dL`, color: metric === "high" ? "#ee5c61" : "#f59e0b" }]}
                />
              </span>
            </>
          )}
        </div>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] tabular-nums">
          {metric === "high" ? highSpikesCount : lowSpikesCount} Excursions Detected
        </span>
        <Mono tone={metric === "high" ? "red" : "green"}>
          {metric === "high" ? `${highSpikesCount} High Spikes` : `${lowSpikesCount} Lows`}
        </Mono>
      </div>
    </div>
  );
}

/* 3 — Range Allocation Breakdown Card */
function AllocationCard({ logs }: { logs: LogEntry[] }) {
  const analytics = useMemo(() => {
    if (logs.length === 0) return { inRangePct: 70, highPct: 20, lowPct: 10 };

    const total = logs.length;
    const inRange = logs.filter((l) => l.glucoseMgDl >= 70 && l.glucoseMgDl <= 180).length;
    const high = logs.filter((l) => l.glucoseMgDl > 180).length;
    const low = logs.filter((l) => l.glucoseMgDl < 70).length;

    return {
      inRangePct: Math.round((inRange / total) * 100),
      highPct: Math.round((high / total) * 100),
      lowPct: Math.round((low / total) * 100),
    };
  }, [logs]);

  const segments = [
    { name: "TIR", label: "Time In Range (70-180 mg/dL)", pct: analytics.inRangePct, cls: "bg-emerald-500", tone: "text-emerald-500" },
    { name: "HIGH", label: "Hyperglycemia (>180 mg/dL)", pct: analytics.highPct, cls: "bg-rose-500", tone: "text-rose-500" },
    { name: "LOW", label: "Hypoglycemia (<70 mg/dL)", pct: analytics.lowPct, cls: "bg-amber-500", tone: "text-amber-500" },
  ];

  const [selected, setSelected] = useState(segments[0].name);
  const active = segments.find((s) => s.name === selected) ?? segments[0];

  return (
    <div className="min-h-[278px] rounded-2xl bg-[var(--bg-card)] p-3 border border-[var(--border-color)] shadow-sm">
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-primary)]">
        <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
          T
        </span>
        Glycemic Distribution
      </span>
      <span className="mt-1 block text-[20px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] tabular-nums">
        {active.pct}% Allocation
      </span>

      <div className="mt-3 flex h-9 gap-0.5 overflow-hidden rounded-full bg-[var(--bg-muted)] p-0.5 border border-[var(--border-color)]" role="group">
        {segments.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={selected === s.name}
            onClick={() => setSelected(s.name)}
            className={`relative h-full overflow-hidden rounded-full ${s.cls} transition-all duration-300 active:scale-[0.98]`}
            style={{
              width: `${Math.max(s.pct, 5)}%`,
              opacity: selected === s.name ? 1 : 0.58,
              transitionTimingFunction: EASE,
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {segments.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={selected === s.name}
            onClick={() => setSelected(s.name)}
            className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] transition-all duration-150 active:scale-[0.96] ${
              selected === s.name ? "bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]/50"
            }`}
          >
            <span className={`size-1.5 rounded-full ${s.cls}`} />
            {s.name} <span className="tabular-nums">{s.pct}%</span>
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-16 rounded-xl bg-[var(--bg-muted)] px-2.5 py-2 border border-[var(--border-color)]">
        <span className={`block text-[11.5px] font-medium ${active.tone}`}>{active.label}</span>
        <span className="mt-1 block text-[11px] leading-relaxed text-[var(--text-secondary)]">
          Evaluates clinical time-in-range balance directly across your recorded Firestore checkup entries.
        </span>
      </div>
    </div>
  );
}

const PAGES = [
  {
    key: "compare",
    prose: (
      <>
        Realtime trajectory calculated across active <span className="font-semibold text-[var(--text-primary)]">Firestore telemetry</span> logs.
      </>
    ),
    Card: CompareCard,
    pill: "View detail breakdown",
  },
  {
    key: "anomaly",
    prose: (
      <>
        Glycemic excursions detected from recent patient checkups.
      </>
    ),
    Card: AnomalyCard,
    pill: "Inspect high spikes",
  },
  {
    key: "allocation",
    prose: (
      <>
        Distribution of logs within target clinical bounds (70–180 mg/dL).
      </>
    ),
    Card: AllocationCard,
    pill: "Analyze target balance",
  },
];

export default function InsightCards({ logs = [] }: InsightCardsProps) {
  const [page, setPage] = useState(0);

  const move = (direction: -1 | 1) => {
    setPage((current) => (current + direction + PAGES.length) % PAGES.length);
  };

  const { prose, Card, pill } = PAGES[page];

  return (
    <div className="min-h-[408px] w-full max-w-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">Insights</span>
          <span className="text-[13px] text-[var(--text-secondary)] tabular-nums">{PAGES.length}</span>
        </span>
        <span className="flex items-center gap-0.5">
          {(["M15 18l-6-6 6-6", "M9 6l6 6-6 6"] as const).map((d, i) => (
            <button
              key={i}
              aria-label={i === 0 ? "Previous insight" : "Next insight"}
              onClick={() => move(i === 0 ? -1 : 1)}
              className="flex size-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] active:scale-[0.96]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
            </button>
          ))}
        </span>
      </div>

      <div className="transition-all duration-250">
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">{prose}</p>
        <div className="mt-2">
          <Card logs={logs} />
        </div>
        <button className="mt-2 rounded-full bg-[var(--bg-card)] px-3 py-1.5 text-left text-[12px] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm transition-colors hover:bg-[var(--bg-muted)]">
          {pill}
        </button>
      </div>
    </div>
  );
}
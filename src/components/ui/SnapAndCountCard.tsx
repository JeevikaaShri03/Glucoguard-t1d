"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Zap,
  Bot,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner"; // Adjust this import path if your project uses a different toast provider (e.g., react-hot-toast or custom UI)

export interface FoodItem {
  name: string;
  portion: string;
  carbs_g: number;
  gi: "Low" | "Medium" | "High";
}

export interface SnapAgentData {
  food_items: FoodItem[];
  total_carbs_g: number;
  glycemic_load: "Low" | "Medium" | "High";
  predicted_spike: string;
  peak_time: string;
  spike_warning: string;
  confidence: "low" | "medium" | "high";
}

interface SnapAndCountCardProps {
  agentData: SnapAgentData | null;
  setAgentData: React.Dispatch<React.SetStateAction<SnapAgentData | null>>;
  onCarbChange: (index: number, newCarbs: number) => void;
  onDeleteComponent: (index: number) => void;
  spikeRange: string;
  onApprove: () => void;
  isSaving?: boolean;
}

/* ─────────────────────────────────────────────────────────
 * BEAUTIFUL UI PRIMITIVES: Pixel Grid Loader
 * ───────────────────────────────────────────────────────── */
const CHEVRON_DELAYS = [0, 90, 180, 90, 180, 270, 180, 270, 360];

function LoaderGrid() {
  return (
    <span aria-hidden className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px] my-auto">
      {CHEVRON_DELAYS.map((delay, index) => (
        <span
          key={index}
          className="size-[4px] rounded-[1px] bg-sky-500"
          style={{
            animation: `pixel-on 650ms ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}

function BeautifulLoadingState({ label }: { label: string }) {
  const [ds, setDs] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDs((d) => d + 1), 100);
    return () => clearInterval(t);
  }, []);

  const elapsed = (ds / 10).toFixed(1) + "s";

  return (
    <div role="status" className="flex items-center gap-2.5 py-2 px-1">
      <LoaderGrid />
      <span
        className="text-[13px] font-medium bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-sky-300 to-sky-500 bg-[length:200%_100%]"
        style={{ animation: "shimmer-text 1.4s linear infinite" }}
      >
        {label}
      </span>
      <span className="font-mono text-[12px] text-slate-400 tabular-nums ml-auto">
        {elapsed}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * BEAUTIFUL UI PRIMITIVES: Expandable Agent Thinking Trace
 * ───────────────────────────────────────────────────────── */
const THINKING_STEPS = [
  "Scanning multi-ingredient plate topology & volumetric depth...",
  "Running zero-shot food segmenter on visual regions...",
  "Cross-referencing glycemic index dataset for complex carbs...",
  "Calculating glucose velocity curve & peak time horizon...",
];

function BeautifulThinkingState({ isAnalyzing }: { isAnalyzing: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < THINKING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
          <span>{isAnalyzing ? "Thinking..." : `Thought for ${stepIndex + 1} seconds`}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-sky-500 transition-transform duration-300 ${
            expanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-sky-500/10 font-mono text-[11.5px] text-[var(--text-secondary)]">
          {THINKING_STEPS.slice(0, stepIndex + 1).map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 animate-fadeIn">
              <span className="text-sky-500 font-bold select-none">&gt;</span>
              <span className={idx === stepIndex && isAnalyzing ? "text-sky-500 font-medium" : ""}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * BEAUTIFUL UI PRIMITIVES: Word-by-Word Streaming Text
 * ───────────────────────────────────────────────────────── */
function BeautifulStreamingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const words = text.split(" ");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText("");
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < words.length) {
        setDisplayedText((prev) => (prev ? prev + " " + words[indexRef.current] : words[indexRef.current]));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="text-xs leading-relaxed text-[var(--text-primary)] font-medium">
      {displayedText}
      {indexRef.current < words.length && (
        <span className="inline-block w-1.5 h-3 ml-1 bg-sky-500 animate-pulse rounded-full align-middle" />
      )}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────
 * MAIN COMPONENT: SnapAndCountCard
 * ───────────────────────────────────────────────────────── */
export default function SnapAndCountCard({
  agentData,
  setAgentData,
  onCarbChange,
  onDeleteComponent,
  spikeRange,
  onApprove,
  isSaving = false,
}: SnapAndCountCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAgentData(null);
      setIsApproved(false);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setAgentData(null);
    setIsApproved(false);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("/api/snap", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setAgentData(json.data);
      } else {
        toast.error("Failed to analyze meal: " + json.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to Snap Agent.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveClick = () => {
    setIsApproved(true);
    onApprove();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm transition-colors">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Snap & Count Vision Agent
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                AI-native nutrition decomposition & spike forecasting
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] border border-[var(--border-color)]">
            v3.6-vision
          </span>
        </div>

        {/* Upload Dropzone */}
        {!previewUrl ? (
          <label className="border-2 border-dashed border-sky-500/20 rounded-2xl p-10 text-center flex flex-col items-center justify-center bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-500/40 transition-all cursor-pointer group block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-3 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              Drop plate snapshot here or click to browse
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Supports PNG, JPG, WEBP up to 10MB
            </p>
          </label>
        ) : (
          <div className="space-y-6">
            {/* Snapshot Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] max-h-64 bg-slate-900 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Meal Snapshot"
                className="object-cover w-full h-64"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setAgentData(null);
                  setIsApproved(false);
                }}
                className="absolute top-3 right-3 bg-slate-950/80 hover:bg-slate-950 text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all border border-white/10"
              >
                Change Photo
              </button>
            </div>

            {/* Run Analysis Trigger */}
            {!agentData && !isAnalyzing && (
              <button
                type="button"
                onClick={analyzeImage}
                className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Execute Vision Analysis</span>
              </button>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="space-y-3">
                <BeautifulLoadingState label="Decomposing meal items & computing glycemic metrics..." />
                <BeautifulThinkingState isAnalyzing={true} />
              </div>
            )}

            {/* Analysis Results & Editing */}
            {agentData && (
              <div className="space-y-4">
                <BeautifulThinkingState isAnalyzing={false} />

                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-6 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        Human-in-the-Loop Approval
                      </span>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Review & Edit Meal Decomposition
                      </h3>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                      Confidence: {(agentData.confidence || "high").toUpperCase()}
                    </span>
                  </div>

                  {/* Identified Food Items */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Identified Components (Edit carbs or remove item):
                    </label>

                    {(agentData.food_items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] gap-3 hover:border-sky-500/30 transition-all"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                            {item.portion} • GI Index:{" "}
                            <span className="font-semibold text-sky-500">
                              {item.gi}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.carbs_g}
                            onChange={(e) =>
                              onCarbChange(idx, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-2.5 py-1 text-xs font-bold text-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                          />
                          <span className="text-xs text-[var(--text-secondary)] font-semibold">
                            g
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteComponent(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                      <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                        Dynamic Carbs
                      </p>
                      <p className="text-lg font-black text-[var(--text-primary)] mt-0.5">
                        {agentData.total_carbs_g}{" "}
                        <span className="text-xs font-normal text-[var(--text-secondary)]">
                          g
                        </span>
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                      <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                        Recalculated Spike
                      </p>
                      <p className="text-sm font-bold text-amber-500 flex items-center gap-1 mt-1">
                        <Zap className="w-4 h-4 shrink-0" />
                        {spikeRange}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                      <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                        Peak Horizon
                      </p>
                      <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                        {agentData.peak_time || "45-60 mins"}
                      </p>
                    </div>
                  </div>

                  {/* Streaming Warning Text */}
                  {agentData.spike_warning && (
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <BeautifulStreamingText text={(agentData.spike_warning || "").replace(/\s*undefined\s*/gi, "").trim()} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
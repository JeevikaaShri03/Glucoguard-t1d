"use client";

import React from "react";
import { MealTimingId,MealTimingOption } from "@/src/types";

interface ToolChipsProps {
  items: MealTimingOption[];
  selected: MealTimingId | string;
  onSelect: (id: MealTimingId) => void;
}

export default function ToolChips({ items, selected, onSelect }: ToolChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSelected = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id as MealTimingId)}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isSelected
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
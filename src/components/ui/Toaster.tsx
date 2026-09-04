"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0f172a] group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl font-sans border p-4 flex items-center gap-3",
          description: "group-[.toast]:text-slate-400 text-xs font-normal mt-0.5",
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-slate-950 font-bold hover:group-[.toast]:bg-emerald-400 rounded-lg px-3 py-1 text-xs transition-colors",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300 hover:group-[.toast]:bg-slate-700 rounded-lg px-3 py-1 text-xs transition-colors",
          
          // Deep slate card with rich emerald success tint
          success:
            "!bg-[#062c19] !text-emerald-100 !border-emerald-500/30 [&_[data-description]]:!text-emerald-200/70 [&_svg]:!text-emerald-400",

          // Deep slate card with rich rose error tint
          error:
            "!bg-[#2c0b0e] !text-rose-100 !border-rose-500/30 [&_[data-description]]:!text-rose-200/70 [&_svg]:!text-rose-400",
        },
      }}
      {...props}
    />
  );
}
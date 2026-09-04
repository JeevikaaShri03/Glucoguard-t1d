// "use client";

// import Link from "next/link";
// import { useTheme } from "next-themes";
// import { useState, useEffect } from "react";
// import { Sun, Moon, Activity } from "lucide-react";

// export default function Navbar() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   return (
//     <header className="bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur border-b border-teal-500/20 sticky top-0 z-50 px-6 py-4">
//       <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
//         {/* Logo */}
//         <Link href="/" className="flex items-center gap-2">
//           <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/30">
//             <Activity className="w-6 h-6 text-teal-400" />
//           </div>
//           <span className="text-xl font-bold bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
//             GlucoGuard T1D
//           </span>
//         </Link>

//         {/* Navigation */}
//         <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium">
//           <Link href="/" className="px-3 py-1.5 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition">
//             Home
//           </Link>
//           <Link href="/log" className="px-3 py-1.5 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition">
//             Module 1: Snap & Log
//           </Link>
//           <Link href="/analytics" className="px-3 py-1.5 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition">
//             Module 2: Trends
//           </Link>
//           <Link href="/bedtime" className="px-3 py-1.5 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition">
//             Module 3: Bedtime Risk
//           </Link>
//           <Link href="/profile" className="px-3 py-1.5 rounded-xl hover:bg-teal-500/10 hover:text-teal-400 transition">
//             Module 4: Profile
//           </Link>
//         </nav>

//         {/* Theme Toggle Button */}
//         {mounted && (
//           <button
//             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//             className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-slate-800/80 hover:bg-slate-700 text-xs text-teal-400 transition"
//           >
//             {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
//           </button>
//         )}
//       </div>
//     </header>
//   );
// }
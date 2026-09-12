import React from "react";
import { BookOpen } from "lucide-react";
import DictionarySearch from "./components/DictionarySearch";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-colors duration-200 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-10">
        {/* Responsive Mobile-First Header */}
        <header className="mb-6 sm:mb-8 border-b border-slate-800/80 pb-4 sm:pb-6">
          <div className="flex items-center justify-between gap-3">
            {/* Logo + Title Group */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 shrink-0 shadow-lg shadow-indigo-950/50">
                <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    Digital TLM
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                    Smart Classroom Edition
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate mt-1">
                  द्विभाषी शिक्षण अधिगम सामग्री • NIPUN Bharat
                </p>
              </div>
            </div>

            {/* Right Side Theme Toggle */}
            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </div>

          <div className="sm:hidden mt-2.5 pl-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
              Smart Classroom Edition
            </span>
          </div>
        </header>

        {/* Main Dictionary App */}
        <main>
          <DictionarySearch />
        </main>
      </div>
    </div>
  );
}

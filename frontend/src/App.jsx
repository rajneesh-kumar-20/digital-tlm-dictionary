// frontend/src/App.jsx
import React, { useState } from "react";
import { BookOpen, Award, ShieldCheck } from "lucide-react";
import DictionarySearch from "./components/DictionarySearch";
import ThemeToggle from "./components/ThemeToggle";
import DailyQuiz from "./components/DailyQuiz";
import TeacherAdminModal from "./components/TeacherAdminModal";

export default function App() {
  const [currentWord, setCurrentWord] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Responsive Header */}
        <header className="mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-4 sm:pb-6">
          <div className="flex items-center justify-between gap-3">
            {/* Left Title */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Digital TLM
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                    Smart Classroom Edition
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-1">
                  द्विभाषी शिक्षण अधिगम सामग्री • NIPUN Bharat
                </p>
              </div>
            </div>

            {/* Right Side Header Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Daily Quiz Button */}
              <button
                type="button"
                onClick={() => setIsQuizOpen(true)}
                title="Daily Vocabulary Quiz"
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-300 hover:bg-amber-500/20 active:scale-95 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="hidden sm:inline">Quiz</span>
              </button>

              {/* Teacher Portal Button */}
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                title="Teacher Admin Portal"
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 active:scale-95 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Teacher Portal</span>
              </button>

              <ThemeToggle />
            </div>
          </div>

          <div className="sm:hidden mt-2.5 pl-1 flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
              Smart Classroom Edition
            </span>
          </div>
        </header>

        {/* Main Dictionary App */}
        <main>
          <DictionarySearch onWordChange={(word) => setCurrentWord(word)} />
        </main>
      </div>

      {/* Modals */}
      <DailyQuiz
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        activeWord={currentWord}
      />

      <TeacherAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

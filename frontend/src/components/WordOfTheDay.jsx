import React, { useEffect, useState } from "react";
import { Sparkles, Calendar, SearchCheck } from "lucide-react";
import AudioPlayer from "./AudioPlayer";

export default function WordOfTheDay({ currentSearchedWord }) {
  const [dailyWord, setDailyWord] = useState(null);

  useEffect(() => {
    const fetchDailyWord = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/words/word-of-the-day",
        );
        const data = await res.json();
        if (data.success) setDailyWord(data.data);
      } catch (err) {
        console.error("Word of the day error:", err);
      }
    };
    fetchDailyWord();
  }, []);
  // if user search any word then show searched word otherwise show default dailyWord
  const displayWord = currentSearchedWord || dailyWord;
  const isSearchMode = Boolean(currentSearchedWord);

  if (!displayWord) return null;

  return (
    <div className="mb-8 relative group">
      {/* Dynamic Glow */}
      <div
        className={`absolute -inset-0.5 rounded-3xl blur-md opacity-60 transition duration-500 ${
          isSearchMode
            ? "bg-gradient-to-r from-emerald-500/30 via-indigo-500/30 to-teal-500/30"
            : "bg-gradient-to-r from-amber-500/30 via-indigo-500/30 to-purple-500/30"
        }`}
      ></div>

      <div className="relative rounded-3xl p-6 sm:p-7 bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          {/* Dynamic Badge */}
          {isSearchMode ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 animate-fadeIn">
              <SearchCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>खोजा गया शब्द • SEARCHED WORD</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>आज का शब्द • WORD OF THE DAY</span>
            </div>
          )}

          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSearchMode ? "परिणाम दृश्य" : "दैनिक कक्षा गतिविधि"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-3xl sm:text-4xl font-black text-white capitalize tracking-tight">
                {displayWord.word}
              </h3>
              {displayWord.phonetic && (
                <span className="text-sm font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-0.5 rounded-lg">
                  {displayWord.phonetic}
                </span>
              )}
              {displayWord.hindiMeaning && (
                <span className="text-sm sm:text-base font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1 rounded-xl shadow-xs">
                  हिन्दी अर्थ: {displayWord.hindiMeaning}
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-xl leading-relaxed">
              {displayWord.meanings?.[0]?.definitions?.[0]}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AudioPlayer
              word={displayWord.word}
              audioUrl={displayWord.audioUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

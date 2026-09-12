import React from "react";
import { History, Trash2 } from "lucide-react";

export default function RecentHistory({
  history,
  onSelectWord,
  onClearHistory,
}) {
  if (history.length === 0) return null;

  return (
    <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <History className="w-3.5 h-3.5" />
        <span>Recent:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {history.map((word) => (
            <button
              key={word}
              onClick={() => onSelectWord(word)}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 capitalize transition-colors font-medium cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onClearHistory}
        className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3 h-3" />
        <span>Clear</span>
      </button>
    </div>
  );
}

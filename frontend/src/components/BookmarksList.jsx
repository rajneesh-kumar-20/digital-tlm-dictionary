// src/components/BookmarksList.jsx
import React from "react";
import { Bookmark, X } from "lucide-react";

export default function BookmarksList({
  bookmarks,
  onSelectWord,
  onRemoveBookmark,
}) {
  if (bookmarks.length === 0) return null;

  return (
    <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
      <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-medium text-sm">
        <Bookmark className="w-4 h-4 text-indigo-500" />
        <span>सहेजे गए शब्द / Bookmarks ({bookmarks.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {bookmarks.map((word) => (
          <span
            key={word}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-all shadow-xs"
          >
            <button
              onClick={() => onSelectWord(word)}
              className="capitalize cursor-pointer"
            >
              {word}
            </button>
            <button
              onClick={() => onRemoveBookmark(word)}
              className="p-0.5 text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

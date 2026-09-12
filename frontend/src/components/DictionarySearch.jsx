// frontend/src/components/DictionarySearch.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Star,
  Loader2,
  Sparkles,
  Database,
  BookOpenCheck,
  Calendar,
  SearchCheck,
  Languages,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import AudioPlayer from "./AudioPlayer";
import BookmarksList from "./BookmarksList";

const SUPPORTED_LANGUAGES = [
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "en", label: "English" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
];

const API_BASE_URL = "";

async function fetchClientTranslation(text, targetLang) {
  if (!text || targetLang === "en") return text;
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
    );
    const data = await res.json();
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0]
        .map((item) => item[0])
        .filter(Boolean)
        .join(" ");
    }
    return text;
  } catch (err) {
    return text;
  }
}

export default function DictionarySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLang, setSelectedLang] = useState("hi");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [dailyWord, setDailyWord] = useState(null);
  const [dataSource, setDataSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");

  const [currentMeaningText, setCurrentMeaningText] = useState("");
  const [translatedMeaningsList, setTranslatedMeaningsList] = useState([]);

  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("dictionary_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("dictionary_recent_history");
    return saved ? JSON.parse(saved) : [];
  });

  const debouncedQuery = useDebounce(searchTerm, 300);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const getDailyWord = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/words/word-of-the-day`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setDailyWord(data.data);
        }
      } catch (err) {
        console.error("Word of the day error:", err);
      }
    };
    getDailyWord();
  }, []);

  useEffect(() => {
    localStorage.setItem("dictionary_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("dictionary_recent_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/words/suggestions?q=${encodeURIComponent(debouncedQuery)}`,
        );
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data);
          setShowDropdown(data.data.length > 0);
        }
      } catch (err) {
        console.error("Suggestions error:", err);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const activeDisplayWord = selectedWord || dailyWord;

  useEffect(() => {
    const translateAllContent = async () => {
      if (!activeDisplayWord) return;
      setTranslating(true);

      try {
        if (selectedLang === "hi" && activeDisplayWord.hindiMeaning) {
          setCurrentMeaningText(activeDisplayWord.hindiMeaning);
        } else {
          const mainTrans = await fetchClientTranslation(
            activeDisplayWord.word,
            selectedLang,
          );
          setCurrentMeaningText(mainTrans);
        }

        if (selectedLang === "en") {
          setTranslatedMeaningsList(activeDisplayWord.meanings || []);
          setTranslating(false);
          return;
        }

        if (
          activeDisplayWord.meanings &&
          activeDisplayWord.meanings.length > 0
        ) {
          const translatedList = await Promise.all(
            activeDisplayWord.meanings.map(async (m) => {
              const transPos = await fetchClientTranslation(
                m.partOfSpeech,
                selectedLang,
              );
              const transDefs = await Promise.all(
                (m.definitions || []).map((def) =>
                  fetchClientTranslation(def, selectedLang),
                ),
              );
              const transExs = await Promise.all(
                (m.examples || []).map((ex) =>
                  fetchClientTranslation(ex, selectedLang),
                ),
              );

              return {
                partOfSpeech: transPos,
                definitions: transDefs,
                examples: transExs,
              };
            }),
          );
          setTranslatedMeaningsList(translatedList);
        }
      } catch (e) {
        setTranslatedMeaningsList(activeDisplayWord.meanings || []);
      } finally {
        setTranslating(false);
      }
    };

    translateAllContent();
  }, [activeDisplayWord, selectedLang]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addToHistory = (word) => {
    const cleanWord = word.trim().toLowerCase();
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== cleanWord);
      return [cleanWord, ...filtered].slice(0, 5);
    });
  };

  const fetchWordDetails = async (wordToFetch) => {
    const query = (wordToFetch || searchTerm).trim();
    if (!query) return;

    setLoading(true);
    setError("");
    setShowDropdown(false);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/words/search?q=${encodeURIComponent(query)}`,
      );
      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server connection issue");
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "शब्द नहीं मिला");
      }

      setSelectedWord(data.data);
      setDataSource(data.source || "database");
      addToHistory(query);
      setSearchTerm(query);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (word) => {
    const w = word.toLowerCase();
    if (bookmarks.includes(w)) {
      setBookmarks(bookmarks.filter((item) => item !== w));
    } else {
      setBookmarks([...bookmarks, w]);
    }
  };

  const isSearchMode = Boolean(selectedWord);
  const isCurrentBookmarked =
    activeDisplayWord &&
    bookmarks.includes(activeDisplayWord.word?.toLowerCase());
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) ||
    SUPPORTED_LANGUAGES[0];

  const meaningsToRender =
    translatedMeaningsList.length > 0
      ? translatedMeaningsList
      : activeDisplayWord
        ? activeDisplayWord.meanings
        : [];

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
      {/* 1. Hero Card - Fully Mobile Optimized */}
      {activeDisplayWord && (
        <div className="mb-6 relative group">
          <div
            className={`absolute -inset-0.5 rounded-2xl sm:rounded-3xl blur-md opacity-40 transition duration-500 ${
              isSearchMode
                ? "bg-gradient-to-r from-emerald-500/30 via-indigo-500/30 to-teal-500/30"
                : "bg-gradient-to-r from-amber-500/30 via-indigo-500/30 to-purple-500/30"
            }`}
          ></div>

          <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 shadow-xl">
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              {isSearchMode ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-sm">
                  <SearchCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>खोजा गया शब्द</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>आज का शब्द</span>
                </div>
              )}

              <div className="text-[11px] sm:text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/40 ml-auto">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>दैनिक TLM</span>
              </div>
            </div>

            {/* Word Details & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white capitalize tracking-tight break-words">
                    {activeDisplayWord.word}
                  </h3>

                  {activeDisplayWord.phonetic && (
                    <span className="text-xs sm:text-sm font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-lg">
                      {activeDisplayWord.phonetic}
                    </span>
                  )}

                  {isSearchMode && dataSource && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        dataSource === "database"
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                          : "bg-amber-950/60 text-amber-400 border-amber-800"
                      }`}
                    >
                      {dataSource === "database" ? (
                        <Database className="w-3 h-3" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {dataSource === "database" ? "Local DB" : "Live"}
                    </span>
                  )}
                </div>

                {/* Multilingual Meaning Tag */}
                {currentMeaningText && (
                  <div className="inline-flex items-center gap-2 max-w-full text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-600/70 px-3 py-1.5 rounded-xl shadow-sm">
                    {translating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    )}
                    <span className="truncate">
                      {currentLangObj.label.split(" ")[0]} अर्थ:{" "}
                      <strong className="text-white">
                        {currentMeaningText}
                      </strong>
                    </span>
                  </div>
                )}

                <p className="text-xs sm:text-base text-slate-300 line-clamp-3 leading-relaxed pt-1">
                  {meaningsToRender?.[0]?.definitions?.[0] ||
                    activeDisplayWord.meanings?.[0]?.definitions?.[0]}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-start pt-1">
                <AudioPlayer
                  word={activeDisplayWord.word}
                  audioUrl={activeDisplayWord.audioUrl}
                />

                <button
                  onClick={() => toggleBookmark(activeDisplayWord.word)}
                  title={
                    isCurrentBookmarked
                      ? "बुकमार्क हटाएं"
                      : "बुकमार्क में जोड़ें"
                  }
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
                    isCurrentBookmarked
                      ? "border-amber-700/80 bg-amber-950/60 text-amber-400"
                      : "border-slate-800 bg-slate-800/80 text-slate-400 hover:text-amber-400 hover:border-slate-700"
                  }`}
                >
                  <Star
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isCurrentBookmarked
                        ? "fill-amber-400 stroke-amber-400"
                        : "stroke-current"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Language Selector & Search Form */}
      <div ref={dropdownRef} className="relative z-20 space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">अर्थ एवं विवरण की भाषा:</span>
            <span className="sm:hidden">भाषा:</span>
            {translating && (
              <span className="text-indigo-400 text-[11px] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> अनुवाद...
              </span>
            )}
          </div>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-indigo-300 font-medium text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-slate-900 text-white"
              >
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWordDetails();
          }}
          className="relative flex items-center shadow-lg rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-1.5 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
        >
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>

          <input
            type="text"
            placeholder="अंग्रेजी शब्द खोजें (उदा. urgent, achieve)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="w-full py-2 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm sm:text-base min-w-0"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0 ml-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>खोजें</span>
            )}
          </button>
        </form>

        {/* Suggestions List */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 bg-slate-900/98 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800/80">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => fetchWordDetails(item)}
                className="px-4 py-2.5 hover:bg-indigo-600/15 text-slate-200 cursor-pointer text-xs sm:text-sm flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="capitalize font-medium text-white">
                    {item}
                  </span>
                </div>
                <span className="text-[11px] text-indigo-400 font-medium">
                  खोलें →
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Recent Searches - Compact Wrap */}
        {history.length > 0 && (
          <div className="pt-1 flex items-center justify-between gap-2 flex-wrap text-xs text-slate-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <RotateCcw className="w-3 h-3" /> Recent:
              </span>
              {history.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => fetchWordDetails(word)}
                  className="bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[11px] px-2 py-0.5 rounded-md border border-slate-700/60 transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>

            <button
              onClick={() => setHistory([])}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors ml-auto"
              title="Clear history"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
          <span className="text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* 3. Detailed Meanings */}
      {activeDisplayWord && (
        <div className="mt-6 space-y-3">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">
            विस्तृत अर्थ एवं उदाहरण
          </h4>

          {meaningsToRender.map((meaning, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500"></div>

              <div className="flex items-center gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 flex items-center gap-1">
                  <BookOpenCheck className="w-3 h-3" />
                  {meaning.partOfSpeech}
                </span>
              </div>

              <ul className="space-y-2 pl-1.5 text-slate-200 text-xs sm:text-sm leading-relaxed">
                {(meaning.definitions || []).map((def, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                    <span>{def}</span>
                  </li>
                ))}
              </ul>

              {meaning.examples && meaning.examples.length > 0 && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-amber-400 mr-1.5">
                    उदाहरण:
                  </span>
                  <span className="italic font-light">
                    "{meaning.examples[0]}"
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Bookmarks */}
      <BookmarksList
        bookmarks={bookmarks}
        onSelectWord={(w) => fetchWordDetails(w)}
        onRemoveBookmark={(w) =>
          setBookmarks(bookmarks.filter((item) => item !== w))
        }
      />
    </div>
  );
}

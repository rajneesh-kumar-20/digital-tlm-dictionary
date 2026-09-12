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
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import AudioPlayer from "./AudioPlayer";
import BookmarksList from "./BookmarksList";
import RecentHistory from "./RecentHistory";

const SUPPORTED_LANGUAGES = [
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "en", label: "English" },
];

// Production me same domain se API call hogi
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
    <div>
      {/* Hero Card */}
      {activeDisplayWord && (
        <div className="mb-8 relative group">
          <div
            className={`absolute -inset-0.5 rounded-3xl blur-md opacity-60 transition duration-500 ${
              isSearchMode
                ? "bg-gradient-to-r from-emerald-500/30 via-indigo-500/30 to-teal-500/30"
                : "bg-gradient-to-r from-amber-500/30 via-indigo-500/30 to-purple-500/30"
            }`}
          ></div>

          <div className="relative rounded-3xl p-6 sm:p-7 bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              {isSearchMode ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md">
                  <SearchCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>खोजा गया शब्द • SEARCHED WORD</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>आज का शब्द • WORD OF THE DAY</span>
                </div>
              )}

              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {isSearchMode ? "परिणाम दृश्य" : "दैनिक कक्षा गतिविधि"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-3xl sm:text-4xl font-black text-white capitalize tracking-tight">
                    {activeDisplayWord.word}
                  </h3>

                  {activeDisplayWord.phonetic && (
                    <span className="text-sm font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-0.5 rounded-lg">
                      {activeDisplayWord.phonetic}
                    </span>
                  )}

                  {currentMeaningText && (
                    <span className="text-sm sm:text-base font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-600/70 px-4 py-1.5 rounded-xl shadow-md flex items-center gap-2">
                      {translating && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      )}
                      <span>
                        {currentLangObj.label.split(" ")[0]} अर्थ:{" "}
                        {currentMeaningText}
                      </span>
                    </span>
                  )}

                  {isSearchMode && dataSource && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        dataSource === "database"
                          ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
                          : "bg-amber-950/50 text-amber-400 border-amber-800"
                      }`}
                    >
                      {dataSource === "database" ? (
                        <Database className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {dataSource === "database" ? "Local DB" : "Live Fetched"}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-xl leading-relaxed">
                  {meaningsToRender?.[0]?.definitions?.[0] ||
                    activeDisplayWord.meanings?.[0]?.definitions?.[0]}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
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
                  className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
                    isCurrentBookmarked
                      ? "border-amber-700/80 bg-amber-950/60 text-amber-400"
                      : "border-slate-800 bg-slate-800/60 text-slate-400 hover:text-amber-400 hover:border-slate-700"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
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

      {/* Language Selector & Search Form */}
      <div ref={dropdownRef} className="relative z-20">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Languages className="w-4 h-4 text-indigo-400" />
            <span>अर्थ एवं विवरण की भाषा:</span>
            {translating && (
              <span className="text-indigo-400 text-xs flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> अनुवाद हो रहा है...
              </span>
            )}
          </div>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-900 border border-indigo-500/50 text-indigo-300 font-semibold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-md"
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWordDetails();
          }}
          className="relative flex items-center shadow-xl rounded-2xl bg-slate-900 border border-slate-800 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15"
        >
          <div className="pl-3.5 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-indigo-400" />
          </div>

          <input
            type="text"
            placeholder="अंग्रेजी शब्द खोजें (उदा. urgent, achieve, diligent)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="w-full py-2.5 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>खोजें (Search)</span>
            )}
          </button>
        </form>

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800/80">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => fetchWordDetails(item)}
                className="px-5 py-3 hover:bg-indigo-600/15 text-slate-200 cursor-pointer text-sm flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <span className="capitalize font-semibold text-white">
                    {item}
                  </span>
                </div>
                <span className="text-xs text-indigo-400 font-medium">
                  खोलें →
                </span>
              </li>
            ))}
          </ul>
        )}

        <RecentHistory
          history={history}
          onSelectWord={(w) => fetchWordDetails(w)}
          onClearHistory={() => setHistory([])}
        />
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Detailed Meanings */}
      {activeDisplayWord && (
        <div className="mt-8 space-y-4">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">
            विस्तृत अर्थ एवं उदाहरण (Detailed Meanings)
          </h4>

          {meaningsToRender.map((meaning, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-500"></div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 flex items-center gap-1.5">
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  {meaning.partOfSpeech}
                </span>
              </div>

              <ul className="space-y-3 pl-2 text-slate-200 text-base leading-relaxed">
                {(meaning.definitions || []).map((def, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                    <span>{def}</span>
                  </li>
                ))}
              </ul>

              {meaning.examples && meaning.examples.length > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300">
                  <span className="font-bold text-amber-400 mr-2">
                    उदाहरण (Example):
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

      {/* Bookmarks */}
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

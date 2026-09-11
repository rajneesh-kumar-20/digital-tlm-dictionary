// frontend/src/components/DictionarySearch.jsx
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Search,
//   Star,
//   Loader2,
//   Sparkles,
//   Database,
//   BookOpenCheck,
// } from "lucide-react";
// import { useDebounce } from "../hooks/useDebounce";
// import AudioPlayer from "./AudioPlayer";
// import BookmarksList from "./BookmarksList";
// import RecentHistory from "./RecentHistory";
// import WordOfTheDay from "./WordOfTheDay";

// export default function DictionarySearch() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedWord, setSelectedWord] = useState(null);
//   const [dataSource, setDataSource] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [bookmarks, setBookmarks] = useState(() => {
//     const saved = localStorage.getItem("dictionary_bookmarks");
//     return saved ? JSON.parse(saved) : ["resilient"];
//   });

//   const [history, setHistory] = useState(() => {
//     const saved = localStorage.getItem("dictionary_recent_history");
//     return saved ? JSON.parse(saved) : ["resilient"];
//   });

//   const debouncedQuery = useDebounce(searchTerm, 300);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     localStorage.setItem("dictionary_bookmarks", JSON.stringify(bookmarks));
//   }, [bookmarks]);

//   useEffect(() => {
//     localStorage.setItem("dictionary_recent_history", JSON.stringify(history));
//   }, [history]);

//   // useEffect(() => {
//   //   fetchWordDetails("resilient");
//   // }, []);

//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (!debouncedQuery.trim()) {
//         setSuggestions([]);
//         return;
//       }
//       try {
//         const res = await fetch(
//           `http://localhost:8080/api/words/suggestions?q=${debouncedQuery}`,
//         );
//         const data = await res.json();
//         if (data.success) {
//           setSuggestions(data.data);
//           setShowDropdown(data.data.length > 0);
//         }
//       } catch (err) {
//         console.error("Suggestions error:", err);
//       }
//     };
//     fetchSuggestions();
//   }, [debouncedQuery]);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const addToHistory = (word) => {
//     const cleanWord = word.trim().toLowerCase();
//     setHistory((prev) => {
//       const filtered = prev.filter((item) => item !== cleanWord);
//       return [cleanWord, ...filtered].slice(0, 5);
//     });
//   };

//   const fetchWordDetails = async (wordToFetch) => {
//     const query = (wordToFetch || searchTerm).trim();
//     if (!query) return;

//     setLoading(true);
//     setError("");
//     setShowDropdown(false);

//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/words/search?q=${query}`,
//       );
//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Word not found in dictionary");
//       }

//       setSelectedWord(data.data);
//       setDataSource(data.source || "database");
//       addToHistory(query);
//       setSearchTerm(query);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleBookmark = (word) => {
//     const w = word.toLowerCase();
//     if (bookmarks.includes(w)) {
//       setBookmarks(bookmarks.filter((item) => item !== w));
//     } else {
//       setBookmarks([...bookmarks, w]);
//     }
//   };

//   const isCurrentBookmarked =
//     selectedWord && bookmarks.includes(selectedWord.word.toLowerCase());

//   return (
//     <div>
//       {/* 1. Hero Word of the Day Banner */}
//       <WordOfTheDay onSelectWord={(w) => fetchWordDetails(w)} />

//       {/* 2. Modern Search Bar Container */}
//       <div ref={dropdownRef} className="relative z-20">
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             fetchWordDetails();
//           }}
//           className="relative flex items-center shadow-xl shadow-indigo-950/40 rounded-2xl bg-slate-900 border border-slate-800 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15"
//         >
//           <div className="pl-3.5 pr-2 text-slate-400">
//             <Search className="w-5 h-5 text-indigo-400" />
//           </div>

//           <input
//             type="text"
//             placeholder="शब्द खोजें (उदा. resilient, serendipity, eloquent)..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
//             className="w-full py-2.5 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
//           >
//             {loading ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <span>खोजें (Search)</span>
//             )}
//           </button>
//         </form>

//         {/* Live Autocomplete Dropdown */}
//         {showDropdown && suggestions.length > 0 && (
//           <ul className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800/80">
//             {suggestions.map((item, idx) => (
//               <li
//                 key={idx}
//                 onClick={() => fetchWordDetails(item)}
//                 className="px-5 py-3 hover:bg-indigo-600/15 text-slate-200 cursor-pointer text-sm flex items-center justify-between transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <Search className="w-4 h-4 text-indigo-400" />
//                   <span className="capitalize font-semibold text-white">
//                     {item}
//                   </span>
//                 </div>
//                 <span className="text-xs text-indigo-400 font-medium">
//                   खोलें →
//                 </span>
//               </li>
//             ))}
//           </ul>
//         )}

//         {/* Recent Search Chips */}
//         <RecentHistory
//           history={history}
//           onSelectWord={(w) => fetchWordDetails(w)}
//           onClearHistory={() => setHistory([])}
//         />
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mt-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
//           <span className="text-xl">⚠️</span>
//           <span>{error}</span>
//         </div>
//       )}

//       {/* 3. Word Details Card */}
//       {selectedWord && (
//         <div className="mt-8 bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
//             <div>
//               <div className="flex items-center gap-3 flex-wrap">
//                 <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white capitalize">
//                   {selectedWord.word}
//                 </h2>

//                 {/* Hindi Meaning Badge */}
//                 {selectedWord.hindiMeaning && (
//                   <span className="text-sm sm:text-base font-bold text-emerald-300 bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-700/60 shadow-xs">
//                     हिन्दी: {selectedWord.hindiMeaning}
//                   </span>
//                 )}

//                 {/* Source Badge */}
//                 {dataSource && (
//                   <span
//                     className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold border ${
//                       dataSource === "database"
//                         ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
//                         : "bg-amber-950/50 text-amber-400 border-amber-800"
//                     }`}
//                   >
//                     {dataSource === "database" ? (
//                       <Database className="w-3.5 h-3.5" />
//                     ) : (
//                       <Sparkles className="w-3.5 h-3.5" />
//                     )}
//                     {dataSource === "database"
//                       ? "Local DB"
//                       : "Fetched & Cached"}
//                   </span>
//                 )}
//               </div>

//               {selectedWord.phonetic && (
//                 <p className="mt-2 text-base text-slate-400 font-mono tracking-wide">
//                   {selectedWord.phonetic}
//                 </p>
//               )}
//             </div>

//             {/* Action buttons */}
//             <div className="flex items-center gap-2.5 self-start sm:self-center">
//               <AudioPlayer
//                 word={selectedWord.word}
//                 audioUrl={selectedWord.audioUrl}
//               />

//               <button
//                 onClick={() => toggleBookmark(selectedWord.word)}
//                 title={
//                   isCurrentBookmarked ? "बुकमार्क हटाएं" : "बुकमार्क में जोड़ें"
//                 }
//                 className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
//                   isCurrentBookmarked
//                     ? "border-amber-700/80 bg-amber-950/60 text-amber-400"
//                     : "border-slate-800 bg-slate-800/60 text-slate-400 hover:text-amber-400 hover:border-slate-700"
//                 }`}
//               >
//                 <Star
//                   className={`w-5 h-5 ${
//                     isCurrentBookmarked
//                       ? "fill-amber-400 stroke-amber-400"
//                       : "stroke-current"
//                   }`}
//                 />
//               </button>
//             </div>
//           </div>

//           {/* Meaning Card Blocks */}
//           <div className="mt-8 space-y-4">
//             {selectedWord.meanings.map((meaning, idx) => (
//               <div
//                 key={idx}
//                 className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all"
//               >
//                 {/* Decorative bar */}
//                 <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-500"></div>

//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 flex items-center gap-1.5">
//                     <BookOpenCheck className="w-3.5 h-3.5" />
//                     {meaning.partOfSpeech}
//                   </span>
//                 </div>

//                 <ul className="space-y-3 pl-2 text-slate-200 text-base leading-relaxed">
//                   {meaning.definitions.map((def, dIdx) => (
//                     <li key={dIdx} className="flex items-start gap-2.5">
//                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
//                       <span>{def}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 {meaning.examples && meaning.examples.length > 0 && (
//                   <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300">
//                     <span className="font-bold text-amber-400 mr-2">
//                       उदाहरण (Example):
//                     </span>
//                     <span className="italic font-light">
//                       "{meaning.examples[0]}"
//                     </span>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* 4. Bookmarks Section */}
//       <BookmarksList
//         bookmarks={bookmarks}
//         onSelectWord={(w) => fetchWordDetails(w)}
//         onRemoveBookmark={(w) =>
//           setBookmarks(bookmarks.filter((item) => item !== w))
//         }
//       />
//     </div>
//   );
// }

// frontend/src/components/DictionarySearch.jsx
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Search,
//   Star,
//   Loader2,
//   Sparkles,
//   Database,
//   BookOpenCheck,
//   SearchCode,
// } from "lucide-react";
// import { useDebounce } from "../hooks/useDebounce";
// import AudioPlayer from "./AudioPlayer";
// import BookmarksList from "./BookmarksList";
// import RecentHistory from "./RecentHistory";
// import WordOfTheDay from "./WordOfTheDay";

// export default function DictionarySearch() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedWord, setSelectedWord] = useState(null);
//   const [dataSource, setDataSource] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [bookmarks, setBookmarks] = useState(() => {
//     const saved = localStorage.getItem("dictionary_bookmarks");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const [history, setHistory] = useState(() => {
//     const saved = localStorage.getItem("dictionary_recent_history");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const debouncedQuery = useDebounce(searchTerm, 300);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     localStorage.setItem("dictionary_bookmarks", JSON.stringify(bookmarks));
//   }, [bookmarks]);

//   useEffect(() => {
//     localStorage.setItem("dictionary_recent_history", JSON.stringify(history));
//   }, [history]);

//   // Suggestions search
//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (!debouncedQuery.trim()) {
//         setSuggestions([]);
//         return;
//       }
//       try {
//         const res = await fetch(
//           `http://localhost:8080/api/words/suggestions?q=${debouncedQuery}`,
//         );
//         const data = await res.json();
//         if (data.success) {
//           setSuggestions(data.data);
//           setShowDropdown(data.data.length > 0);
//         }
//       } catch (err) {
//         console.error("Suggestions error:", err);
//       }
//     };
//     fetchSuggestions();
//   }, [debouncedQuery]);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const addToHistory = (word) => {
//     const cleanWord = word.trim().toLowerCase();
//     setHistory((prev) => {
//       const filtered = prev.filter((item) => item !== cleanWord);
//       return [cleanWord, ...filtered].slice(0, 5);
//     });
//   };

//   const fetchWordDetails = async (wordToFetch) => {
//     const query = (wordToFetch || searchTerm).trim();
//     if (!query) return;

//     setLoading(true);
//     setError("");
//     setShowDropdown(false);

//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/words/search?q=${query}`,
//       );
//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Word not found in dictionary");
//       }

//       setSelectedWord(data.data);
//       setDataSource(data.source || "database");
//       addToHistory(query);
//       setSearchTerm(query);
//     } catch (err) {
//       setError(err.message);
//       setSelectedWord(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleBookmark = (word) => {
//     const w = word.toLowerCase();
//     if (bookmarks.includes(w)) {
//       setBookmarks(bookmarks.filter((item) => item !== w));
//     } else {
//       setBookmarks([...bookmarks, w]);
//     }
//   };

//   const isCurrentBookmarked =
//     selectedWord && bookmarks.includes(selectedWord.word.toLowerCase());

//   return (
//     <div>
//       {/* 1. Hero Word of the Day Banner */}
//       <WordOfTheDay onSelectWord={(w) => fetchWordDetails(w)} />

//       {/* 2. Modern Search Bar Container */}
//       <div ref={dropdownRef} className="relative z-20">
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             fetchWordDetails();
//           }}
//           className="relative flex items-center shadow-xl shadow-indigo-950/40 rounded-2xl bg-slate-900 border border-slate-800 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15"
//         >
//           <div className="pl-3.5 pr-2 text-slate-400">
//             <Search className="w-5 h-5 text-indigo-400" />
//           </div>

//           <input
//             type="text"
//             placeholder="शब्द खोजें (उदा. accurate, brilliant, courage, discipline)..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
//             className="w-full py-2.5 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
//           >
//             {loading ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <span>खोजें (Search)</span>
//             )}
//           </button>
//         </form>

//         {/* Live Autocomplete Dropdown */}
//         {showDropdown && suggestions.length > 0 && (
//           <ul className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800/80">
//             {suggestions.map((item, idx) => (
//               <li
//                 key={idx}
//                 onClick={() => fetchWordDetails(item)}
//                 className="px-5 py-3 hover:bg-indigo-600/15 text-slate-200 cursor-pointer text-sm flex items-center justify-between transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <Search className="w-4 h-4 text-indigo-400" />
//                   <span className="capitalize font-semibold text-white">
//                     {item}
//                   </span>
//                 </div>
//                 <span className="text-xs text-indigo-400 font-medium">
//                   खोलें →
//                 </span>
//               </li>
//             ))}
//           </ul>
//         )}

//         {/* Recent Search Chips */}
//         <RecentHistory
//           history={history}
//           onSelectWord={(w) => fetchWordDetails(w)}
//           onClearHistory={() => setHistory([])}
//         />
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mt-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
//           <span className="text-xl">⚠️</span>
//           <span>{error}</span>
//         </div>
//       )}

//       {/* 3. Searched Word Details Card (Jab user search kare tabhi aayega) */}
//       {selectedWord ? (
//         <div className="mt-8 bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative animate-fadeIn">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
//             <div>
//               <div className="flex items-center gap-3 flex-wrap">
//                 <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white capitalize">
//                   {selectedWord.word}
//                 </h2>

//                 {/* Hindi Meaning Badge */}
//                 {selectedWord.hindiMeaning && (
//                   <span className="text-sm sm:text-base font-bold text-emerald-300 bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-700/60 shadow-xs">
//                     हिन्दी: {selectedWord.hindiMeaning}
//                   </span>
//                 )}

//                 {/* Source Badge */}
//                 {dataSource && (
//                   <span
//                     className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold border ${
//                       dataSource === "database"
//                         ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
//                         : "bg-amber-950/50 text-amber-400 border-amber-800"
//                     }`}
//                   >
//                     {dataSource === "database" ? (
//                       <Database className="w-3.5 h-3.5" />
//                     ) : (
//                       <Sparkles className="w-3.5 h-3.5" />
//                     )}
//                     {dataSource === "database"
//                       ? "Local DB"
//                       : "Fetched & Cached"}
//                   </span>
//                 )}
//               </div>

//               {selectedWord.phonetic && (
//                 <p className="mt-2 text-base text-slate-400 font-mono tracking-wide">
//                   {selectedWord.phonetic}
//                 </p>
//               )}
//             </div>

//             {/* Action buttons */}
//             <div className="flex items-center gap-2.5 self-start sm:self-center">
//               <AudioPlayer
//                 word={selectedWord.word}
//                 audioUrl={selectedWord.audioUrl}
//               />

//               <button
//                 onClick={() => toggleBookmark(selectedWord.word)}
//                 title={
//                   isCurrentBookmarked ? "बुकमार्क हटाएं" : "बुकमार्क में जोड़ें"
//                 }
//                 className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
//                   isCurrentBookmarked
//                     ? "border-amber-700/80 bg-amber-950/60 text-amber-400"
//                     : "border-slate-800 bg-slate-800/60 text-slate-400 hover:text-amber-400 hover:border-slate-700"
//                 }`}
//               >
//                 <Star
//                   className={`w-5 h-5 ${
//                     isCurrentBookmarked
//                       ? "fill-amber-400 stroke-amber-400"
//                       : "stroke-current"
//                   }`}
//                 />
//               </button>
//             </div>
//           </div>

//           {/* Meaning Card Blocks */}
//           <div className="mt-8 space-y-4">
//             {selectedWord.meanings.map((meaning, idx) => (
//               <div
//                 key={idx}
//                 className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all"
//               >
//                 <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-500"></div>

//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 flex items-center gap-1.5">
//                     <BookOpenCheck className="w-3.5 h-3.5" />
//                     {meaning.partOfSpeech}
//                   </span>
//                 </div>

//                 <ul className="space-y-3 pl-2 text-slate-200 text-base leading-relaxed">
//                   {meaning.definitions.map((def, dIdx) => (
//                     <li key={dIdx} className="flex items-start gap-2.5">
//                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
//                       <span>{def}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 {meaning.examples && meaning.examples.length > 0 && (
//                   <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300">
//                     <span className="font-bold text-amber-400 mr-2">
//                       उदाहरण (Example):
//                     </span>
//                     <span className="italic font-light">
//                       "{meaning.examples[0]}"
//                     </span>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         /* Empty State Placeholder (Jab tak koi word search nahi hua) */
//         !loading &&
//         !error && (
//           <div className="mt-10 py-12 px-6 rounded-3xl border border-dashed border-slate-800 text-center bg-slate-900/30">
//             <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
//               <SearchCode className="w-6 h-6" />
//             </div>
//             <h3 className="text-base font-semibold text-slate-300">
//               कोई शब्द खोजें / Search Any Word
//             </h3>
//             <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
//               ऊपर सर्च बॉक्स में कोई भी शब्द टाइप करें और खोजें बटन दबाएं या "आज
//               का शब्द" में "विस्तार से देखें" पर क्लिक करें।
//             </p>
//           </div>
//         )
//       )}

//       {/* 4. Bookmarks Section */}
//       <BookmarksList
//         bookmarks={bookmarks}
//         onSelectWord={(w) => fetchWordDetails(w)}
//         onRemoveBookmark={(w) =>
//           setBookmarks(bookmarks.filter((item) => item !== w))
//         }
//       />
//     </div>
//   );
// }

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
  SearchCode,
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import AudioPlayer from "./AudioPlayer";
import BookmarksList from "./BookmarksList";
import RecentHistory from "./RecentHistory";

export default function DictionarySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [dailyWord, setDailyWord] = useState(null); // Default Daily Word
  const [dataSource, setDataSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // 1. Initial Load par "Word of the Day" fetch karein
  useEffect(() => {
    const fetchDailyWord = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/words/word-of-the-day",
        );
        const data = await res.json();
        if (data.success) {
          setDailyWord(data.data);
        }
      } catch (err) {
        console.error("Word of the day error:", err);
      }
    };
    fetchDailyWord();
  }, []);

  useEffect(() => {
    localStorage.setItem("dictionary_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("dictionary_recent_history", JSON.stringify(history));
  }, [history]);

  // Suggestions search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:8080/api/words/suggestions?q=${debouncedQuery}`,
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

  // Search Logic
  const fetchWordDetails = async (wordToFetch) => {
    const query = (wordToFetch || searchTerm).trim();
    if (!query) return;

    setLoading(true);
    setError("");
    setShowDropdown(false);

    try {
      const res = await fetch(
        `http://localhost:8080/api/words/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Word not found in dictionary");
      }

      // Live update state
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

  // Display target: Agar user ne search kiya hai toh selectedWord, warna default dailyWord
  const activeDisplayWord = selectedWord || dailyWord;
  const isSearchMode = Boolean(selectedWord);
  const isCurrentBookmarked =
    activeDisplayWord &&
    bookmarks.includes(activeDisplayWord.word?.toLowerCase());

  return (
    <div>
      {/* 1. Dynamic Hero Banner (Searched Word ya Word of the Day) */}
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
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20">
                  <SearchCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>खोजा गया शब्द • SEARCHED WORD</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20">
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
                  {activeDisplayWord.hindiMeaning && (
                    <span className="text-sm sm:text-base font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 px-3.5 py-1 rounded-xl shadow-xs">
                      हिन्दी अर्थ: {activeDisplayWord.hindiMeaning}
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
                      {dataSource === "database"
                        ? "Local DB"
                        : "Fetched & Cached"}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-xl leading-relaxed">
                  {activeDisplayWord.meanings?.[0]?.definitions?.[0]}
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

      {/* 2. Search Bar */}
      <div ref={dropdownRef} className="relative z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWordDetails();
          }}
          className="relative flex items-center shadow-xl shadow-indigo-950/40 rounded-2xl bg-slate-900 border border-slate-800 p-2 transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15"
        >
          <div className="pl-3.5 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-indigo-400" />
          </div>

          <input
            type="text"
            placeholder="शब्द खोजें (उदा. resilient, serendipity, eloquent)..."
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

        {/* Suggestions Dropdown */}
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

        {/* Recent History */}
        <RecentHistory
          history={history}
          onSelectWord={(w) => fetchWordDetails(w)}
          onClearHistory={() => setHistory([])}
        />
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* 3. Detailed Meanings Section (Agar search hua ho) */}
      {selectedWord && (
        <div className="mt-8 space-y-4">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">
            विस्तृत अर्थ एवं उदाहरण (Detailed Meanings)
          </h4>

          {selectedWord.meanings.map((meaning, idx) => (
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
                {meaning.definitions.map((def, dIdx) => (
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

      {/* 4. Bookmarks Section */}
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

// frontend/src/components/DailyQuiz.jsx
import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  X,
  Loader2,
  Sparkles,
  Trophy,
  Flame,
} from "lucide-react";

export default function DailyQuiz({ isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState(false);

  // Fetch 10 fresh random questions
  const fetchNewQuiz = async () => {
    setLoading(true);
    setQuizFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnsweringLocked(false);

    try {
      const res = await fetch("/api/words/quiz/generate");
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        setQuestions(json.data);
      } else {
        throw new Error("Questions load nahi ho sake");
      }
    } catch (err) {
      console.error("Quiz fetch error:", err);
      // Fallback
      setQuestions([
        {
          id: 1,
          word: "Adapt",
          partOfSpeech: "verb",
          options: [
            { text: "अनुकूल बनाना / ढलना", isCorrect: true },
            { text: "कठिनाई पैदा करना", isCorrect: false },
            { text: "धीमी गति से चलना", isCorrect: false },
            { text: "रोक लगाना", isCorrect: false },
          ],
        },
        {
          id: 2,
          word: "Resilient",
          partOfSpeech: "adjective",
          options: [
            { text: "लचीला / सहनशील", isCorrect: true },
            { text: "दूर चले जाना", isCorrect: false },
            { text: "संदेह व्यक्त करना", isCorrect: false },
            { text: "विनाशकारी प्रभाव", isCorrect: false },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNewQuiz();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt) => {
    if (isAnsweringLocked || quizFinished) return;

    setSelectedOption(opt);
    setIsAnsweringLocked(true);

    if (opt.isCorrect) {
      setScore((prev) => prev + 1);
    }

    // 800ms auto next question
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnsweringLocked(false);
      } else {
        setQuizFinished(true);
        setIsAnsweringLocked(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 w-full max-w-lg shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LOADING SCREEN */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-9 h-9 animate-spin text-indigo-400 mx-auto" />
            <p className="text-white font-semibold text-sm">
              10 नए शब्द और क्विज लोड हो रहे हैं...
            </p>
            <p className="text-xs text-slate-400">Classroom Smart Evaluation</p>
          </div>
        )}

        {/* RESULT / SCORECARD SCREEN */}
        {!loading && quizFinished && (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto shadow-inner">
              <Trophy className="w-12 h-12 stroke-[1.8]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                क्विज समाप्त (Quiz Completed)!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Smart Classroom Performance Report
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-xs mx-auto space-y-1.5">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                आपका स्कोर (Your Score)
              </span>
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400">
                {score} / {questions.length}
              </div>
              <p className="text-xs font-semibold text-emerald-400 pt-1">
                {score >= 8
                  ? "🏆 NIPUN Champion! उत्कृष्ट शब्दावली!"
                  : score >= 5
                    ? "⭐ बहुत अच्छा प्रयास! थोड़ा और अभ्यास करें।"
                    : "📖 नियमित अभ्यास से स्कोर और बेहतर होगा!"}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={fetchNewQuiz}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> नई क्विज खेलें (Play Again)
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE 10-QUESTION QUIZ SCREEN */}
        {!loading && !quizFinished && currentQ && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2.5 py-1 rounded-xl">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>
                  Question {currentIndex + 1} / {questions.length}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Score: <strong className="text-white">{score}</strong>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>

            {/* Word Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center mb-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                {currentQ.partOfSpeech}
              </span>
              <h2 className="text-3xl font-black text-white capitalize mt-2.5 tracking-tight">
                {currentQ.word}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                नीचे दिए गए विकल्पों में से सही अर्थ चुनें:
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption?.text === opt.text;
                let optionStyle =
                  "bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-indigo-500/70 hover:bg-slate-800";

                if (selectedOption) {
                  if (opt.isCorrect) {
                    optionStyle =
                      "bg-emerald-950/90 border-emerald-500 text-emerald-200 font-semibold shadow-md";
                  } else if (isSelected && !opt.isCorrect) {
                    optionStyle =
                      "bg-rose-950/90 border-rose-500 text-rose-200 shadow-md";
                  } else {
                    optionStyle =
                      "bg-slate-900/60 border-slate-800/60 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnsweringLocked}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${optionStyle}`}
                  >
                    <span>{opt.text}</span>
                    {selectedOption && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {selectedOption && isSelected && !opt.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                विकल्प चुनते ही अगला शब्द अपने आप आ जाएगा
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

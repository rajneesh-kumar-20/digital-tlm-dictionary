// frontend/src/components/TeacherAdminModal.jsx
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  PlusCircle,
  X,
  Loader2,
  CheckCircle2,
  Wand2,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Mail,
  Lock,
  School,
  Users,
  Calendar,
} from "lucide-react";

export default function TeacherAdminModal({ isOpen, onClose }) {
  // Tabs: 'login' | 'signup' | 'dashboard' | 'teachersList'
  const [activeTab, setActiveTab] = useState("login");
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [teachersList, setTeachersList] = useState([]);
  const [fetchingTeachers, setFetchingTeachers] = useState(false);

  // Login & Signup States
  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
    schoolName: "",
  });

  // Word Entry Form
  const [wordData, setWordData] = useState({
    word: "",
    hindiMeaning: "",
    partOfSpeech: "noun",
    definition: "",
    example: "",
  });

  const [loading, setLoading] = useState(false);
  const [autoFetching, setAutoFetching] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Load saved session on open
  useEffect(() => {
    const savedToken = localStorage.getItem("teacher_token");
    const savedTeacher = localStorage.getItem("teacher_profile");
    if (savedToken && savedTeacher) {
      try {
        setCurrentTeacher(JSON.parse(savedTeacher));
        setActiveTab("dashboard");
      } catch (e) {
        localStorage.removeItem("teacher_token");
        localStorage.removeItem("teacher_profile");
      }
    }
  }, [isOpen]);

  // Fetch all registered teachers
  const fetchAllTeachers = async () => {
    setFetchingTeachers(true);
    try {
      const res = await fetch("/api/teacher/all");
      const data = await res.json();
      if (data.success) {
        setTeachersList(data.data);
      }
    } catch (err) {
      console.error("Teachers load error:", err);
    } finally {
      setFetchingTeachers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "teachersList") {
      fetchAllTeachers();
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const showMessage = (type, text) => {
    setMsg({ type, text });
  };

  // 1. Teacher Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("teacher_token", data.token);
      localStorage.setItem("teacher_profile", JSON.stringify(data.teacher));
      setCurrentTeacher(data.teacher);
      setActiveTab("dashboard");
      showMessage("success", `स्वागत है, ${data.teacher.name}!`);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Teacher Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/teacher/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("teacher_token", data.token);
      localStorage.setItem("teacher_profile", JSON.stringify(data.teacher));
      setCurrentTeacher(data.teacher);
      setActiveTab("dashboard");
      showMessage("success", "Teacher Account सफलतापूर्वक बन गया!");
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Teacher Logout
  const handleLogout = () => {
    localStorage.removeItem("teacher_token");
    localStorage.removeItem("teacher_profile");
    setCurrentTeacher(null);
    setActiveTab("login");
    showMessage("success", "आप लॉगआउट हो चुके हैं।");
  };

  // 4. Magic Auto-Fill
  const handleAutoFill = async () => {
    const wordToSearch = wordData.word.trim();
    if (!wordToSearch) {
      showMessage("error", "कृपया पहले English word लिखें!");
      return;
    }

    setAutoFetching(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await fetch(
        `/api/words/admin/auto-fill?word=${encodeURIComponent(wordToSearch)}`,
      );
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Data fetch nahi ho paya");
      }

      const data = result.data;
      setWordData((prev) => ({
        ...prev,
        hindiMeaning: data.hindiMeaning || prev.hindiMeaning,
        partOfSpeech: data.partOfSpeech || prev.partOfSpeech,
        definition: data.definition || prev.definition,
        example: data.example || prev.example,
      }));

      showMessage("success", "✨ शब्द का सारा विवरण ऑटो-फिल हो गया!");
    } catch (err) {
      showMessage("error", err.message || "Auto-fill me dikkat aayi");
    } finally {
      setAutoFetching(false);
    }
  };

  // 5. Submit Word to Database with Teacher Token
  const handleWordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    const token = localStorage.getItem("teacher_token");
    if (!token) {
      showMessage("error", "आप लॉगिन नहीं हैं। कृपया पहले लॉगिन करें।");
      setActiveTab("login");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/words/admin/add-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(wordData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Word save nahi ho paya");
      }

      showMessage("success", data.message);
      setWordData({
        word: "",
        hindiMeaning: "",
        partOfSpeech: "noun",
        definition: "",
        example: "",
      });
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950 border border-indigo-700/50 text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Teacher & Admin Portal
              </h3>
              <p className="text-xs text-slate-400">
                NIPUN Bharat Smart Classroom Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Teachers List Tab */}
            <button
              type="button"
              onClick={() => {
                setMsg({ type: "", text: "" });
                setActiveTab(
                  activeTab === "teachersList"
                    ? currentTeacher
                      ? "dashboard"
                      : "login"
                    : "teachersList",
                );
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "teachersList"
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {activeTab === "teachersList" ? "वापस जाएं" : "Admins List"}
              </span>
            </button>

            {currentTeacher && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {msg.text && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-emerald-950/70 border border-emerald-600 text-emerald-300"
                : "bg-rose-950/70 border border-rose-600 text-rose-300"
            }`}
          >
            {msg.type === "success" && (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* TAB 1: TEACHERS / ADMINS DIRECTORY LIST */}
        {activeTab === "teachersList" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>पंजीकृत टीचर्स एवं एडमिन (Registered Faculty)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  यह सभी शिक्षक पोर्टल में शब्द जोड़ने के लिए अधिकृत हैं
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-2.5 py-1 rounded-lg">
                Total: {teachersList.length}
              </span>
            </div>

            {fetchingTeachers ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                <p className="text-xs">शिक्षकों की सूची लोड हो रही है...</p>
              </div>
            ) : teachersList.length === 0 ? (
              <div className="py-10 text-center text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-xs">
                  अभी तक कोई शिक्षक पंजीकृत नहीं है। नया अकाउंट बनाएं।
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {teachersList.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-sm uppercase shrink-0">
                        {t.name ? t.name[0] : "T"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                            {t.name}
                          </h5>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300">
                            Verified Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{t.email}</span>
                        </p>
                        {t.schoolName && (
                          <p className="text-[10px] text-indigo-400/90 truncate flex items-center gap-1">
                            <School className="w-2.5 h-2.5 shrink-0" />
                            <span>{t.schoolName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 shrink-0 text-right">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(t.createdAt || Date.now()).toLocaleDateString(
                          "hi-IN",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOGIN */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div className="text-center mb-4">
              <h4 className="text-base font-bold text-white">Teacher Login</h4>
              <p className="text-slate-400 text-xs">
                अपने रजिस्टर्ड ईमेल और पासवर्ड से लॉगिन करें
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="teacher@school.edu"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Login Karein</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-slate-400">
                अकाउंट नहीं है?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMsg({ type: "", text: "" });
                    setActiveTab("signup");
                  }}
                  className="text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  नया Teacher Account बनाएं
                </button>
              </p>
            </div>
          </form>
        )}

        {/* TAB 3: SIGN UP */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignup} className="space-y-3 text-xs">
            <div className="text-center mb-3">
              <h4 className="text-base font-bold text-white">
                Teacher Registration
              </h4>
              <p className="text-slate-400 text-xs">
                पोर्टल में ऑथराइज्ड एडमिन बनने के लिए साइन अप करें
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                पूरा नाम *
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="उदा. Rajneesh Kumar"
                  value={authData.name}
                  onChange={(e) =>
                    setAuthData({ ...authData, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                School / College Name
              </label>
              <div className="relative flex items-center">
                <School className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="उदा. PM SHRI / Smart Classroom"
                  value={authData.schoolName}
                  onChange={(e) =>
                    setAuthData({ ...authData, schoolName: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Email Address *
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="teacher@school.edu"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                नया Password बनाएं *
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="कम से कम 6 अक्षर"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>रजिस्टर करें (Sign Up)</span>
            </button>

            <div className="text-center pt-1">
              <p className="text-slate-400">
                पहले से अकाउंट है?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMsg({ type: "", text: "" });
                    setActiveTab("login");
                  }}
                  className="text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  यहाँ लॉगिन करें
                </button>
              </p>
            </div>
          </form>
        )}

        {/* TAB 4: TEACHER DASHBOARD (WORD ENTRY) */}
        {activeTab === "dashboard" && currentTeacher && (
          <div>
            <div className="flex items-center justify-between mb-4 bg-indigo-950/40 border border-indigo-800/40 p-3 rounded-2xl">
              <div>
                <p className="text-xs text-white font-bold">
                  Teacher: {currentTeacher.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {currentTeacher.schoolName || currentTeacher.email}
                </p>
              </div>
              <span className="text-[10px] bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                Active Admin Session
              </span>
            </div>

            <form onSubmit={handleWordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  English Word *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="उदा. cat, resilient..."
                    value={wordData.word}
                    onChange={(e) =>
                      setWordData({ ...wordData, word: e.target.value })
                    }
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={autoFetching}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {autoFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    <span>Auto-Fill ✨</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    हिन्दी अर्थ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Auto-fill ho jayega"
                    value={wordData.hindiMeaning}
                    onChange={(e) =>
                      setWordData({ ...wordData, hindiMeaning: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Part of Speech
                  </label>
                  <select
                    value={wordData.partOfSpeech}
                    onChange={(e) =>
                      setWordData({ ...wordData, partOfSpeech: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="noun">Noun (संज्ञा)</option>
                    <option value="verb">Verb (क्रिया)</option>
                    <option value="adjective">Adjective (विशेषण)</option>
                    <option value="adverb">Adverb (क्रिया विशेषण)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  English Definition
                </label>
                <textarea
                  rows="2"
                  placeholder="Auto-fill ho jayega"
                  value={wordData.definition}
                  onChange={(e) =>
                    setWordData({ ...wordData, definition: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Classroom Example
                </label>
                <input
                  type="text"
                  placeholder="Auto-fill ho jayega"
                  value={wordData.example}
                  onChange={(e) =>
                    setWordData({ ...wordData, example: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer mt-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
                <span>डेटाबेस में शब्द जोड़ें (Add Word)</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

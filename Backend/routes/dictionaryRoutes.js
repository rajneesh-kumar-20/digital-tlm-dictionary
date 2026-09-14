// Backend/routes/dictionaryRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Word = require("../models/word");

const JWT_SECRET = process.env.JWT_SECRET || "tlm_super_secret_jwt_key_2026";

// Middleware: Authenticate Teacher Token
function verifyTeacherToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Kripya pehle Teacher Login karein!" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.teacher = decoded;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({
        success: false,
        message: "Aapka session expire ho chuka hai, dubara login karein.",
      });
  }
}

// Helper function: Free Google Translate endpoint
async function translateText(text, targetLang = "hi") {
  if (!text || targetLang === "en") return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    if (!res.ok) return text;
    const json = await res.json();
    if (json && json[0] && Array.isArray(json[0])) {
      return json[0]
        .map((item) => item[0])
        .filter(Boolean)
        .join(" ");
    }
    return text;
  } catch (err) {
    console.error("Translation error:", err.message);
    return text;
  }
}

// 1. Search Word with Multilingual Support
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : "";
    const targetLang = req.query.lang || "hi";

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "शब्द देना आवश्यक है" });
    }

    let wordDoc = await Word.findOne({ word: new RegExp(`^${query}$`, "i") });
    let source = "database";

    if (!wordDoc) {
      try {
        const extRes = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`,
        );
        if (!extRes.ok) {
          return res
            .status(404)
            .json({
              success: false,
              message: `शब्द "${query}" शब्दकोश में नहीं मिला।`,
            });
        }

        const [apiData] = await extRes.json();
        const meanings = (apiData.meanings || []).map((m) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: (m.definitions || []).map((d) => d.definition),
          examples: (m.definitions || [])
            .filter((d) => d.example)
            .map((d) => d.example),
        }));

        const audio =
          apiData.phonetics?.find((p) => p.audio && p.audio.trim() !== "")
            ?.audio || "";

        wordDoc = new Word({
          word: apiData.word,
          phonetic: apiData.phonetic || "",
          audioUrl: audio,
          meanings: meanings,
          hindiMeaning: "",
        });

        source = "api";
      } catch (fetchErr) {
        return res
          .status(404)
          .json({ success: false, message: "Word lookup failed" });
      }
    }

    const baseText =
      wordDoc.hindiMeaning ||
      wordDoc.meanings?.[0]?.definitions?.[0] ||
      wordDoc.word;
    const translatedText = await translateText(baseText, targetLang);

    const result = wordDoc.toObject ? wordDoc.toObject() : { ...wordDoc };
    result.translatedMeaning = translatedText;
    result.targetLang = targetLang;

    return res.json({
      success: true,
      data: result,
      source: source,
    });
  } catch (error) {
    console.error("Search Route Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 2. Suggestions Route
router.get("/suggestions", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : "";
    if (!query) return res.json({ success: true, data: [] });

    const words = await Word.find({
      word: { $regex: `^${query}`, $options: "i" },
    })
      .limit(6)
      .select("word -_id");

    res.json({
      success: true,
      data: words.map((w) => w.word),
    });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// 3. Word of the Day Route
router.get("/word-of-the-day", async (req, res) => {
  try {
    const targetLang = req.query.lang || "hi";
    const count = await Word.countDocuments();
    let wordDoc;

    if (count > 0) {
      const dayOfYear = Math.floor(
        (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
          (1000 * 60 * 60 * 24),
      );
      const randomIndex = dayOfYear % count;
      wordDoc = await Word.findOne().skip(randomIndex);
    }

    if (!wordDoc) {
      wordDoc = {
        word: "Achieve",
        phonetic: "/ə'tʃi:v/",
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              "To succeed in something, especially in academic performance.",
            ],
          },
        ],
        hindiMeaning: "हासिल करना",
      };
    }

    const baseText =
      wordDoc.hindiMeaning ||
      wordDoc.meanings?.[0]?.definitions?.[0] ||
      wordDoc.word;
    const translatedText = await translateText(baseText, targetLang);

    const result = wordDoc.toObject ? wordDoc.toObject() : { ...wordDoc };
    result.translatedMeaning = translatedText;

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 4. Magic Auto-Fill Route
router.get("/admin/auto-fill", async (req, res) => {
  try {
    const word = req.query.word ? req.query.word.trim().toLowerCase() : "";
    if (!word) {
      return res
        .status(400)
        .json({ success: false, message: "Word is required" });
    }

    let fetchedDef = "";
    let fetchedEx = "";
    let fetchedPos = "noun";

    try {
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        const firstEntry = dictData[0];
        if (
          firstEntry &&
          firstEntry.meanings &&
          firstEntry.meanings.length > 0
        ) {
          const m = firstEntry.meanings[0];
          fetchedPos = m.partOfSpeech || "noun";
          fetchedDef = m.definitions?.[0]?.definition || "";
          fetchedEx =
            m.definitions?.find((d) => d.example)?.example ||
            m.definitions?.[0]?.example ||
            "";
        }
      }
    } catch (e) {
      console.log("Dictionary fetch fallback:", e.message);
    }

    const fetchedHindi = await translateText(word, "hi");

    return res.json({
      success: true,
      data: {
        word: word,
        hindiMeaning: fetchedHindi || "",
        partOfSpeech: fetchedPos || "noun",
        definition: fetchedDef || "",
        example:
          fetchedEx || `We should learn how to use "${word}" in daily life.`,
      },
    });
  } catch (err) {
    console.error("Auto-fill server error:", err);
    res
      .status(500)
      .json({ success: false, message: "Auto-fill failed on server" });
  }
});

// 5. Protected Route: Teacher Adds Word
router.post("/admin/add-word", verifyTeacherToken, async (req, res) => {
  try {
    const { word, hindiMeaning, partOfSpeech, definition, example } = req.body;

    if (!word || !hindiMeaning) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Word aur Hindi meaning zaroori hain",
        });
    }

    const cleanWord = word.trim();
    let existing = await Word.findOne({
      word: new RegExp(`^${cleanWord}$`, "i"),
    });

    if (existing) {
      existing.hindiMeaning = hindiMeaning.trim();
      if (definition) {
        existing.meanings = [
          {
            partOfSpeech: partOfSpeech || "noun",
            definitions: [definition.trim()],
            examples: example ? [example.trim()] : [],
          },
        ];
      }
      await existing.save();
      return res.json({
        success: true,
        message: `Word "${cleanWord}" updated by Teacher ${req.teacher.name}!`,
        data: existing,
      });
    }

    const newWord = new Word({
      word: cleanWord,
      hindiMeaning: hindiMeaning.trim(),
      meanings: [
        {
          partOfSpeech: partOfSpeech || "noun",
          definitions: [definition ? definition.trim() : "Classroom TLM word"],
          examples: example ? [example.trim()] : [],
        },
      ],
    });

    await newWord.save();
    return res.status(201).json({
      success: true,
      message: `Word "${cleanWord}" successfully added by ${req.teacher.name}!`,
      data: newWord,
    });
  } catch (err) {
    console.error("Admin Add Word Error:", err);
    res.status(500).json({ success: false, message: "Database save failed" });
  }
});

// 6. Dynamic 10-Question Quiz Generator Route
router.get("/quiz/generate", async (req, res) => {
  try {
    const totalCount = await Word.countDocuments();
    let words = [];

    if (totalCount >= 10) {
      words = await Word.aggregate([{ $sample: { size: 10 } }]);
    } else {
      words = await Word.find().limit(10);
    }

    const fallbackDummies = [
      "कठिनाई पैदा करना",
      "अनदेखा करना व छोड़ना",
      "गलत साबित करना",
      "धीमी गति से चलना",
      "विनाशकारी प्रभाव डालना",
      "दूर चले जाना",
      "रोक लगाना",
      "संदेह व्यक्त करना",
      "विस्तार करना",
      "सहमति देना",
      "लापरवाही बरतना",
    ];

    const questions = words.map((item, index) => {
      const correctAnswer =
        item.hindiMeaning && item.hindiMeaning.trim() !== ""
          ? item.hindiMeaning.trim()
          : item.meanings?.[0]?.definitions?.[0] || "सही अर्थ";

      const distractors = fallbackDummies
        .filter((d) => d !== correctAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [
        { text: correctAnswer, isCorrect: true },
        { text: distractors[0], isCorrect: false },
        { text: distractors[1], isCorrect: false },
        { text: distractors[2], isCorrect: false },
      ].sort(() => 0.5 - Math.random());

      return {
        id: index + 1,
        word: item.word,
        partOfSpeech: item.meanings?.[0]?.partOfSpeech || "word",
        correctAnswer: correctAnswer,
        options: options,
      };
    });

    res.json({
      success: true,
      data: questions,
    });
  } catch (err) {
    console.error("Quiz Generator Error:", err);
    res.status(500).json({ success: false, message: "Quiz generation failed" });
  }
});

module.exports = router;

// Backend/routes/dictionaryRoutes.js
const express = require("express");
const router = express.Router();
const Word = require("../models/word");

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

module.exports = router;

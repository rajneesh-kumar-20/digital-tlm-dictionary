// Backend/routes/dictionaryRoutes.js
const express = require("express");
const router = express.Router();
const Word = require("../models/word");

// Free Google Translate Engine
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
    return text;
  }
}

// 1. Universal Search: MongoDB -> Live Dictionary API -> Auto-save
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : "";
    const targetLang = req.query.lang || "hi";

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "शब्द देना आवश्यक है" });
    }

    // Pehle MongoDB check karein
    let wordDoc = await Word.findOne({ word: new RegExp(`^${query}$`, "i") });
    let source = "database";

    // Agar MongoDB mein nahi mila -> Live Free Dictionary API se fetch karein
    if (!wordDoc) {
      try {
        const extRes = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
          },
        );

        if (extRes.ok) {
          const dataArray = await extRes.json();
          const apiData = dataArray[0];

          const meanings = (apiData.meanings || []).map((m) => ({
            partOfSpeech: m.partOfSpeech || "noun",
            definitions: (m.definitions || []).map((d) => d.definition),
            examples: (m.definitions || [])
              .filter((d) => d.example)
              .map((d) => d.example),
          }));

          const audio =
            apiData.phonetics?.find((p) => p.audio && p.audio.trim() !== "")
              ?.audio || "";

          // Automatic Hindi translation create karein
          const translatedHindi = await translateText(apiData.word, "hi");

          // Naye word ko database mein save kar dein taaki agli baar 0ms mein mile
          try {
            wordDoc = await Word.create({
              word: apiData.word.toLowerCase(),
              phonetic: apiData.phonetic || apiData.phonetics?.[0]?.text || "",
              audioUrl: audio,
              meanings: meanings,
              hindiMeaning: translatedHindi,
            });
          } catch (dbSaveErr) {
            wordDoc = {
              word: apiData.word,
              phonetic: apiData.phonetic || "",
              audioUrl: audio,
              meanings: meanings,
              hindiMeaning: translatedHindi,
            };
          }

          source = "online-live";
        }
      } catch (fetchErr) {
        console.error("Online lookup error:", fetchErr);
      }
    }

    if (!wordDoc) {
      return res.status(404).json({
        success: false,
        message: `शब्द "${query}" शब्दकोश में नहीं मिला। कृपया स्पेलिंग जांचें।`,
      });
    }

    const baseText = wordDoc.hindiMeaning || wordDoc.word;
    const translatedText =
      targetLang === "hi" || targetLang === "en"
        ? wordDoc.hindiMeaning || (await translateText(wordDoc.word, "hi"))
        : await translateText(baseText, targetLang);

    const result = wordDoc.toObject ? wordDoc.toObject() : { ...wordDoc };
    result.translatedMeaning = translatedText;
    result.targetLang = targetLang;

    return res.json({
      success: true,
      data: result,
      source: source,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2. Suggestions Route
router.get("/suggestions", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : "";
    if (!query) return res.json({ success: true, data: [] });

    let words = await Word.find({
      word: { $regex: `^${query}`, $options: "i" },
    })
      .limit(5)
      .select("word -_id");

    let suggestions = words.map((w) => w.word);

    if (suggestions.length < 5) {
      try {
        const extSuggest = await fetch(
          `https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=5`,
        );
        if (extSuggest.ok) {
          const onlineItems = await extSuggest.json();
          const onlineWords = onlineItems.map((item) => item.word);
          suggestions = Array.from(
            new Set([...suggestions, ...onlineWords]),
          ).slice(0, 6);
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// 3. Word of the Day Route
router.get("/word-of-the-day", async (req, res) => {
  try {
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
              "Successfully bring about or reach a desired objective or result by effort.",
            ],
          },
        ],
        hindiMeaning: "हासिल करना / प्राप्त करना",
      };
    }

    res.json({ success: true, data: wordDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

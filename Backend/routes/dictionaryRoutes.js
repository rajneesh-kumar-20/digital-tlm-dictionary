// backend/routes/dictionaryRoutes.js
const express = require("express");
const router = express.Router();
const Word = require("../models/Word");

// 1. WORD OF THE DAY ROUTE
router.get("/word-of-the-day", async (req, res) => {
  try {
    const count = await Word.countDocuments();
    let wordDoc = null;

    if (count > 0) {
      // Saal ke din (Day of Year) ke hisaab se fixed daily index
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      const dailyIndex = dayOfYear % count;
      wordDoc = await Word.findOne().skip(dailyIndex);
    }

    // Fallback agar database bilkul empty ho
    if (!wordDoc) {
      wordDoc = {
        word: "diligent",
        phonetic: "/'dɪlɪdʒ(ə)nt/",
        meanings: [
          {
            partOfSpeech: "adjective",
            definitions: [
              "Having or showing care and conscientiousness in one's work or duties.",
            ],
            examples: [
              "She was a diligent student who always finished her homework on time.",
            ],
          },
        ],
        hindiMeaning: "परिश्रमी / मेहनती",
      };
    }

    res.json({ success: true, data: wordDoc });
  } catch (error) {
    console.error("Word of the Day Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error fetching word of the day",
      });
  }
});

// 2. SEARCH ROUTE
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : "";
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "शब्द देना आवश्यक है" });
    }

    let wordDoc = await Word.findOne({ word: new RegExp(`^${query}$`, "i") });
    let source = "database";

    if (!wordDoc) {
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
    }

    res.json({
      success: true,
      data: wordDoc,
      source: source,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 3. AUTOCOMPLETE SUGGESTIONS
router.get("/suggestions", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : "";
    if (!query) return res.json({ success: true, data: [] });

    const words = await Word.find({
      word: { $regex: `^${query}`, $options: "i" },
    })
      .limit(6)
      .select("word -_id");

    res.json({ success: true, data: words.map((w) => w.word) });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

module.exports = router;

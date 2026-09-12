// backend/routes/dictionaryRoutes.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const Word = require("../models/Word");

// Helper: Free English to Hindi Translation API
async function getHindiTranslation(englishWord) {
  try {
    const res = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishWord)}&langpair=en|hi`,
    );
    if (res.data && res.data.responseData) {
      return res.data.responseData.translatedText || "";
    }
    return "";
  } catch (err) {
    console.error("Translation Error:", err.message);
    return "";
  }
}

// 1. GET /api/words/word-of-the-day (Morning Assembly / Daily Word)
router.get("/word-of-the-day", async (req, res) => {
  try {
    const count = await Word.countDocuments();
    if (count === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No words in database" });
    }

    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
        1000 /
        60 /
        60 /
        24,
    );
    const wordIndex = dayOfYear % count;

    const dailyWord = await Word.findOne().skip(wordIndex);
    res.status(200).json({ success: true, data: dailyWord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/words/suggestions?q=res (Autocomplete)
router.get("/suggestions", async (req, res) => {
  try {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) return res.status(200).json({ success: true, data: [] });

    const suggestions = await Word.find(
      { word: { $regex: `^${query}`, $options: "i" } },
      "word",
    ).limit(5);

    res.status(200).json({
      success: true,
      data: suggestions.map((s) => s.word),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET /api/words/search?q=word (Search with DB Check & Public API Fallback)
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }

    // Local DB Search
    let existingWord = await Word.findOne({ word: query });
    if (existingWord) {
      if (!existingWord.hindiMeaning) {
        existingWord.hindiMeaning = await getHindiTranslation(query);
        await existingWord.save();
      }
      return res.status(200).json({
        success: true,
        source: "database",
        data: existingWord,
      });
    }

    // B. Public API Fallback + Auto Save
    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`,
      );
      const apiData = response.data[0];

      const audioObj = apiData.phonetics?.find(
        (p) => p.audio && p.audio.trim().length > 0,
      );
      const audioUrl = audioObj ? audioObj.audio : "";

      const formattedMeanings = apiData.meanings.map((m) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.map((d) => d.definition),
        examples: m.definitions.map((d) => d.example).filter(Boolean),
        synonyms: m.synonyms || [],
        antonyms: m.antonyms || [],
      }));

      const hindiTrans = await getHindiTranslation(query);

      const newWord = new Word({
        word: apiData.word.toLowerCase(),
        hindiMeaning: hindiTrans,
        phonetic: apiData.phonetic || apiData.phonetics?.[0]?.text || "",
        audioUrl: audioUrl,
        meanings: formattedMeanings,
      });

      await newWord.save();

      return res.status(200).json({
        success: true,
        source: "external_api_cached",
        data: newWord,
      });
    } catch (apiErr) {
      if (apiErr.response && apiErr.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: `Word "${query}" not found in dictionary.`,
        });
      }
      throw apiErr;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

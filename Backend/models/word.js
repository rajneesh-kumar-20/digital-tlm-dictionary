// backend/models/Word.js
const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  hindiMeaning: {
    type: String,
    default: "",
  },
  phonetic: { type: String, default: "" },
  audioUrl: { type: String, default: "" },
  isWordOfTheDay: {
    type: Boolean,
    default: false,
  },
  meanings: [
    {
      partOfSpeech: { type: String, required: true },
      definitions: [{ type: String, required: true }],
      examples: [{ type: String }],
      synonyms: [{ type: String }],
      antonyms: [{ type: String }],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Word", WordSchema);

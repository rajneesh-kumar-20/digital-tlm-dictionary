# 📚 Digital TLM Dictionary — Smart Bilingual Lexicon

An interactive, bilingual (English-Hindi) Teaching Learning Material (TLM) web application tailored for school students and ICT-enabled classrooms. Built aligning with the foundational literacy objectives of **NEP 2020** and the **NIPUN Bharat Mission**.

---

## 🌟 Key Features

- **Bilingual Vocabulary Engine:** Over 120+ curated academic and daily-use school words with clear Hindi meanings, definitions, phonetic spellings, and context examples.
- **Dynamic Word of the Day:** Automatically suggests a new academic word daily for classroom morning assemblies and daily blackboard work.
- **Instant Dual-Mode Banner:** Dynamically shifts into a high-visibility result showcase whenever a student searches a specific word.
- **Audio Pronunciation Assistant:** Native text-to-speech (Web Speech API) integration supporting accurate English phonetics and pronunciation.
- **Real-time Autocomplete:** Debounced suggestion search delivering fast query results without latency.
- **Dual-Theme Support:** One-click toggle between Light Mode and Dark Classroom Mode for smartboards and projectors.
- **Personal Bookmarks & History:** Persistent local storage for saving important words and tracking recent lookups.
- **Auto-Caching Architecture:** External dictionary fallback caching to MongoDB for seamless offline-first capability.

---

## 🛠️ Tech Stack

### Frontend

- **React 18 / Vite:** Ultra-fast single-page interface with hot module replacement.
- **Tailwind CSS:** Modern glassmorphic and high-contrast responsive interface.
- **Lucide React:** Lightweight, accessible iconography.

### Backend

- **Node.js & Express.js:** RESTful API architecture.
- **MongoDB & Mongoose:** Document database for structured bilingual vocabulary storage.
- **Concurrently:** Unified monorepo runner managing client and server concurrently.

---

## 📁 Project Structure

```text
digital-tlm-dictionary/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Word search and daily-word logic
│   ├── data/            # Curated 120+ bilingual words dataset
│   ├── models/          # Mongoose Word schema
│   ├── routes/          # Express API endpoints
│   ├── seeder.js        # Database populate/reset utility
│   ├── server.js        # Express application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # AudioPlayer, Bookmarks, ThemeToggle, Search
│   │   ├── hooks/       # useDarkMode, useDebounce
│   │   ├── App.jsx      # Main application layout
│   │   └── main.jsx
│   ├── index.html       # Google Fonts & UI root
│   └── package.json
├── package.json         # Root monorepo manager (concurrently)
└── README.md
```

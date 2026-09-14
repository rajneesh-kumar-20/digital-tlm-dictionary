// Backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/digital-tlm";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Route Imports
const dictionaryRoutes = require("./routes/dictionaryRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

// Mount API Routes
if (dictionaryRoutes) {
  app.use("/api/words", dictionaryRoutes);
}

if (teacherRoutes) {
  app.use("/api/teacher", teacherRoutes);
}

// Frontend static build serving (Production)
// Express v5 / path-to-regexp compatible wildcard: /(.*)/
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

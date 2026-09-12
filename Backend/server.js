// 1. Atlas SRV / DNS ECONNREFUSED error bypass (Google Public DNS)
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// 2. Database connect
connectDB();

const app = express();

// 3. Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  }),
);
app.use(express.json());

// 4. Test Route
app.get("/", (req, res) => {
  res.send("Digital TLM Dictionary API is active.");
});

// 5. Routes mount
app.use("/api/words", require("./routes/dictionaryRoutes"));

// 6. Server listen
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

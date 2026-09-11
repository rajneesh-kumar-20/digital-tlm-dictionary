// backend/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Word = require("./models/Word");
const words = require("./data/words");

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Word.deleteMany();
    await Word.insertMany(words);
    console.log("Words successfully seeded into Database!");
    process.exit();
  } catch (error) {
    console.error(`Import Failed: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Word.deleteMany();
    console.log("Words deleted from Database!");
    process.exit();
  } catch (error) {
    console.error(`Deletion Failed: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}

const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

async function connectDB() {
  try {
    await mongoose.connect(db);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log(err.message, err);
    //Exit the process
    process.exit(1);
  }
}
module.exports = connectDB;

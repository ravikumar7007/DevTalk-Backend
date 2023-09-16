require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const app = express();
const PORT = process.env.PORT;
const cors = require("cors");
app.use(cors());
app.use(express.json({ extended: false }));
connectDB();

app.get("/", (req, res) => {
  res.send("API is listening");
});

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(PORT, () => {
  console.log(`Server is listening in Port ${PORT}`);
});

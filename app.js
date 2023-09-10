require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT;
app.get("/", (req, res) => {
  res.send("API is listening");
});
app.listen(PORT, () => {
  console.log(`Server is listening in Port ${PORT}`);
});

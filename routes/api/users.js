const express = require("express");
const router = express.Router();

//@route GET api/users

router.get("/", (req, res) => {
  res.send("Users route");
});

module.exports = router;

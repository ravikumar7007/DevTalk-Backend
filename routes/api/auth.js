const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../model/User");
//@route GET api/auth

router.get("/", auth, async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).send({ msg: "Server error" });
  }
});

module.exports = router;

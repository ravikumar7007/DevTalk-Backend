const express = require("express");
const auth = require("../../middleware/auth");
const Profile = require("../../model/Profile");
const User = require("../../model/User");
const { body, validationResult } = require("express-validator");
const Post = require("../../model/Post");
const router = express.Router();

//@route POST api/posts

router.post("/", auth, body("text").notEmpty(), async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }
  try {
    const user = await User.findById(req.user.id).select("-password");
    const post = new Post({
      name: user.name,
      text: req.body.text,
      avatar: user.avatar,
      user: req.user.id,
    });
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

//@route GET api/posts

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

// @export
module.exports = router;

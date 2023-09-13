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

//@route GET api/posts/:id

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ msg: "Post is not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Post is not found" });
    }
    res.status(400).send("Server Error");
  }
});

//@route DELETE api/posts/:id

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ msg: "Post is not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.deleteOne();
    res.json({ msg: "Post Deleted" });
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

//@route PUT api/posts/like/:id

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

//@route PUT api/posts/unlike/:id

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post not liked" });
    }
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

//@route POST api/posts/comment/:id

router.post("/comment/:id", auth, body("text").notEmpty(), async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }
  try {
    const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.id);
    const comment = {
      name: user.name,
      text: req.body.text,
      avatar: user.avatar,
      user: req.user.id,
    };
    post.comments.unshift(comment);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

//@route DELETE api/posts/comment/:id/:comment_id

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = await post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    post.comments = post.comments.filter(
      (comment) => comment.id !== req.params.comment_id
    );
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

// @export
module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../model/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { validationResult, body } = require("express-validator");

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

//@route POST api/users

router.post(
  "/",
  body("email", "email is required").isEmail(),
  body("password", "password is required").exists(),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: "User is not exist" }] });
      }

      const isMatched = bcrypt.compareSync(password, user.password);
      if (!isMatched) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      const secretOrPrivateKey = config.get("jwtSecret");
      jwt.sign(
        payload,
        secretOrPrivateKey,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).json("Server error");
    }
  }
);

module.exports = router;

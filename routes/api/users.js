const express = require("express");
const { validationResult, body } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../../model/User");
//@route POST api/users
router.post(
  "/",
  body("name", "name is required").notEmpty(),
  body("email", "email is required").isEmail(),
  body("password", "password is required").isLength({ min: 6 }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exist" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      user.password = bcrypt.hashSync(password, 8);
      await user.save();
      res.send("User Registered");
    } catch (error) {
      console.error(error.message);
      return res.status(500).json("Server error");
    }
  }
);

module.exports = router;

const express = require("express");
const { check, validationResult, body } = require("express-validator");
const router = express.Router();

//@route POST api/users
router.post(
  "/",
  body("name", "name is required").notEmpty(),
  body("email", "email is required").isEmail(),
  body("password", "password is required").isLength({ min: 6 }),
  (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json({ errors: err.array() });
    }
    res.send("User Route : " + req.body);
  }
);

module.exports = router;

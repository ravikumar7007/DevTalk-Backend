const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../model/Profile");
const User = require("../../model/User");

const { body, validationResult } = require("express-validator");
const normalize = require("normalize-url");
const { default: mongoose } = require("mongoose");

//@route GET api/profile

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(400).send("Server Error");
  }
});

router.post(
  "/",
  auth,
  body("status", "Status is empty").notEmpty(),
  body("skills", "Skills are empty").notEmpty(),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json(error);
    }

    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
      ...rest,
    };
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };
    for (let [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0) {
        socialFields[key] = normalize(value, { forceHttps: true });
      }
    }
    profileFields.social = socialFields;
    try {
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(profile);
    } catch (error) {
      return res.status(500).send("Server Error");
    }
  }
);
//@route GET api/profile
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate("user", [
      "name",
      "avatar",
    ]);

    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

//@route GET api/profile/user/:userid

router.get("/user/:userid", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userid }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(500).send("No profile found");
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(500).send("No profile found");
    }
    return res.status(500).send("Server Error");
  }
});

//@route DELETE api/profile

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User Deleted" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

//@route PUT api/profile/experience

router.put(
  "/experience",
  auth,
  body("title").notEmpty(),
  body("company").notEmpty(),
  body("from").notEmpty(),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json(err);
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      await profile.experience.unshift(req.body);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route PUT api/profile/experience/:expid

router.delete("/experience/:expid", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeId = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.expid);
    profile.experience.splice(removeId, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//@route PUT api/profile/education

router.put(
  "/education",
  auth,
  body("school").notEmpty(),
  body("degree").notEmpty(),
  body("fieldofstudy").notEmpty(),
  body("from").notEmpty(),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json(err);
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      await profile.education.unshift(req.body);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route PUT api/profile/education/:eduid

router.delete("/education/:eduid", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeId = profile.education
      .map((exp) => exp.id)
      .indexOf(req.params.expid);
    profile.education.splice(removeId, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

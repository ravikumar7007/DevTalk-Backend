const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "Token not available" });
  }
  try {
    const secretOrPublicKey = config.get("jwtSecret");
    const decoded = jwt.verify(token, secretOrPublicKey);
    req.user = decoded.user;

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token not valid" });
  }
};

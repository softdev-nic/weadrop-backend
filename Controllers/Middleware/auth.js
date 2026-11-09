 const jwt = require("jsonwebtoken");
const User = require("../../Models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization || req.headers?.Authorization;
    
    if (!token) return res.status(401).json({ message: "Access denied" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user || user.isBanned) return res.status(401).json({ message: "Access denied" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
module.exports = auth;
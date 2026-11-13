  const jwt = require("jsonwebtoken");
const Organization = require("../../Models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers?.access_token
    
    if (!token) return res.status(401).json({ message: "Access denied" });

    const payload = jwt.verify(token, process.env.ORG_SECRET);
    const organization = await Organization.findById(payload.id).select("-password");
    if (!organization || organizaton.isBanned) return res.status(401).json({ message: "Access denied" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
module.exports = auth;
 const isVerified = (req, res, next) => {
  if (!req.user?.isVerified) {
    return res.status(403).json({ message: "Account not verified. Check your email for the verification link." });
  }
  next();
};

module.exports = isVerified;
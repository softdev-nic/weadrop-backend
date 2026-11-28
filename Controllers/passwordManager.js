const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Mailer = require("../Utils/mailer");
const handleError = require("../Utils/HandleError");

const RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes

// only the hash is stored, so a leaked database can't be used to reset passwords
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Step 1: POST { email } -> emails a reset link
// linkType ends up in the link so the frontend knows which reset endpoint to call
const requestPasswordReset = (Model, type, linkType) => {
  return async (req, res) => {
    // same reply whether or not the account exists, so emails can't be probed
    const reply = () =>
      res.status(200).json({ success: `If the ${type.toLowerCase()} exists, a reset link has been sent` });

    try {
      const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const account = await Model.findOne({ email });
      if (!account) return reply();

      const token = crypto.randomBytes(32).toString("hex");
      await Model.updateOne(
        { _id: account._id },
        { $set: { resetPasswordToken: hashToken(token), resetPasswordExpiry: new Date(Date.now() + RESET_TTL_MS) } }
      );

     const link = `${process.env.FRONTEND_URL}/forgot-password/${linkType.toLowerCase()}/${token}`;
      await Mailer(
        account.email,
        "Reset your password",
        `<p>We received a request to reset your password. The link is valid for 15 minutes.</p>
         <p><a href="${link}">Reset Password</a></p>
         <p>If you didn't ask for this, you can ignore this email.</p>`
      );

      return reply();
    } catch (error) {
      return handleError(res, error);
    }
  };
};

// Step 2: POST /:token { password } -> sets the new password
const resetPassword = (Model, type) => {
  return async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Invalid or expired link" });
      }
      if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const hashed = await bcrypt.hash(password, 10);

      // find + update in one step, so a link can only be used once
      const account = await Model.findOneAndUpdate(
        { resetPasswordToken: hashToken(token), resetPasswordExpiry: { $gt: new Date() } },
        { $set: { password: hashed, resetPasswordToken: null, resetPasswordExpiry: null } }
      );
      if (!account) {
        return res.status(400).json({ error: "Invalid or expired link" });
      }

      return res.status(200).json({ success: `${type} password reset successfully` });
    } catch (error) {
      return handleError(res, error);
    }
  };
};

module.exports = { requestPasswordReset, resetPassword };

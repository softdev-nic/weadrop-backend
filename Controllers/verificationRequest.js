 const crypto = require("crypto");
const Mailer = require("../Utils/mailer");
const User = require("../Models/User");

const userVerificationRequest = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email already verified");

  const token = crypto.randomBytes(32).toString("hex");
  user.verificationToken = token;
  user.verificationTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const link = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  await Mailer(
    email,
    "Verify your email",
    `<p>Click the link below to verify your email. It is valid for 1 hour.</p>
     <p><a href="${link}">Verify Email</a></p>`
  );
};

module.exports = userVerificationRequest;
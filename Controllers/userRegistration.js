 const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const userVerificationRequest = require("./verificationRequest");

const UserRegister = async (req, res) => {
  try {
    const {
      name, email, mobileNumber, password, profileImage,
      addressLine1, addressLine2, city, state, postalCode,
    } = req.body;

    if (!name || !email || !mobileNumber || !password || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name, email, mobileNumber, password: hashed, profileImage,
      addressLine1, addressLine2, city, state, postalCode,
    });

    // account is created at this point, so a mail failure shouldn't fail the signup
    let emailSent = true;
    try {
      await userVerificationRequest(newUser.email);
    } catch (mailErr) {
      emailSent = false;
      console.error("Verification email failed:", mailErr.message);
    }

    return res.status(201).json({
      message: emailSent
        ? "Registered. Check your email to verify your account."
        : "Registered, but we couldn't send the verification email. Please request it again.",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

module.exports = UserRegister;
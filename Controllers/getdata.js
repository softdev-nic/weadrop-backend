 const User = require("../Models/User");

const getUserData = async (req, res) => {
  try {
    const userData = await User.findById(req.user._id).select(
      "-password -verificationToken -verificationTokenExpiry -attempts -limitExceeded"
    );
    if (!userData) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getUserData;
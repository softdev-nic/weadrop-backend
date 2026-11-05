const crypto = require('crypto');
const Mailer = require("../Utils/mailer")
const User = require("../Models/User")
c
const userVerificationRequest = async (email) => {
    try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.findOne({email});
    if (!user) {
        throw new Error("User not found");
    }
    user.verificationToken = verificationToken;
    const verificationLink = `https://weadrop-frontend-94df.vercel.app/verify-email/${verificationToken}`;
    await user.save();
    await Mailer(email, "Email Verification", `<p>Your verification token is: <a href="${verificationLink}">Verify Email</a></p>`);

    } catch (error) {
        console.error("Error in userVerificationRequest:", error);
        throw error;
    }
};

module.exports = userVerificationRequest;

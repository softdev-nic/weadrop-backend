const User = require("../Models/User")
const passwordManager = require("./passwordManager")

const userForgotPassword = passwordManager.requestPasswordReset(User, "User", "User")
const userResetPassword = passwordManager.resetPassword(User, "User")

module.exports = {
  userForgotPassword,
  userResetPassword,
}

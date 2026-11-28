const Organization = require("../Models/Organization")
const passwordManager = require("./passwordManager")

const organizationForgotPassword = passwordManager.requestPasswordReset(Organization, "Organization", "organization")
const organizationResetPassword = passwordManager.resetPassword(Organization, "Organization")

module.exports = {
  organizationForgotPassword,
  organizationResetPassword,
}

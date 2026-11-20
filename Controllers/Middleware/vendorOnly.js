const Organization = require("../../Models/Organization");

const vendorOnly = async (req, res, next) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(403).json({ error: "Only members of a Vendor organization can manage products" });
    }
    const org = await Organization.findById(req.user.organizationId);
    if (!org || org.organiationType !== "Vendor") {
      return res.status(403).json({ error: "Only members of a Vendor organization can manage products" });
    }
    if (org.isBanned) {
      return res.status(403).json({ error: "Your organization is not available" });
    }
    req.vendor = org;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = vendorOnly;
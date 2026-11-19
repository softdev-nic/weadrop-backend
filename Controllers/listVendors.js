const Organization = require("../../Models/Organization");
const handleError = require("../../Utils/HandleError");

const listVendors = async (req, res) => {
  try {
    const vendors = await Organization.find({ organiationType: "Vendor", isBanned: false })
      .select("companyName city state")
      .sort({ companyName: 1 })
      .lean();
    return res.status(200).json({ vendors });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = listVendors;
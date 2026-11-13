const bcrypt = require("bcryptjs");
const Organization = require("../Models/Organization"); 
const User = require("../Models/User")
const ORG_TYPES = ["Vendor", "Buyer", "Delivery Partner"];

const GST_REGEX = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const OrganizationRegister = async (req, res) => {
  try {
    const {
      companyName, organizationType, email, password, profileImage, gstNumber,
      addressLine1, addressLine2, city, state, postalCode,
    } = req.body;

    if (
      !companyName || !organizationType || !email || !password || !gstNumber ||
      !addressLine1 || !city || !state || !postalCode
    ) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    if (!ORG_TYPES.includes(organizationType)) {
      return res.status(400).json({ error: `Organization type must be one of: ${ORG_TYPES.join(", ")}` });
    }

    const gst = String(gstNumber).trim().toUpperCase();
    if (!GST_REGEX.test(gst)) {
      return res.status(400).json({ error: "Invalid GST number" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findById(req.user._id)
    
    if(!user){
        return res.status(400).json({error:"User not found"})
    }
    const existing = await Organization.findOne({
      $or: [{ email: normalizedEmail }, { gstNumber: gst }],
    });
    if (existing) {
      return res.status(400).json({
        error:
          existing.email === normalizedEmail
            ? "An organization with this email already exists"
            : "An organization with this GST number already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const organization = await Organization.create({
      companyName,
      organiationType: organizationType, 
      admin: req.user._id,
      email: normalizedEmail,
      password: hashed,
      profileImage,
      gstNumber: gst,
      addressLine1, addressLine2, city, state, postalCode
    
    });
    organization.members.push(user._id)

    user.organizationId = organization._id
    user.isAdmin = true
    user.organizationName = companyName
    await user.save()
    await organization.save()

 
    return res.status(201).json({
      message: "Organization registered.",
      organization: {
        id: organization._id,
        companyName: organization.companyName,
        organizationType: organization.organizationType,
        email: organization.email,
        isVerified: organization.isVerified,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "An organization with this email or GST number already exists" });
    }
    console.error("Organization registration failed:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = OrganizationRegister;
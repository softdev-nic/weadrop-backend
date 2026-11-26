const Dp = require("../Models/DeliveryPrtner");
const handleError = require("../Utils/HandleError");

const DPRegister = async (req, res) => {
  try {
    const { licenseNumber, vehicleType, vehicleNumber, profileImage } = req.body;

    const licence = String(licenseNumber || "").trim().toUpperCase();
    const vehicle = String(vehicleNumber || "").trim().toUpperCase();

    const conditions = [{ userId: req.user._id }, { licenseNumber: licence }];
    if (vehicle) conditions.push({ vehicleNumber: vehicle });

    const dpExists = await Dp.findOne({ $or: conditions });
    if (dpExists) {
      return res.status(409).json({ error: "Delivery partner already exists" });
    }

    const dp = await Dp.create({
      userId: req.user._id,
      licenseNumber: licence,
      vehicleType,
      vehicleNumber: vehicle,
      profileImage,
    });

    return res.status(201).json({ message: "Delivery partner registered", deliveryPartner: dp });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Delivery partner already exists" });
    }
    return handleError(res, error);
  }
};

module.exports = DPRegister;

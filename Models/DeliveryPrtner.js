 const mongoose = require("mongoose");

const VEHICLE_TYPES = ["Scooter", "Motorcycle", "Car", "Van"];
const DL_REGEX = /^[A-Z]{2}[0-9]{2}[ -]?(19|20)[0-9]{2}[0-9]{7}$/;

// GeoJSON point: [longitude, latitude]. Left unset until the partner shares a location,
// because the 2dsphere index rejects a Point without coordinates.
const PointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (c) => c.length === 2 && c[0] >= -180 && c[0] <= 180 && c[1] >= -90 && c[1] <= 90,
        message: "Location must be [longitude, latitude]",
      },
    },
  },
  { _id: false }
);

const DeliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiation",
      default: null,
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    licenseNumber: {
      type: String,
      required: [true, "Driving licence number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [DL_REGEX, "Enter a valid driving licence number, e.g. MH1220110012345"],
    },
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: [true, "Vehicle type is required"],
    },
    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    currentLocation: {
      type: PointSchema,
      default: undefined,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

DeliveryPartnerSchema.index({ currentLocation: "2dsphere" });
DeliveryPartnerSchema.index({ isAvailable: 1, isVerified: 1, isBanned: 1 });

DeliveryPartnerSchema.statics.VEHICLE_TYPES = VEHICLE_TYPES;

module.exports = mongoose.model("DeliveryPartner", DeliveryPartnerSchema);
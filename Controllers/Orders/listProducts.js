const mongoose = require("mongoose");
const Product = require("../../Models/Product");
const Organization = require("../../Models/Organization");
const handleError = require("../../Utils/HandleError");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listProducts = async (req, res) => {
  try {
    const { vendor, category, weather, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 24));

    const activeVendors = await Organization.find({ organiationType: "Vendor", isBanned: false }).distinct("_id");
    const filter = { isActive: true, vendor: { $in: activeVendors } };

    if (vendor) {
      if (!mongoose.isValidObjectId(vendor)) {
        return res.status(400).json({ error: "Invalid vendor id" });
      }
      filter.vendor = new mongoose.Types.ObjectId(vendor);
      if (!activeVendors.some((v) => v.equals(filter.vendor))) {
        return res.status(200).json({ products: [], page, total: 0 });
      }
    }
    if (category && Product.CATEGORIES.includes(category)) filter.category = category;
    if (weather && Product.WEATHER_TAGS.includes(weather)) filter.weatherTags = weather;
    if (q && String(q).trim()) {
      const re = new RegExp(escapeRegex(String(q).trim().slice(0, 50)), "i");
      filter.$or = [{ name: re }, { description: re }];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("vendor", "companyName city")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({ products, page, total });
  } catch (error) {
    return handleError(res, error);
  }
};

const getCatalogueOptions = (req, res) =>
  res.status(200).json({ categories: Product.CATEGORIES, weatherTags: Product.WEATHER_TAGS });

module.exports = { listProducts, getCatalogueOptions };
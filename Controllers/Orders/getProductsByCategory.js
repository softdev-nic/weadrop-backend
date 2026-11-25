const Product = require("../../Models/Product");
const Organization = require("../../Models/Organization");
const handleError = require("../../Utils/HandleError");

const getProductsByCategory = async (req, res) => {
  try {
    const requested = req.params.category.trim().toLowerCase();
    const category = Product.CATEGORIES.find((c) => c.toLowerCase() === requested);
    if (!category) {
      return res.status(400).json({ error: "Invalid category", categories: Product.CATEGORIES });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 24));

    const activeVendors = await Organization.find({ organiationType: "Vendor", isBanned: false }).distinct("_id");
    const filter = { isActive: true, category, vendor: { $in: activeVendors } };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("vendor", "companyName city")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({ category, products, page, total });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = getProductsByCategory;

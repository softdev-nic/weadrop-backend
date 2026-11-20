const Product = require("../../Models/Product");
const handleError = require("../../Utils/HandleError");

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.vendor._id }).sort({ updatedAt: -1 });
    return res.status(200).json({
      vendor: { _id: req.vendor._id, companyName: req.vendor.companyName },
      products,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = getMyProducts;
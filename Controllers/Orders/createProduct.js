const Product = require("../../Models/Product");
const handleError = require("../../Utils/HandleError");
const { cleanProductInput } = require("./productInput");

const createProduct = async (req, res) => {
  try {
    const data = cleanProductInput(req.body);
    const product = await Product.create({ ...data, vendor: req.vendor._id });
    return res.status(201).json({ message: "Product added", product });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = createProduct;
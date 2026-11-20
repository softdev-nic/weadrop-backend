const mongoose = require("mongoose");
const Product = require("../../Models/Product");
const handleError = require("../../Utils/HandleError");
const { cleanProductInput } = require("./productInput");

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const product = await Product.findOne({ _id: id, vendor: req.vendor._id });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.set(cleanProductInput(req.body, { partial: true }));
    await product.save();

    return res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = updateProduct;
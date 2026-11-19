const mongoose = require("mongoose");
const Order = require("../../Models/Order");
const handleError = require("../../Utils/HandleError");

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const order = await Order.findById(orderId).select("placedBy orderNumber total payment");
    if (!order || !order.placedBy.equals(req.user._id)) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json({
      orderNumber: order.orderNumber,
      total: order.total,
      method: order.payment.method,
      status: order.payment.status,
      paidAt: order.payment.paidAt || null,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = getPaymentStatus;